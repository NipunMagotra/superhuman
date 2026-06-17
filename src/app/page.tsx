'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState<string | null>(null);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);
  const [mockComposeOpen, setMockComposeOpen] = useState(false);
  const [mockSearchOpen, setMockSearchOpen] = useState(false);
  const [mockSearchQuery, setMockSearchQuery] = useState('');

  const flashShortcut = useCallback((keyChar: string) => {
    setActiveShortcut(keyChar.toUpperCase());
    setTimeout(() => setActiveShortcut(null), 450);
  }, []);

  const triggerRedirect = useCallback((path: string, keyChar: string) => {
    flashShortcut(keyChar);
    setRedirecting(path === '/dashboard' ? 'Command Center' : 'Integrations Panel');
    setTimeout(() => {
      router.push(path);
    }, 700);
  }, [router, flashShortcut]);

  // Global key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        if (e.key === 'Escape') {
          e.preventDefault();
          (document.activeElement as HTMLElement).blur();
          setMockSearchOpen(false);
        }
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'd' || key === 'l') {
        e.preventDefault();
        triggerRedirect('/dashboard', 'd');
      } else if (key === 'i' || key === 'a') {
        e.preventDefault();
        triggerRedirect('/auth', 'i');
      } else if (key === 'c') {
        e.preventDefault();
        flashShortcut('c');
        setMockComposeOpen(true);
      } else if (key === '/') {
        e.preventDefault();
        flashShortcut('/');
        setMockSearchOpen(true);
        setTimeout(() => {
          document.getElementById('mock-search-input')?.focus();
        }, 50);
      } else if (key === 'escape') {
        e.preventDefault();
        setMockComposeOpen(false);
        setMockSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerRedirect, flashShortcut]);

  const mockSearchResults = [
    { id: '1', title: 'Product Launch Update', desc: 'Urgent meeting schedule with Google...', score: '0.98 Match' },
    { id: '2', title: 'Flight Reservation details', desc: 'Confirm status for flight ticket booking...', score: '0.87 Match' },
    { id: '3', title: 'Calendar Sync Error Resolved', desc: 'We have configured Corsair token refresh...', score: '0.76 Match' }
  ].filter(item => 
    !mockSearchQuery || 
    item.title.toLowerCase().includes(mockSearchQuery.toLowerCase()) || 
    item.desc.toLowerCase().includes(mockSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070708] text-[#f8fafc] font-sans antialiased flex flex-col justify-between selection:bg-[#2563eb]/20 selection:text-white relative">
      
      {/* Editorial Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:6rem_6rem] pointer-events-none" />

      {/* Subtle border indicator for Superman Accent Theme */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2563eb] to-[#dc2626] opacity-60" />

      {/* Navigation */}
      <header className="w-full max-w-5xl mx-auto px-8 h-24 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-[0.25em] text-[#94a3b8] uppercase font-semibold">
            CLEARLYY // CC
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => triggerRedirect('/auth', 'i')} 
            className="font-mono text-[11px] tracking-wider text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
          >
            INTEGRATIONS <kbd className="ml-1 text-[9px] text-[#64748b] bg-[#111113] border border-[#334155]/20 px-1 py-0.5 rounded font-sans">I</kbd>
          </button>
          <button 
            onClick={() => triggerRedirect('/dashboard', 'd')} 
            className="font-mono text-[11px] tracking-wider text-[#f8fafc] border border-[#334155] hover:border-[#f8fafc] px-4 py-2 bg-[#0d0e11] hover:bg-[#16171b] transition-all duration-200 cursor-pointer"
          >
            LAUNCH CLIENT <kbd className="ml-1 text-[9px] text-[#64748b] bg-[#111113] border border-[#334155]/20 px-1 py-0.5 rounded font-sans">D</kbd>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-8 py-16 relative z-30 w-full">
        
        {/* Editorial Subtitle */}
        <div className="font-mono text-[10px] tracking-[0.3em] text-[#3b82f6] uppercase mb-8 select-none">
          K E Y B O A R D - F I R S T  //  A I - A S S I S T E D
        </div>

        {/* Stark Typography Title */}
        <h1 className="text-5xl md:text-7xl font-light tracking-tight text-center leading-[1.05] text-[#f8fafc] max-w-3xl mb-8">
          Speed is a feature.
        </h1>

        <p className="text-sm md:text-base text-[#94a3b8] max-w-xl text-center leading-relaxed font-light mb-12">
          A high-speed client for Gmail and Calendar. Designed for power users, optimized for keyboard shortcuts, and integrated with Supabase pgvector search.
        </p>

        {/* Action triggers */}
        <div className="flex items-center gap-4 mb-20">
          <button
            onClick={() => triggerRedirect('/dashboard', 'd')}
            className="px-8 py-3.5 bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#070708] text-xs tracking-wider font-mono uppercase font-semibold transition-colors shadow-xl cursor-pointer"
          >
            Enter Workspace [D]
          </button>
          
          <button
            onClick={() => triggerRedirect('/auth', 'i')}
            className="px-8 py-3.5 border border-[#334155] hover:border-[#f8fafc] text-[#f8fafc] text-xs tracking-wider font-mono uppercase transition-colors cursor-pointer"
          >
            Settings [I]
          </button>
        </div>

        {/* Clean Terminal Interface Mockup */}
        <div className="w-full max-w-3xl bg-[#0b0c0f] border border-[#1e293b]/60 rounded-xl overflow-hidden shadow-2xl relative">
          
          {/* Terminal Window Header */}
          <div className="h-10 bg-[#0d0f13] border-b border-[#1e293b]/40 px-5 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider text-[#64748b]">
              TERMINAL // CLIENT_PREVIEW.SH
            </span>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b]" />
            </div>
          </div>

          {/* Interactive instruction list */}
          <div className="p-8 font-mono text-[11px] leading-relaxed text-[#94a3b8] flex flex-col gap-5">
            <div className="text-[#64748b] border-b border-[#1e293b]/20 pb-3 mb-2">
              Press any of the following keys to preview action panels immediately:
            </div>
            
            <div 
              onClick={() => setMockComposeOpen(true)}
              className="flex justify-between items-center py-2 px-3 border border-transparent hover:border-[#2563eb]/20 hover:bg-[#0e1014] rounded-lg cursor-pointer transition-all"
            >
              <span className="flex items-center gap-3">
                <kbd className="w-6 h-6 bg-[#070708] border border-[#334155]/40 rounded flex items-center justify-center font-bold text-[#f8fafc]">C</kbd>
                <span>COMPOSE MOCK DRAFT</span>
              </span>
              <span className="text-[#64748b]">Local Compose Modal</span>
            </div>

            <div 
              onClick={() => {
                setMockSearchOpen(true);
                setTimeout(() => document.getElementById('mock-search-input')?.focus(), 100);
              }}
              className="flex justify-between items-center py-2 px-3 border border-transparent hover:border-[#dc2626]/20 hover:bg-[#0e1014] rounded-lg cursor-pointer transition-all"
            >
              <span className="flex items-center gap-3">
                <kbd className="w-6 h-6 bg-[#070708] border border-[#334155]/40 rounded flex items-center justify-center font-bold text-[#f8fafc]">/</kbd>
                <span>RUN SEMANTIC VECTOR SEARCH</span>
              </span>
              <span className="text-[#64748b]">pgvector Cosine Search</span>
            </div>
          </div>
        </div>

      </main>

      {/* Floating Redirect Indicator */}
      {redirecting && (
        <div className="fixed inset-0 bg-[#070708]/95 z-50 flex flex-col items-center justify-center animate-fade-in font-mono">
          <div className="w-10 h-10 border border-[#334155] border-t-[#f8fafc] animate-spin mb-4" />
          <span className="text-[10px] tracking-[0.2em] text-[#94a3b8] uppercase">
            CONNECTING TO {redirecting}...
          </span>
        </div>
      )}

      {/* Floating Key Toast Notification */}
      {activeShortcut && (
        <div className="fixed bottom-12 right-12 bg-[#0b0c0f] text-[#f8fafc] px-4 py-3 border border-[#334155] shadow-2xl flex items-center gap-3 font-mono text-[10px] tracking-wider animate-slide-up z-50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-ping" />
          HOTKEY: <kbd className="px-1.5 py-0.5 bg-[#16171b] border border-[#334155] rounded font-bold text-[#f8fafc]">{activeShortcut}</kbd>
        </div>
      )}

      {/* 1. CLEAN MOCKUP COMPOSE MODAL */}
      {mockComposeOpen && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in font-mono">
          <div className="w-full max-w-lg bg-[#0b0c0f] border border-[#334155] shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#0d0f13] px-5 py-3.5 border-b border-[#1e293b]/40 flex justify-between items-center text-[10px] tracking-wider">
              <span className="text-[#f8fafc]">DRAFT // OUTBOX</span>
              <button 
                onClick={() => setMockComposeOpen(false)}
                className="text-[#64748b] hover:text-[#f8fafc] flex items-center gap-1.5"
              >
                CLOSE <kbd className="px-1 bg-[#16171b] border border-[#334155]/60 rounded text-[9px]">ESC</kbd>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-[11px]">
              <div className="flex border-b border-[#1e293b]/25 pb-2.5">
                <span className="text-[#64748b] w-12 shrink-0">TO:</span>
                <input 
                  type="text" 
                  className="bg-transparent text-[#f8fafc] outline-none w-full"
                  defaultValue="poweruser@clearlyy.com"
                />
              </div>
              <div className="flex border-b border-[#1e293b]/25 pb-2.5">
                <span className="text-[#64748b] w-12 shrink-0">SUBJ:</span>
                <input 
                  type="text" 
                  className="bg-transparent text-[#f8fafc] outline-none w-full"
                  defaultValue="Unifying Inbox & Calendar via Corsair SDK"
                />
              </div>
              <textarea 
                rows={6}
                className="bg-transparent text-[#94a3b8] outline-none resize-none w-full mt-2 leading-relaxed"
                defaultValue="Hello Clark,&#10;&#10;Our local cache synchronizations, priority classification, and pgvector embeddings are working cleanly on the Command Center workspace.&#10;&#10;Launch the client to test outbound mail connections."
              />
            </div>
            <div className="bg-[#0d0f13] px-6 py-4 flex justify-between items-center border-t border-[#1e293b]/40">
              <span className="text-[9px] text-[#64748b]">Simulate send by launching the app workspace.</span>
              <button 
                onClick={() => triggerRedirect('/dashboard', 'd')}
                className="px-4 py-2 bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#070708] text-[10px] font-bold uppercase transition-colors cursor-pointer"
              >
                Launch Client [D]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLEAN MOCKUP SEARCH MODAL */}
      {mockSearchOpen && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in font-mono">
          <div className="w-full max-w-lg bg-[#0b0c0f] border border-[#334155] shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#0d0f13] px-5 py-3.5 border-b border-[#1e293b]/40 flex justify-between items-center text-[10px] tracking-wider">
              <span className="text-[#f8fafc]">COSINE SIMILARITY SEARCH // PGVECTOR</span>
              <button 
                onClick={() => setMockSearchOpen(false)}
                className="text-[#64748b] hover:text-[#f8fafc] flex items-center gap-1.5"
              >
                CLOSE <kbd className="px-1 bg-[#16171b] border border-[#334155]/60 rounded text-[9px]">ESC</kbd>
              </button>
            </div>
            <div className="p-6">
              <input 
                id="mock-search-input"
                type="text" 
                placeholder="TYPE FILTER QUERY (E.G. LAUNCH, CALENDAR...)"
                value={mockSearchQuery}
                onChange={(e) => setMockSearchQuery(e.target.value)}
                className="bg-[#070708] w-full px-4 py-3 border border-[#334155] text-[11px] text-[#f8fafc] placeholder-[#64748b] outline-none uppercase"
              />
              
              <div className="mt-5 flex flex-col gap-2 max-h-48 overflow-y-auto">
                {mockSearchResults.length > 0 ? (
                  mockSearchResults.map(item => (
                    <div key={item.id} className="p-3 bg-[#0d0f13] border border-[#1e293b]/40 rounded-lg flex justify-between items-center text-[10px]">
                      <div>
                        <div className="font-semibold text-[#f8fafc] uppercase">{item.title}</div>
                        <div className="text-[#64748b] mt-1">{item.desc}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded border border-[#2563eb]/25 bg-[#2563eb]/5 text-[#2563eb] text-[9px] font-bold">
                        {item.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[10px] text-[#64748b] py-6">NO RESULTS MATCHED SEARCH QUERY</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-8 h-20 flex items-center justify-between border-t border-[#1e293b]/20 font-mono text-[9px] text-[#64748b] relative z-50">
        <div>© 2026 CLEARLYY INC.</div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          SECURE DIRECT GOOGLE OAUTH
        </div>
      </footer>

    </div>
  );
}
