'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { EmailList } from '@/components/email/EmailList';
import { EmailDetail } from '@/components/email/EmailDetail';
import { ComposeModal } from '@/components/email/ComposeModal';
import { CalendarView } from '@/components/calendar/CalendarView';
import { EventModal } from '@/components/calendar/EventModal';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmailFolderTabs, type EmailFolder } from '@/components/email/EmailFolderTabs';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'inbox' | 'calendar' | 'auth'>('inbox');
  const [emailFolder, setEmailFolder] = useState<EmailFolder>('INBOX');
  const [emails, setEmailList] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [keywordQuery, setKeywordQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Unread count is tracked separately so folder switches don't affect the badge
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/emails?label=INBOX&limit=100');
      const data = await res.json();
      if (data.emails) {
        setUnreadCount(data.emails.filter((e: { is_read: boolean }) => !e.is_read).length);
      }
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, []);

  // Fetch cached data from DB on mount/view/folder change
  const fetchEmails = useCallback(async (folder: EmailFolder = emailFolder) => {
    try {
      const res = await fetch(`/api/emails?label=${folder}`);
      const data = await res.json();
      if (data.emails) {
        setEmailList(data.emails);
        setSelectedEmail((prev: any) => {
          if (data.emails.length > 0) {
            const stillVisible = prev && data.emails.some((e: any) => e.gmail_id === prev.gmail_id);
            return stillVisible ? prev : data.emails[0];
          }
          return null;
        });
      }
    } catch (err) {
      console.error('Failed to load emails:', err);
    }
  }, [emailFolder]);

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
      await Promise.all([fetchEmails(), fetchCalendar(), fetchUnreadCount()]);
      setIsLoading(false);
    };
    initFetch();
  }, [fetchEmails, fetchCalendar, fetchUnreadCount]);

  const handleFolderChange = useCallback((folder: EmailFolder) => {
    setEmailFolder(folder);
    setSelectedEmail(null);
    setKeywordQuery('');
    fetchEmails(folder);
  }, [fetchEmails]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchEmails(), fetchCalendar(), fetchUnreadCount()]);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayedEmails = emails.filter((email) => {
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
      if (emailFolder === 'INBOX') {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      await fetch(`/api/emails/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      });
    } catch (err) {
      console.error('Failed to archive:', err);
      fetchEmails();
      fetchUnreadCount();
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
      emailFolder={emailFolder}
      onNavigate={setCurrentView}
      onFolderChange={handleFolderChange}
      onCompose={() => setIsComposeOpen(true)}
      onSearchFocus={() => searchInputRef.current?.focus()}
      unreadCount={unreadCount}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    >
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-text-muted">Loading…</span>
        </div>
      ) : currentView === 'inbox' ? (
        /* Inbox Split View Layout */
        <div className="flex-grow flex h-full min-w-0">
          {/* Left Email List Column */}
          <div className="w-[420px] shrink-0 border-r border-border-primary/40 flex flex-col h-full bg-bg-secondary/15">
            <EmailFolderTabs activeFolder={emailFolder} onFolderChange={handleFolderChange} />
            <div className="p-4 border-b border-border-primary/40 flex items-center justify-between gap-4">
              <SearchBar
                inputRef={searchInputRef}
                onKeywordChange={setKeywordQuery}
              />
            </div>
            
            <EmailList
              emails={displayedEmails}
              folder={emailFolder}
              selectedEmailId={selectedEmail?.gmail_id || null}
              onSelectEmail={async (email) => {
                setSelectedEmail(email);
                try {
                  const res = await fetch(`/api/emails/${email.gmail_id}`);
                  const full = await res.json();
                  if (full.gmail_id) {
                    setSelectedEmail(full);
                  }
                } catch (err) {
                  console.error('Failed to load email detail:', err);
                }
                if (!email.is_read) {
                  fetch(`/api/emails/${email.gmail_id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'read', value: true }),
                  });
                  setEmailList((prev) =>
                    prev.map((e) => (e.gmail_id === email.gmail_id ? { ...e, is_read: true } : e))
                  );
                  if (emailFolder === 'INBOX') {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                  }
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
