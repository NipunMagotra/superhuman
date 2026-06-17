'use client';

// Reading this as: Landing page for technical power users, with a high-end Linear-style visual language, leaning toward structural grid lines, monospace tags, and asymmetric layouts.
// DESIGN_VARIANCE: 7
// MOTION_INTENSITY: 6
// VISUAL_DENSITY: 4

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Command, 
  Zap, 
  Search, 
  Mail, 
  Calendar, 
  ArrowRight, 
  Settings, 
  Terminal, 
  ShieldCheck, 
  Play, 
  RefreshCw,
  ChevronRight,
  Sparkles,
  Inbox
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState<string | null>(null);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);
  const [mockComposeOpen, setMockComposeOpen] = useState(false);
  const [mockSearchOpen, setMockSearchOpen] = useState(false);
  const [mockSearchQuery, setMockSearchQuery] = useState('');
  const [activeLogIndex, setActiveLogIndex] = useState(0);

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

  // Rotate mockup webhook logs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const mockSearchResults = [
    { id: '1', title: 'Product Launch Update', desc: 'Urgent meeting schedule with Google...', score: '0.98 Match' },
    { id: '2', title: 'Flight Reservation details', desc: 'Confirm status for flight ticket booking...', score: '0.87 Match' },
    { id: '3', title: 'Calendar Sync Error Resolved', desc: 'We have configured Corsair token refresh...', score: '0.76 Match' }
  ].filter(item => 
    !mockSearchQuery || 
    item.title.toLowerCase().includes(mockSearchQuery.toLowerCase()) || 
    item.desc.toLowerCase().includes(mockSearchQuery.toLowerCase())
  );

  const fakeLogs = [
    { time: '17:56:01', type: 'inbox.sync', msg: 'fetched 3 new messages from IMAP' },
    { time: '17:56:02', type: 'vector.embed', msg: 'generated 1536d OpenAI text-embedding-3' },
    { time: '17:56:05', type: 'webhook.live', msg: 'inbox synchronization listening for push events' },
    { time: '17:56:08', type: 'priority.score', msg: 'priority classifier rated draft score 0.88' },
  ];

  return (
    <div className="min-h-screen bg-[#050506] text-[#f9fafb] font-sans antialiased flex flex-col justify-between selection:bg-[#2563eb]/30 selection:text-white relative">
      
      {/* Editorial Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Subtle border indicator for Accent Theme */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2563eb]/60 to-[#dc2626]/40 opacity-80" />

      {/* Navigation */}
      <header className="w-full max-w-6xl mx-auto px-8 h-20 flex items-center justify-between relative z-50 border-b border-zinc-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-red-600 flex items-center justify-center font-bold text-white text-[10px] font-mono shadow-md">
            P
          </div>
          <span className="font-mono text-xs tracking-[0.2em] text-[#d1d5db] font-semibold">
            PIGEON // CC
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => triggerRedirect('/auth', 'i')} 
            className="font-mono text-[10px] tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            INTEGRATIONS 
            <kbd className="text-[9px] text-[#6b7280] bg-[#111114] border border-[#1a1a22] px-1 py-0.5 rounded font-sans">I</kbd>
          </button>
          <button 
            onClick={() => triggerRedirect('/dashboard', 'd')} 
            className="font-mono text-[10px] tracking-wider text-white border border-[#1a1a22] hover:border-zinc-700 px-4 py-2 bg-[#0b0b0d] hover:bg-[#111114] transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm rounded-lg"
          >
            LAUNCH CLIENT 
            <kbd className="text-[9px] text-[#6b7280] bg-[#111114] border border-[#1a1a22] px-1 py-0.5 rounded font-sans">D</kbd>
          </button>
        </div>
      </header>

      {/* Main Hero & Split Layout */}
      <main className="flex-1 max-w-6xl mx-auto px-8 py-16 w-full flex flex-col justify-center gap-20 relative z-30">
        
        {/* Asymmetric Split Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-[#3b82f6] uppercase tracking-wider mb-6 font-semibold select-none shadow-sm">
              <Sparkles className="w-3 h-3 text-[#3b82f6] animate-pulse" />
              v0.1-Release Candidate
            </div>

            <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white leading-[1.08] max-w-2xl mb-6 font-display">
              Unified workspace at the speed of thought.
            </h1>

            <p className="text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed mb-8 font-light">
              An ultra-minimalist, keyboard-first client for Gmail and Calendar. Optimised for performance, backed by Supabase pgvector search, and connected securely via Corsair.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={() => triggerRedirect('/dashboard', 'd')}
                className="px-6 py-3 bg-[#f9fafb] hover:bg-[#e5e7eb] text-[#050506] text-xs tracking-wider font-mono uppercase font-semibold transition-all duration-200 shadow-lg cursor-pointer rounded-lg active:scale-[0.98]"
              >
                Launch Workspace [D]
              </button>
              
              <button
                onClick={() => triggerRedirect('/auth', 'i')}
                className="px-6 py-3 border border-zinc-800 hover:border-zinc-650 hover:bg-[#0b0b0d] text-[#f9fafb] text-xs tracking-wider font-mono uppercase transition-all duration-200 cursor-pointer rounded-lg active:scale-[0.98]"
              >
                Settings Panel [I]
              </button>
            </div>

            {/* Quick Micro-Metrics */}
            <div className="flex items-center gap-6 border-t border-zinc-900/60 pt-6 w-full max-w-md">
              <div>
                <span className="block text-xs font-mono font-bold text-white">12ms</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Sync Latency</span>
              </div>
              <div className="w-px h-6 bg-zinc-900" />
              <div>
                <span className="block text-xs font-mono font-bold text-white">IMAP + GCal</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Dual Sync Engine</span>
              </div>
              <div className="w-px h-6 bg-zinc-900" />
              <div>
                <span className="block text-xs font-mono font-bold text-white">pgvector</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Semantic Cache</span>
              </div>
            </div>
          </div>
          
          {/* Right Interactive Mockup Column */}
          <div className="lg:col-span-5 w-full flex flex-col items-center">
            <div className="w-full bg-[#0b0b0d] border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl relative">
              
              {/* Window Header */}
              <div className="h-10 bg-[#070708] border-b border-zinc-850 px-4 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-500" />
                  PREVIEW_CLIENT_SHORTCUTS.SH
                </span>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-800" />
                  <span className="w-2 h-2 rounded-full bg-zinc-800" />
                </div>
              </div>

              {/* Interactive trigger box */}
              <div className="p-6 font-mono text-[10px] leading-relaxed text-zinc-400 flex flex-col gap-4">
                <p className="text-[10px] text-zinc-500 border-b border-zinc-900/60 pb-2.5">
                  Press these keys on your keyboard right now to try panels:
                </p>
                
                <div 
                  onClick={() => setMockComposeOpen(true)}
                  className="flex justify-between items-center py-2 px-3 border border-zinc-900 bg-zinc-900/10 hover:border-blue-500/20 hover:bg-blue-500/5 rounded-lg cursor-pointer transition-all duration-200 group active:scale-[0.99]"
                >
                  <span className="flex items-center gap-2.5">
                    <kbd className="w-5 h-5 bg-[#050506] border border-zinc-700/50 rounded flex items-center justify-center font-bold text-white text-[10px]">C</kbd>
                    <span className="group-hover:text-white transition-colors text-[10px]">COMPOSE MOCK DRAFT</span>
                  </span>
                  <span className="text-zinc-600 text-[9px] uppercase tracking-wider flex items-center gap-1">
                    Compose Modal <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                <div 
                  onClick={() => {
                    setMockSearchOpen(true);
                    setTimeout(() => document.getElementById('mock-search-input')?.focus(), 100);
                  }}
                  className="flex justify-between items-center py-2 px-3 border border-zinc-900 bg-zinc-900/10 hover:border-red-500/20 hover:bg-red-500/5 rounded-lg cursor-pointer transition-all duration-200 group active:scale-[0.99]"
                >
                  <span className="flex items-center gap-2.5">
                    <kbd className="w-5 h-5 bg-[#050506] border border-zinc-700/50 rounded flex items-center justify-center font-bold text-white text-[10px]">/</kbd>
                    <span className="group-hover:text-white transition-colors text-[10px]">VECTOR SIMILARITY SEARCH</span>
                  </span>
                  <span className="text-zinc-600 text-[9px] uppercase tracking-wider flex items-center gap-1">
                    Cosine Match <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Bento Feature Grid */}
        <section className="flex flex-col gap-8 border-t border-zinc-900/60 pt-16">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#dc2626] uppercase font-bold">
              [SYSTEM CAPABILITIES]
            </span>
            <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight">
              Designed for extreme speed.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cell 1: Semantic Search */}
            <div className="md:col-span-2 bg-[#0b0b0d] border border-zinc-800/40 rounded-xl p-6 flex flex-col justify-between gap-6 hover:border-zinc-800/80 transition-all duration-200">
              <div className="flex flex-col gap-2">
                <span className="w-fit px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono font-bold uppercase">
                  pgvector cache
                </span>
                <h3 className="text-sm font-semibold text-white">Semantic Cosine Search</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                  Queries are converted into embeddings using OpenAI model endpoints, then matched against Supabase records using vector cosine distance for instant retrieval.
                </p>
              </div>

              {/* Dynamic matching preview */}
              <div className="bg-[#050506] border border-zinc-900 rounded-lg p-4 font-mono text-[10px] flex flex-col gap-2">
                <div className="flex justify-between items-center text-zinc-500 border-b border-zinc-900 pb-2">
                  <span>VECTOR DISTANCE METRIC</span>
                  <span>OPENAI EMBEDDINGS</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Query: "Meeting about product roadmap"</span>
                  <span className="text-blue-400">1536 Vectors</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400 pl-3 border-l border-zinc-850">
                  <span>↳ Match: "Flight ticket details"</span>
                  <span className="text-zinc-600 font-bold">0.42 (low match)</span>
                </div>
                <div className="flex justify-between items-center text-zinc-200 pl-3 border-l border-blue-900/60">
                  <span>↳ Match: "Roadmap discussion sync"</span>
                  <span className="text-green-400 font-bold">0.94 (high match)</span>
                </div>
              </div>
            </div>

            {/* Cell 2: Keyboard map */}
            <div className="bg-[#0b0b0d] border border-zinc-800/40 rounded-xl p-6 flex flex-col justify-between gap-6 hover:border-zinc-800/80 transition-all duration-200">
              <div className="flex flex-col gap-2">
                <span className="w-fit px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-mono font-bold uppercase">
                  Keyboard native
                </span>
                <h3 className="text-sm font-semibold text-white">Universal Keybindings</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                  Cycle through list views and draft replies cleanly without cursor moves. Custom hook locks event capture reliably.
                </p>
              </div>

              {/* Styled Keycap Display */}
              <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                <div className="bg-[#050506] border border-zinc-900/60 p-2.5 rounded-lg flex items-center justify-between text-zinc-300">
                  <span>Scroll List</span>
                  <div className="flex gap-1">
                    <kbd className="w-4 h-4 bg-zinc-900 border border-zinc-700/40 rounded text-center text-white font-bold leading-4">J</kbd>
                    <kbd className="w-4 h-4 bg-zinc-900 border border-zinc-700/40 rounded text-center text-white font-bold leading-4">K</kbd>
                  </div>
                </div>
                <div className="bg-[#050506] border border-zinc-900/60 p-2.5 rounded-lg flex items-center justify-between text-zinc-300">
                  <span>Archive</span>
                  <kbd className="w-4 h-4 bg-zinc-900 border border-zinc-700/40 rounded text-center text-white font-bold leading-4">E</kbd>
                </div>
                <div className="bg-[#050506] border border-zinc-900/60 p-2.5 rounded-lg flex items-center justify-between text-zinc-300">
                  <span>Star Event</span>
                  <kbd className="w-4 h-4 bg-zinc-900 border border-zinc-700/40 rounded text-center text-white font-bold leading-4">S</kbd>
                </div>
                <div className="bg-[#050506] border border-zinc-900/60 p-2.5 rounded-lg flex items-center justify-between text-zinc-300">
                  <span>Search</span>
                  <kbd className="w-4 h-4 bg-zinc-900 border border-zinc-700/40 rounded text-center text-white font-bold leading-4">/</kbd>
                </div>
              </div>
            </div>

            {/* Cell 3: Security */}
            <div className="bg-[#0b0b0d] border border-zinc-800/40 rounded-xl p-6 flex flex-col justify-between gap-6 hover:border-zinc-800/80 transition-all duration-200">
              <div className="flex flex-col gap-2">
                <span className="w-fit px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50 text-[9px] font-mono font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-400" />
                  AES-256 GCM
                </span>
                <h3 className="text-sm font-semibold text-white">Secure Local Storage</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                  OAuth key chains are encrypted locally on the server using KEK (Key Encryption Key) before entering database registers. Wiped automatically on disconnect.
                </p>
              </div>

              {/* Encryption diagram */}
              <div className="p-3 bg-[#050506] border border-zinc-900/60 rounded-lg flex items-center justify-center gap-3 font-mono text-[9px] text-zinc-500">
                <span>Access Token</span>
                <span>⟶</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-950/20 text-blue-400 border border-blue-900/30">KEK SHA256</span>
                <span>⟶</span>
                <span className="text-green-400">Database Entry</span>
              </div>
            </div>

            {/* Cell 4: Live Webhooks */}
            <div className="md:col-span-2 bg-[#0b0b0d] border border-zinc-800/40 rounded-xl p-6 flex flex-col justify-between gap-6 hover:border-zinc-800/80 transition-all duration-200">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="w-fit px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-mono font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    live webhook feed
                  </span>
                  <span className="font-mono text-[9px] text-zinc-600">POLLING OFF</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Incremental Sync Webhook</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                  A persistent webhook loop intercepts mailbox update receipts, parsing differences dynamically and fetching only newly created content packets.
                </p>
              </div>

              {/* Webhook logs display */}
              <div className="bg-[#050506] border border-zinc-900 rounded-lg p-4 font-mono text-[10px] flex flex-col gap-1.5">
                {fakeLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-3 transition-opacity duration-300 ${
                      index === activeLogIndex ? 'opacity-100 text-white' : 'opacity-30'
                    }`}
                  >
                    <span className="text-zinc-600">[{log.time}]</span>
                    <span className={index === activeLogIndex ? 'text-blue-400 font-bold' : 'text-zinc-500'}>{log.type}:</span>
                    <span className="truncate">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Floating Redirect Indicator */}
      {redirecting && (
        <div className="fixed inset-0 bg-[#050506]/98 z-50 flex flex-col items-center justify-center animate-fade-in font-mono">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin mb-4" />
          <span className="text-[10px] tracking-[0.2em] text-[#9ca3af] uppercase">
            CONNECTING TO {redirecting}...
          </span>
        </div>
      )}

      {/* Floating Key Toast Notification */}
      {activeShortcut && (
        <div className="fixed bottom-12 right-12 bg-[#0b0b0d] text-[#f9fafb] px-4 py-3 border border-zinc-800 shadow-2xl flex items-center gap-3 font-mono text-[10px] tracking-wider animate-slide-up z-50 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          HOTKEY: <kbd className="px-1.5 py-0.5 bg-[#050506] border border-zinc-700/60 rounded font-bold text-white">{activeShortcut}</kbd>
        </div>
      )}

      {/* 1. CLEAN MOCKUP COMPOSE MODAL */}
      {mockComposeOpen && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in font-mono p-4">
          <div className="w-full max-w-lg bg-[#0b0b0d] border border-zinc-800/80 shadow-2xl rounded-xl overflow-hidden animate-scale-up">
            <div className="bg-[#070708] px-5 py-3.5 border-b border-zinc-850 flex justify-between items-center text-[10px] tracking-wider">
              <span className="text-[#f9fafb]">DRAFT // OUTBOX</span>
              <button 
                onClick={() => setMockComposeOpen(false)}
                className="text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                CLOSE <kbd className="px-1.5 py-0.5 bg-[#050506] border border-zinc-700/60 rounded text-[9px]">ESC</kbd>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-[11px]">
              <div className="flex border-b border-zinc-900 pb-2.5">
                <span className="text-zinc-500 w-12 shrink-0">TO:</span>
                <input 
                  type="text" 
                  className="bg-transparent text-white outline-none w-full border-none p-0 focus:ring-0 text-[11px]"
                  defaultValue="poweruser@pigeon.com"
                />
              </div>
              <div className="flex border-b border-zinc-900 pb-2.5">
                <span className="text-zinc-500 w-12 shrink-0">SUBJ:</span>
                <input 
                  type="text" 
                  className="bg-transparent text-white outline-none w-full border-none p-0 focus:ring-0 text-[11px]"
                  defaultValue="Unifying Inbox & Calendar via Corsair SDK"
                />
              </div>
              <textarea 
                rows={6}
                className="bg-transparent text-zinc-300 outline-none resize-none w-full mt-2 leading-relaxed border-none p-0 focus:ring-0 text-[11px]"
                defaultValue="Hello Clark,&#10;&#10;Our local cache synchronizations, priority classification, and pgvector embeddings are working cleanly on the Command Center workspace.&#10;&#10;Launch the client to test outbound mail connections."
              />
            </div>
            <div className="bg-[#070708] px-6 py-4 flex justify-between items-center border-t border-zinc-900">
              <span className="text-[9px] text-zinc-650">Outbound transmission relies on active account auth.</span>
              <button 
                onClick={() => triggerRedirect('/dashboard', 'd')}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-[10px] font-bold uppercase transition-colors cursor-pointer rounded"
              >
                Launch Client [D]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLEAN MOCKUP SEARCH MODAL */}
      {mockSearchOpen && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in font-mono p-4">
          <div className="w-full max-w-lg bg-[#0b0b0d] border border-zinc-800/80 shadow-2xl rounded-xl overflow-hidden animate-scale-up">
            <div className="bg-[#070708] px-5 py-3.5 border-b border-zinc-850 flex justify-between items-center text-[10px] tracking-wider">
              <span className="text-[#f9fafb]">COSINE SIMILARITY SEARCH // PGVECTOR</span>
              <button 
                onClick={() => setMockSearchOpen(false)}
                className="text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                CLOSE <kbd className="px-1.5 py-0.5 bg-[#050506] border border-zinc-700/60 rounded text-[9px]">ESC</kbd>
              </button>
            </div>
            <div className="p-6">
              <input 
                id="mock-search-input"
                type="text" 
                placeholder="TYPE FILTER QUERY (E.G. LAUNCH, CALENDAR...)"
                value={mockSearchQuery}
                onChange={(e) => setMockSearchQuery(e.target.value)}
                className="bg-[#050506] w-full px-4 py-3 border border-zinc-800 text-[11px] text-white placeholder-zinc-600 outline-none rounded-lg focus:border-zinc-700 transition-colors uppercase"
              />
              
              <div className="mt-5 flex flex-col gap-2 max-h-48 overflow-y-auto">
                {mockSearchResults.length > 0 ? (
                  mockSearchResults.map(item => (
                    <div key={item.id} className="p-3 bg-[#070708] border border-zinc-900 rounded-lg flex justify-between items-center text-[10px]">
                      <div>
                        <div className="font-semibold text-white uppercase">{item.title}</div>
                        <div className="text-zinc-550 mt-1">{item.desc}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[9px] font-bold">
                        {item.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[10px] text-zinc-600 py-6">NO RESULTS MATCHED SEARCH QUERY</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-8 h-20 flex items-center justify-between border-t border-zinc-900/60 font-mono text-[9px] text-zinc-500 relative z-50">
        <div>© 2026 PIGEON LABS INC.</div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          SECURE DIRECT GOOGLE OAUTH
        </div>
      </footer>

    </div>
  );
}
