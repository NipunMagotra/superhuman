'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AIChatBar } from '../chat/AIChatBar';
import { CommandPalette } from '../command-palette/CommandPalette';
import { RefreshCw } from 'lucide-react';
import { useKeyboardShortcuts } from '../command-palette/useKeyboardShortcuts';
import { ThemeToggle } from '../ui/ThemeToggle';
import type { EmailFolder } from '../email/EmailFolderTabs';

const FOLDER_LABELS: Record<EmailFolder, string> = {
  INBOX: 'Inbox',
  SENT: 'Sent',
  ARCHIVED: 'Archived',
};

interface AppShellProps {
  children: React.ReactNode;
  currentView: 'inbox' | 'calendar' | 'auth';
  emailFolder?: EmailFolder;
  onNavigate: (view: 'inbox' | 'calendar' | 'auth') => void;
  onFolderChange?: (folder: EmailFolder) => void;
  onCompose: () => void;
  onSearchFocus: () => void;
  unreadCount?: number;
  onSync: () => Promise<void>;
  isSyncing?: boolean;
}

export function AppShell({
  children,
  currentView,
  emailFolder = 'INBOX',
  onNavigate,
  onFolderChange,
  onCompose,
  onSearchFocus,
  unreadCount = 0,
  onSync,
  isSyncing = false,
}: AppShellProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const goToInbox = () => {
    onNavigate('inbox');
    onFolderChange?.('INBOX');
  };

  const goToSent = () => {
    onNavigate('inbox');
    onFolderChange?.('SENT');
  };

  const goToArchived = () => {
    onNavigate('inbox');
    onFolderChange?.('ARCHIVED');
  };

  // Global keybinds for navigation
  useKeyboardShortcuts({
    'g+i': goToInbox,
    'g+t': goToSent,
    'g+a': goToArchived,
    'g+c': () => onNavigate('calendar'),
    'g+s': () => onNavigate('auth'),
    'c': () => onCompose(),
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary text-text-primary">
      {/* 1. Global Command Palette */}
      <CommandPalette
        onNavigate={onNavigate}
        onFolderChange={onFolderChange}
        onCompose={onCompose}
        onSearchFocus={onSearchFocus}
      />

      {/* 2. Global Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        unreadCount={unreadCount}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      {/* 3. Main Content Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar with sync and indicators */}
        <header className="h-12 px-6 border-b border-border-primary/40 flex items-center justify-between bg-bg-secondary/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Command Center
            </span>
            <span className="text-[11px] text-text-dim">
              {currentView === 'inbox'
                ? FOLDER_LABELS[emailFolder]
                : currentView === 'calendar'
                  ? 'Calendar'
                  : 'Settings'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 bg-bg-secondary hover:bg-bg-hover text-xs font-semibold text-text-secondary hover:text-text-primary rounded-lg border border-border-primary hover:border-border-hover transition-colors disabled:opacity-50 disabled:pointer-events-none active-press"
            >
              {isSyncing ? (
                'Syncing...'
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync
                </>
              )}
            </button>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 min-h-0 flex relative">
          {children}
        </main>

        {/* 4. Bottom AI Assistant Bar */}
        <AIChatBar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  );
}
