'use client';

import React from 'react';
import { Mail, Calendar, Settings, Sparkles, Keyboard, Command } from 'lucide-react';

interface SidebarProps {
  currentView: 'inbox' | 'calendar' | 'auth';
  onNavigate: (view: 'inbox' | 'calendar' | 'auth') => void;
  unreadCount?: number;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

export function Sidebar({
  currentView,
  onNavigate,
  unreadCount = 0,
  onToggleChat,
  isChatOpen = false,
}: SidebarProps) {
  return (
    <aside className="w-16 h-screen flex flex-col items-center py-6 bg-bg-secondary border-r border-border-primary justify-between">
      {/* Upper Section (Brand / Logo) */}
      <div className="flex flex-col items-center gap-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-red to-accent-blue p-0.5 flex items-center justify-center shadow-lg shadow-accent-blue/20">
          <div className="w-full h-full bg-bg-secondary rounded-[6px] flex items-center justify-center">
            <Command className="w-4 h-4 text-accent-blue" />
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex flex-col gap-6">
          {/* Inbox Button */}
          <button
            onClick={() => onNavigate('inbox')}
            className={`relative p-2.5 rounded-xl transition-all duration-200 group ${
              currentView === 'inbox'
                ? 'bg-bg-hover text-accent-blue'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
            }`}
            title="Inbox (g i)"
          >
            <Mail className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold bg-accent-red text-white rounded-full flex items-center justify-center border border-bg-secondary">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {/* Keyboard shortcut hint */}
            <span className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-bg-tertiary text-text-secondary text-xs rounded border border-border-primary opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Inbox <kbd className="ml-1 text-text-dim text-[10px]">g i</kbd>
            </span>
          </button>

          {/* Calendar Button */}
          <button
            onClick={() => onNavigate('calendar')}
            className={`relative p-2.5 rounded-xl transition-all duration-200 group ${
              currentView === 'calendar'
                ? 'bg-bg-hover text-accent-red'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
            }`}
            title="Calendar (g c)"
          >
            <Calendar className="w-5 h-5" />
            <span className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-bg-tertiary text-text-secondary text-xs rounded border border-border-primary opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Calendar <kbd className="ml-1 text-text-dim text-[10px]">g c</kbd>
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => onNavigate('auth')}
            className={`relative p-2.5 rounded-xl transition-all duration-200 group ${
              currentView === 'auth'
                ? 'bg-bg-hover text-text-primary'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
            }`}
            title="Connections (g s)"
          >
            <Settings className="w-5 h-5" />
            <span className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-bg-tertiary text-text-secondary text-xs rounded border border-border-primary opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Settings <kbd className="ml-1 text-text-dim text-[10px]">g s</kbd>
            </span>
          </button>
        </nav>
      </div>

      {/* Lower Section (AI Assistant Toggle & Keyboard Info) */}
      <div className="flex flex-col gap-6 items-center">
        {onToggleChat && (
          <button
            onClick={onToggleChat}
            className={`relative p-2.5 rounded-xl transition-all duration-200 group ${
              isChatOpen
                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover border border-transparent'
            }`}
            title="AI Chat"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-bg-tertiary text-text-secondary text-xs rounded border border-border-primary opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              AI Command Assistant
            </span>
          </button>
        )}

        <div className="relative group p-2.5 text-text-dim cursor-help hover:text-text-secondary rounded-xl hover:bg-bg-hover">
          <Keyboard className="w-5 h-5" />
          <div className="absolute left-16 bottom-0 ml-2 p-3 bg-bg-tertiary border border-border-primary rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl z-50 min-w-44 text-xs flex flex-col gap-2">
            <span className="font-semibold text-text-primary border-b border-border-primary pb-1">Shortcuts</span>
            <div className="flex justify-between"><span>Compose</span><kbd className="text-text-dim">c</kbd></div>
            <div className="flex justify-between"><span>Archive</span><kbd className="text-text-dim">e</kbd></div>
            <div className="flex justify-between"><span>Reply</span><kbd className="text-text-dim">r</kbd></div>
            <div className="flex justify-between"><span>Star</span><kbd className="text-text-dim">s</kbd></div>
            <div className="flex justify-between"><span>Command Menu</span><kbd className="text-text-dim">⌘K</kbd></div>
            <div className="flex justify-between"><span>Semantic Search</span><kbd className="text-text-dim">/</kbd></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
