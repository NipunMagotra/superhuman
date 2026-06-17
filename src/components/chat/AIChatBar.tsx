'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface AIChatBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatBar({ isOpen, onClose }: AIChatBarProps) {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-[400px] h-full border-l border-border-primary bg-[#0c0d10] flex flex-col shadow-2xl animate-slide-left z-40">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-primary/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-blue animate-pulse" />
          <span className="text-sm font-semibold text-text-primary">AI Command Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="text-text-dim hover:text-text-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-dim text-xs gap-3 max-w-md mx-auto text-center">
            <Bot className="w-8 h-8 text-accent-blue" />
            <div>
              <p className="font-semibold text-text-secondary mb-1">How can I help you today?</p>
              <p className="text-text-dim/80">
                You can ask me to draft emails, list upcoming events, search for specific messages, or schedule meetings.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <span className="px-2.5 py-1 bg-bg-tertiary border border-border-primary rounded-lg text-text-secondary">
                "What is my schedule for today?"
              </span>
              <span className="px-2.5 py-1 bg-bg-tertiary border border-border-primary rounded-lg text-text-secondary">
                "Draft a reply to Bob saying yes"
              </span>
            </div>
          </div>
        ) : (
          messages.map((message: any) => {
            const isUser = message.role === 'user';
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                    isUser
                      ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/25'
                      : 'bg-accent-red/10 text-accent-red border-accent-red/25'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble content */}
                <div className="flex flex-col gap-2">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-accent-blue/15 text-[#f8fafc] rounded-tr-none border border-accent-blue/25'
                        : 'bg-bg-tertiary text-text-secondary rounded-tl-none border border-border-primary'
                    }`}
                  >
                    {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                  </div>

                  {/* Tool call indicators */}
                  {message.toolInvocations && message.toolInvocations.length > 0 && (
                    <div className="flex flex-col gap-1.5 ml-2">
                      {message.toolInvocations.map((toolInvocation: any) => {
                        const { toolName, toolCallId, state } = toolInvocation;
                        return (
                          <div
                            key={toolCallId}
                            className="text-[10px] text-text-dim bg-bg-primary px-2.5 py-1 rounded-lg border border-border-primary/40 flex items-center gap-2 w-fit"
                          >
                            {state === 'result' ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            ) : (
                              <Loader2 className="w-3 h-3 animate-spin text-accent-blue" />
                            )}
                            <span>
                              {state === 'result' ? 'Finished' : 'Running'} tool:{' '}
                              <span className="font-mono text-text-secondary">{toolName}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="px-6 py-4 bg-bg-tertiary/40 border-t border-border-primary flex gap-3 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask AI command assistant..."
          className="bg-[#050506] border border-border-primary hover:border-border-hover focus:outline-none focus:border-accent-blue focus:shadow-[0_0_12px_rgba(37,99,235,0.1)] text-xs text-text-primary placeholder:text-text-dim rounded-xl px-4 py-2 flex-1 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-xl disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
