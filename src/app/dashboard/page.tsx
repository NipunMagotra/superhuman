'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { EmailList } from '@/components/email/EmailList';
import { EmailDetail } from '@/components/email/EmailDetail';
import { ComposeModal } from '@/components/email/ComposeModal';
import { CalendarView } from '@/components/calendar/CalendarView';
import { EventModal } from '@/components/calendar/EventModal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'inbox' | 'calendar' | 'auth'>('inbox');
  const [emails, setEmailList] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  useEffect(() => {
    if (currentView === 'auth') {
      router.push('/auth');
    }
  }, [currentView, router]);
  
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<any | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date>(new Date());

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Search states
  const [keywordQuery, setKeywordQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<any[] | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Unread email count
  const unreadCount = emails.filter((e) => !e.is_read).length;

  // 1. Fetch cached data from DB on mount/view change
  const fetchEmails = useCallback(async () => {
    try {
      const res = await fetch('/api/emails');
      const data = await res.json();
      if (data.emails) {
        setEmailList(data.emails);
        // Default select first email if none selected
        setSelectedEmail((prev: any) => {
          if (data.emails.length > 0 && !prev) {
            return data.emails[0];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to load emails:', err);
    }
  }, []);

  const fetchCalendar = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (data.events) {
        setCalendarEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    }
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      setIsLoading(true);
      await Promise.all([fetchEmails(), fetchCalendar()]);
      setIsLoading(false);
    };
    initFetch();
  }, [fetchEmails, fetchCalendar]);

  // Sync action trigger
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // 1. Sync emails
      const emailRes = await fetch('/api/emails/sync', { method: 'POST' });
      await emailRes.json();
      
      // 2. Refetch emails & calendar
      await Promise.all([fetchEmails(), fetchCalendar()]);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Filter emails by active search state
  const displayedEmails = semanticResults !== null
    ? semanticResults
    : emails.filter((email) => {
        const query = keywordQuery.toLowerCase();
        return (
          email.subject?.toLowerCase().includes(query) ||
          email.from_name?.toLowerCase().includes(query) ||
          email.from_address?.toLowerCase().includes(query) ||
          email.snippet?.toLowerCase().includes(query)
        );
      });

  // 3. Handlers for Email Actions
  const handleArchive = async (id: string) => {
    try {
      // Optimistic update
      setEmailList((prev) => prev.filter((e) => e.gmail_id !== id));
      if (selectedEmail?.gmail_id === id) {
        setSelectedEmail(null);
      }

      await fetch(`/api/emails/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      });
    } catch (err) {
      console.error('Failed to archive:', err);
      fetchEmails(); // rollback
    }
  };

  const handleToggleStar = async (id: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      // Optimistic update
      setEmailList((prev) =>
        prev.map((e) => (e.gmail_id === id ? { ...e, is_starred: newVal } : e))
      );
      if (selectedEmail?.gmail_id === id) {
        setSelectedEmail((prev: any) => ({ ...prev, is_starred: newVal }));
      }

      await fetch(`/api/emails/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'star', value: newVal }),
      });
    } catch (err) {
      console.error('Failed to toggle star:', err);
      fetchEmails();
    }
  };

  const handleDeleteEmail = async (id: string) => {
    try {
      // Optimistic update
      setEmailList((prev) => prev.filter((e) => e.gmail_id !== id));
      if (selectedEmail?.gmail_id === id) {
        setSelectedEmail(null);
      }

      await fetch(`/api/emails/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete email:', err);
      fetchEmails();
    }
  };

  const handleSendEmail = async (to: string, subject: string, bodyHtml: string) => {
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, bodyHtml }),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to send email:', err);
      return false;
    }
  };

  const handleReplyEmail = async (
    threadId: string,
    parentMessageId: string,
    to: string,
    subject: string,
    bodyHtml: string
  ) => {
    try {
      const res = await fetch(`/api/emails/${parentMessageId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, to, subject, bodyHtml }),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to reply:', err);
      return false;
    }
  };

  // 4. Handlers for Calendar Actions
  const handleSaveEvent = async (eventData: any) => {
    try {
      const url = selectedCalendarEvent?.gcal_id
        ? `/api/calendar/${selectedCalendarEvent.gcal_id}`
        : '/api/calendar';
      const method = selectedCalendarEvent?.gcal_id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        await fetchCalendar();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to save event:', err);
      return false;
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchCalendar();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete event:', err);
      return false;
    }
  };

  // Redirect to separate page for connections settings if clicked
  if (currentView === 'auth') {
    return null;
  }

  return (
    <AppShell
      currentView={currentView}
      onNavigate={setCurrentView}
      onCompose={() => setIsComposeOpen(true)}
      onSearchFocus={() => searchInputRef.current?.focus()}
      unreadCount={unreadCount}
      onSync={handleSync}
      isSyncing={isSyncing}
    >
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        </div>
      ) : currentView === 'inbox' ? (
        /* Inbox Split View Layout */
        <div className="flex-grow flex h-full min-w-0">
          {/* Left Email List Column */}
          <div className="w-[420px] shrink-0 border-r border-border-primary/40 flex flex-col h-full bg-bg-secondary/15">
            <div className="p-4 border-b border-border-primary/40 flex items-center justify-between gap-4">
              <SearchBar
                inputRef={searchInputRef}
                onKeywordChange={setKeywordQuery}
                onSemanticResults={setSemanticResults}
              />
            </div>
            
            <EmailList
              emails={displayedEmails}
              selectedEmailId={selectedEmail?.gmail_id || null}
              onSelectEmail={(email) => {
                setSelectedEmail(email);
                // Mark email read in background
                if (!email.is_read) {
                  fetch(`/api/emails/${email.gmail_id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'read', value: true }),
                  });
                  setEmailList((prev) =>
                    prev.map((e) => (e.gmail_id === email.gmail_id ? { ...e, is_read: true } : e))
                  );
                }
              }}
              onToggleStar={handleToggleStar}
              onArchive={handleArchive}
              onDelete={handleDeleteEmail}
            />
          </div>

          {/* Right Email Reader Column */}
          <div className="flex-grow min-w-0 h-full">
            {selectedEmail ? (
              <EmailDetail
                key={selectedEmail.gmail_id}
                email={selectedEmail}
                onArchive={handleArchive}
                onToggleStar={handleToggleStar}
                onDelete={handleDeleteEmail}
                onReply={handleReplyEmail}
              />
            ) : (
              <div className="flex-grow flex items-center justify-center text-text-dim text-sm h-full">
                No email selected. Press J/K keys to navigate.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Calendar Dashboard Timeline view */
        <div className="flex-1 min-w-0 h-full">
          <CalendarView
            events={calendarEvents}
            onCreateEvent={(date) => {
              setSelectedDateForEvent(date);
              setSelectedCalendarEvent(null);
              setIsEventModalOpen(true);
            }}
            onEditEvent={(event) => {
              setSelectedCalendarEvent(event);
              setIsEventModalOpen(true);
            }}
          />
        </div>
      )}

      {/* 5. Composes overlay overlays */}
      {isComposeOpen && (
        <ComposeModal
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          onSend={handleSendEmail}
        />
      )}

      {isEventModalOpen && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          event={selectedCalendarEvent}
          selectedDate={selectedDateForEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </AppShell>
  );
}
