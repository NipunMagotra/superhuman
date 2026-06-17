'use client';

import React from 'react';
import { Inbox, Send, Archive } from 'lucide-react';

export type EmailFolder = 'INBOX' | 'SENT' | 'ARCHIVED';

interface EmailFolderTabsProps {
  activeFolder: EmailFolder;
  onFolderChange: (folder: EmailFolder) => void;
}

const FOLDERS: { id: EmailFolder; label: string; icon: React.ElementType; shortcut: string }[] = [
  { id: 'INBOX', label: 'Inbox', icon: Inbox, shortcut: 'g i' },
  { id: 'SENT', label: 'Sent', icon: Send, shortcut: 'g t' },
  { id: 'ARCHIVED', label: 'Archived', icon: Archive, shortcut: 'g a' },
];

export function EmailFolderTabs({ activeFolder, onFolderChange }: EmailFolderTabsProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border-primary/40 bg-bg-secondary/10">
      {FOLDERS.map(({ id, label, icon: Icon, shortcut }) => {
        const isActive = activeFolder === id;
        return (
          <button
            key={id}
            onClick={() => onFolderChange(id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active-press group ${
              isActive
                ? 'bg-bg-hover text-accent-blue border border-accent-blue/30'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover border border-transparent'
            }`}
            title={`${label} (${shortcut})`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-bg-tertiary text-text-secondary text-[10px] rounded border border-border-primary opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              <kbd className="text-text-dim">{shortcut}</kbd>
            </span>
          </button>
        );
      })}
    </div>
  );
}
