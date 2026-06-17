'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, Check } from 'lucide-react';
import { useKeyboardShortcuts } from '../command-palette/useKeyboardShortcuts';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (to: string, subject: string, bodyHtml: string) => Promise<boolean>;
}

export function ComposeModal({ isOpen, onClose, onSend }: ComposeModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const toInputRef = useRef<HTMLInputElement>(null);

  // Focus to field when opening
  useEffect(() => {
    toInputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setIsSending(true);

    const formattedBody = `<div style="font-family: sans-serif; font-size: 14px; color: #111111;">
      ${body.replace(/\n/g, '<br />')}
    </div>`;

    const success = await onSend(to, subject, formattedBody);
    setIsSending(false);
    
    if (success) {
      setSendSuccess(true);
      setTimeout(() => {
        onClose();
        setSendSuccess(false);
      }, 1200);
    }
  };

  // Bind Ctrl+Enter or Cmd+Enter to send email
  useKeyboardShortcuts({
    'ctrl+enter': () => {
      if (isOpen) {
        handleSubmit();
      }
    },
    'cmd+enter': () => {
      if (isOpen) {
        handleSubmit();
      }
    },
    Escape: () => {
      if (isOpen) {
        onClose();
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-[#0b0c0f] border border-[#2563eb]/15 rounded-xl overflow-hidden shadow-2xl flex flex-col shadow-[0_0_20px_rgba(37,99,235,0.06)] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-primary/40 flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">New Message</span>
          <button 
            onClick={onClose}
            className="text-text-dim hover:text-text-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col">
          <div className="px-6 py-2.5 border-b border-border-primary/20 flex items-center gap-3">
            <span className="text-xs text-text-dim w-12">To:</span>
            <input
              ref={toInputRef}
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipients@example.com"
              className="bg-transparent text-sm text-text-primary placeholder:text-text-dim focus:outline-none w-full"
            />
          </div>

          <div className="px-6 py-2.5 border-b border-border-primary/20 flex items-center gap-3">
            <span className="text-xs text-text-dim w-12">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              className="bg-transparent text-sm text-text-primary placeholder:text-text-dim focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Body Text Area */}
        <div className="p-6 flex-1 min-h-[200px]">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email here... (Press Ctrl+Enter to send)"
            rows={8}
            className="bg-transparent text-sm text-text-primary placeholder:text-text-dim focus:outline-none resize-none w-full h-full"
          />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-bg-tertiary/60 border-t border-border-primary/40 flex justify-between items-center text-xs text-text-dim">
          <span>
            Shortcut: <kbd className="text-text-dim">Ctrl+Enter</kbd> to send
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 hover:bg-bg-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSending || !to.trim() || !subject.trim() || !body.trim()}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-white transition-all duration-200 ${
                sendSuccess
                  ? 'bg-green-600'
                  : 'bg-accent-blue hover:bg-accent-blue-hover disabled:opacity-50 disabled:pointer-events-none'
              }`}
            >
              {sendSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Sent!
                </>
              ) : isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
