'use client';

import React, { useState, useRef } from 'react';
import { Archive, Star, Trash2, CornerUpLeft, Send, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useKeyboardShortcuts } from '../command-palette/useKeyboardShortcuts';

interface Email {
  gmail_id: string;
  thread_id: string;
  from_address: string;
  from_name: string;
  to_addresses: { address: string; name?: string }[];
  subject: string;
  body_html?: string;
  body_text?: string;
  is_starred: boolean;
  received_at: string;
}

interface EmailDetailProps {
  email: Email;
  onArchive: (id: string) => void;
  onToggleStar: (id: string, currentVal: boolean) => void;
  onDelete: (id: string) => void;
  onReply: (threadId: string, parentMessageId: string, to: string, subject: string, bodyHtml: string) => Promise<boolean>;
}

export function EmailDetail({
  email,
  onArchive,
  onToggleStar,
  onDelete,
  onReply,
}: EmailDetailProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcuts inside detail view
  useKeyboardShortcuts({
    r: () => {
      setIsReplying(true);
      setTimeout(() => replyInputRef.current?.focus(), 100);
    },
    Escape: () => {
      if (isReplying) {
        setIsReplying(false);
      }
    },
  });



  const handleSendReply = async () => {
    if (!replyBody.trim()) return;
    setIsSending(true);
    
    // We reply to the sender of the parent email
    const success = await onReply(
      email.thread_id,
      email.gmail_id,
      email.from_address,
      email.subject,
      `<div style="font-family: sans-serif; font-size: 14px; color: #111111;">
        <p>${replyBody.replace(/\n/g, '<br />')}</p>
       </div>`
    );

    setIsSending(false);
    if (success) {
      setSendSuccess(true);
      setReplyBody('');
      setTimeout(() => {
        setIsReplying(false);
        setSendSuccess(false);
      }, 1500);
    }
  };

  const formattedDate = format(new Date(email.received_at), 'MMMM d, yyyy h:mm a');

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary">
      {/* Top Header Actions */}
      <div className="h-12 border-b border-border-primary/40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onArchive(email.gmail_id)}
            className="p-1.5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
            title="Archive (e)"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStar(email.gmail_id, email.is_starred)}
            className={`p-1.5 rounded hover:bg-bg-hover text-text-muted hover:text-yellow-500 transition-colors ${
              email.is_starred ? 'text-yellow-500' : ''
            }`}
            title="Star (s)"
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={() => onDelete(email.gmail_id)}
            className="p-1.5 rounded hover:bg-bg-hover text-text-muted hover:text-accent-red transition-colors"
            title="Move to Trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            setIsReplying(true);
            setTimeout(() => replyInputRef.current?.focus(), 100);
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-bg-hover text-xs font-semibold rounded-lg text-text-secondary hover:text-text-primary transition-colors border border-border-primary hover:border-border-hover"
        >
          <CornerUpLeft className="w-3.5 h-3.5" />
          Reply <kbd className="text-text-dim text-[10px]">r</kbd>
        </button>
      </div>

      {/* Main Email Body Viewer */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
        {/* Email Header Info */}
        <div className="flex flex-col gap-2 border-b border-border-primary/20 pb-4">
          <h1 className="text-lg font-bold text-text-primary">{email.subject || '(No Subject)'}</h1>
          <div className="flex justify-between items-start text-xs text-text-muted">
            <div className="flex flex-col gap-1">
              <div>
                From:{' '}
                <span className="font-semibold text-text-secondary">
                  {email.from_name ? `${email.from_name} <${email.from_address}>` : email.from_address}
                </span>
              </div>
              <div>
                To:{' '}
                <span className="text-text-dim">
                  {email.to_addresses.map((t) => t.name || t.address).join(', ')}
                </span>
              </div>
            </div>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Render body HTML safely inside iframe */}
        <div className="flex-1 min-h-[300px] bg-bg-primary rounded-xl overflow-hidden border border-border-primary/40">
          <iframe
            title="Email Content"
            sandbox="allow-popups"
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                      font-size: 14px;
                      line-height: 1.6;
                      color: #d1d5db;
                      background-color: #050506;
                      margin: 20px;
                      word-wrap: break-word;
                    }
                    a {
                      color: #3b82f6;
                      text-decoration: none;
                    }
                    a:hover {
                      text-decoration: underline;
                    }
                    blockquote {
                      border-left: 3px solid #1a1a22;
                      padding-left: 12px;
                      color: #9ca3af;
                      margin-left: 0;
                    }
                    pre {
                      background-color: #111114;
                      padding: 10px;
                      border-radius: 6px;
                      overflow-x: auto;
                    }
                  </style>
                </head>
                <body>
                  ${email.body_html || email.body_text || '<p class="text-text-dim">No message body found.</p>'}
                </body>
              </html>
            `}
            className="w-full h-full border-none"
          />
        </div>

        {/* Inline Reply Composer */}
        {isReplying && (
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-4 flex flex-col gap-3 animate-fade-in mb-4">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Replying to {email.from_address}</span>
              <button
                onClick={() => setIsReplying(false)}
                className="text-text-dim hover:text-text-secondary"
              >
                Cancel <kbd className="ml-1 text-text-dim text-[10px]">Esc</kbd>
              </button>
            </div>
            
            <textarea
              ref={replyInputRef}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write your reply here..."
              rows={4}
              className="bg-transparent text-sm text-text-primary placeholder:text-text-dim focus:outline-none resize-none w-full"
            />

            <div className="flex justify-end items-center gap-3">
              <button
                onClick={handleSendReply}
                disabled={isSending || !replyBody.trim()}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  sendSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-accent-blue hover:bg-accent-blue-hover text-white disabled:opacity-50 disabled:pointer-events-none'
                }`}
              >
                {sendSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Sent!
                  </>
                ) : isSending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
