'use client';

import React, { useState } from 'react';
import { Command } from 'cmdk';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { Mail, Calendar, Settings, Edit, Search, Send, Archive } from 'lucide-react';
import type { EmailFolder } from '../email/EmailFolderTabs';

interface CommandPaletteProps {
  onNavigate: (view: 'inbox' | 'calendar' | 'auth') => void;
  onFolderChange?: (folder: EmailFolder) => void;
  onCompose: () => void;
  onSearchFocus: () => void;
}

export function CommandPalette({ onNavigate, onFolderChange, onCompose, onSearchFocus }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  // Toggle palette with Ctrl+K / Cmd+K
  useKeyboardShortcuts({
    'ctrl+k': () => setOpen((o) => !o),
    'meta+k': () => setOpen((o) => !o),
  });

  const runCommand = (cmd: () => void) => {
    cmd();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div 
        className="w-full max-w-[640px]" 
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Palette">
          <Command.Input placeholder="Type a command or search..." autoFocus />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Navigation">
              <Command.Item onSelect={() => runCommand(() => {
                onNavigate('inbox');
                onFolderChange?.('INBOX');
              })}>
                <Mail className="w-4 h-4 mr-2 text-accent-blue" />
                <span>Go to Inbox</span>
                <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-primary text-text-dim">g i</kbd>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => {
                onNavigate('inbox');
                onFolderChange?.('SENT');
              })}>
                <Send className="w-4 h-4 mr-2 text-accent-blue" />
                <span>Go to Sent</span>
                <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-primary text-text-dim">g t</kbd>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => {
                onNavigate('inbox');
                onFolderChange?.('ARCHIVED');
              })}>
                <Archive className="w-4 h-4 mr-2 text-text-muted" />
                <span>Go to Archived</span>
                <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-primary text-text-dim">g a</kbd>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => onNavigate('calendar'))}>
                <Calendar className="w-4 h-4 mr-2 text-accent-red" />
                <span>Go to Calendar</span>
                <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-primary text-text-dim">g c</kbd>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => onNavigate('auth'))}>
                <Settings className="w-4 h-4 mr-2 text-text-muted" />
                <span>Go to Connection Settings</span>
                <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-primary text-text-dim">g s</kbd>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Quick Actions">
              <Command.Item onSelect={() => runCommand(onCompose)}>
                <Edit className="w-4 h-4 mr-2 text-accent-blue" />
                <span>Compose New Email</span>
                <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-primary text-text-dim">c</kbd>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(onSearchFocus)}>
                <Search className="w-4 h-4 mr-2 text-accent-red" />
                <span>Focus Search</span>
                <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-primary text-text-dim">/</kbd>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
