'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AIChatBar } from '../chat/AIChatBar';
import { CommandPalette } from '../command-palette/CommandPalette';
import { Loader2, RefreshCw, Radio } from 'lucide-react';
import { useKeyboardShortcuts } from '../command-palette/useKeyboardShortcuts';

interface AppShellProps {
  children: React.ReactNode;
  currentView: 'inbox' | 'calendar' | 'auth';
  onNavigate: (view: 'inbox' | 'calendar' | 'auth') => void;
  onCompose: () => void;
  onSearchFocus: () => void;
  unreadCount?: number;
  onSync: () => Promise<void>;
  isSyncing?: boolean;
}

export function AppShell({
  children,
  currentView,
  onNavigate,
  onCompose,
  onSearchFocus,
  unreadCount = 0,
  onSync,
  isSyncing = false,
}: AppShellProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Global keybinds for navigation
  useKeyboardShortcuts({
    'g+i': () => onNavigate('inbox'),
    'g+c': () => onNavigate('calendar'),
    'g+s': () => onNavigate('auth'),
    'c': () => onCompose(),
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary text-text-primary">
      {/* 1. Global Command Palette */}
      <CommandPalette
        onNavigate={onNavigate}
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
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Command Center
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-semibold">
              <Radio className="w-3 h-3 animate-pulse" />
              Live Webhooks
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1 bg-bg-secondary hover:bg-bg-hover text-xs font-semibold text-text-secondary hover:text-text-primary rounded-lg border border-border-primary hover:border-border-hover transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Syncing...
                </>
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
