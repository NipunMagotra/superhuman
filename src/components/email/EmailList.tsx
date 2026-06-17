'use client';

import React, { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Star, Archive, Trash2 } from 'lucide-react';
import { useKeyboardShortcuts } from '../command-palette/useKeyboardShortcuts';

interface Email {
  id: string;
  gmail_id: string;
  thread_id: string;
  from_address: string;
  from_name: string;
  subject: string;
  snippet: string;
  is_read: boolean;
  is_starred: boolean;
  priority_score: number;
  received_at: string;
}

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
  onToggleStar: (id: string, currentVal: boolean) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
  onToggleStar,
  onArchive,
  onDelete,
}: EmailListProps) {
  const selectedIndex = emails.findIndex((e) => e.gmail_id === selectedEmailId);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: navigation inside the list
  useKeyboardShortcuts({
    j: () => {
      if (emails.length === 0) return;
      const nextIdx = selectedIndex === -1 ? 0 : Math.min(emails.length - 1, selectedIndex + 1);
      onSelectEmail(emails[nextIdx]);
    },
    k: () => {
      if (emails.length === 0) return;
      const prevIdx = selectedIndex === -1 ? 0 : Math.max(0, selectedIndex - 1);
      onSelectEmail(emails[prevIdx]);
    },
    s: () => {
      // Star current active email
      if (selectedIndex !== -1) {
        const active = emails[selectedIndex];
        onToggleStar(active.gmail_id, active.is_starred);
      }
    },
    e: () => {
      // Archive current active email
      if (selectedIndex !== -1) {
        onArchive(emails[selectedIndex].gmail_id);
      }
    },
  }, { preventDefault: true });

  // Scroll active item into view
  useEffect(() => {
    if (selectedIndex !== -1 && containerRef.current) {
      const activeElement = containerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto divide-y divide-border-primary/40">
      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-text-dim text-sm gap-2">
          <span>No emails in this view</span>
          <span className="text-xs text-text-dim/60">Press &apos;c&apos; to compose or wait for sync</span>
        </div>
      ) : (
        emails.map((email, idx) => {
          const isSelected = email.gmail_id === selectedEmailId;
          const isHighPriority = email.priority_score >= 0.7;

          return (
            <div
              key={email.gmail_id}
              data-index={idx}
              onClick={() => onSelectEmail(email)}
              className={`flex items-start gap-4 p-4 cursor-pointer select-none transition-all duration-150 border-l-2 group ${
                isSelected
                  ? 'bg-bg-hover/80 border-l-accent-blue shadow-inner'
                  : 'hover:bg-bg-hover/30 border-l-transparent'
              }`}
            >
              {/* Star & Priority Indicator */}
              <div className="flex flex-col items-center gap-2 mt-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(email.gmail_id, email.is_starred);
                  }}
                  className={`p-1 rounded hover:bg-bg-hover text-text-dim hover:text-yellow-500 transition-colors ${
                    email.is_starred ? 'text-yellow-500' : ''
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
                {isHighPriority && (
                  <span 
                    className="w-2 h-2 rounded-full bg-accent-red animate-pulse" 
                    title={`Priority: ${Math.round(email.priority_score * 100)}%`}
                  />
                )}
              </div>

              {/* Sender & Email Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span
                    className={`text-sm truncate mr-4 ${
                      email.is_read ? 'text-text-secondary font-medium' : 'text-text-primary font-bold'
                    }`}
                  >
                    {email.from_name || email.from_address}
                  </span>
                  <span className="text-xs text-text-dim whitespace-nowrap">
                    {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
                  </span>
                </div>

                <div
                  className={`text-sm truncate mb-1 ${
                    email.is_read ? 'text-text-secondary' : 'text-text-primary font-medium'
                  }`}
                >
                  {email.subject || '(No Subject)'}
                </div>

                <p className="text-xs text-text-dim truncate line-clamp-1">
                  {email.snippet}
                </p>
              </div>

              {/* Hover Quick Actions */}
              <div className="hidden group-hover:flex items-center gap-1">
                {/* Archive */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(email.gmail_id);
                  }}
                  className="p-1.5 rounded bg-bg-tertiary border border-border-primary hover:text-accent-blue"
                  title="Archive"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
                {/* Trash */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(email.gmail_id);
                  }}
                  className="p-1.5 rounded bg-bg-tertiary border border-border-primary hover:text-accent-red"
                  title="Move to Trash"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
