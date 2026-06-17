'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Mail,
  ArrowRight,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Zap,
  Send,
  Bird,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { PigeonLogo } from '@/components/ui/PigeonLogo';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
const SECRET = 'pigeon';

export default function LandingPage() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logIdx, setLogIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Easter eggs
  const [raining, setRaining] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [cooVisible, setCooVisible] = useState(false);
  const [feathers, setFeathers] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const clickCount = useRef(0);
  const konamiIdx = useRef(0);
  const secretBuf = useRef('');
  const secretTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const flash = useCallback((k: string) => {
    setActiveKey(k.toUpperCase());
    setTimeout(() => setActiveKey(null), 400);
  }, []);

  const go = useCallback((path: string, label: string, k: string) => {
    flash(k);
    setRedirecting(label);
    setTimeout(() => router.push(path), 600);
  }, [router, flash]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Easter egg: rain
  const triggerRain = useCallback(() => {
    if (raining) return;
    setRaining(true);
    showToast('🐦 You found the secret flock!');
    setTimeout(() => setRaining(false), 4000);
  }, [raining, showToast]);

  // Easter egg: logo
  const handleLogoClick = useCallback(() => {
    clickCount.current++;
    if (clickCount.current >= 7) {
      setSpinning(true);
      setCooVisible(true);
      showToast('Coo coo!');
      clickCount.current = 0;
      setTimeout(() => { setSpinning(false); setCooVisible(false); }, 1200);
    }
  }, [showToast]);

  // Easter egg: feathers
  const triggerFeathers = useCallback(() => {
    if (feathers) return;
    setFeathers(true);
    showToast('🪶 Feathers!');
    setTimeout(() => setFeathers(false), 3000);
  }, [feathers, showToast]);

  // Keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Konami
      if (e.key.toLowerCase() === KONAMI[konamiIdx.current].toLowerCase()) {
        konamiIdx.current++;
        if (konamiIdx.current === KONAMI.length) { konamiIdx.current = 0; triggerRain(); return; }
        if (konamiIdx.current > 0) return;
      } else if (konamiIdx.current > 0) { konamiIdx.current = 0; }

      // Inputs
      const inInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      if (inInput) {
        if (e.key === 'Escape') { e.preventDefault(); (document.activeElement as HTMLElement).blur(); setSearchOpen(false); }
        return;
      }

      // Secret word
      if (e.key.length === 1) {
        secretBuf.current += e.key.toLowerCase();
        if (secretBuf.current.length > SECRET.length) secretBuf.current = secretBuf.current.slice(-SECRET.length);
        if (secretBuf.current === SECRET) { secretBuf.current = ''; triggerFeathers(); return; }
        if (secretTimer.current) clearTimeout(secretTimer.current);
        secretTimer.current = setTimeout(() => { secretBuf.current = ''; }, 2000);
      }

      // Shortcuts
      const k = e.key.toLowerCase();
      if (k === 'd') { e.preventDefault(); go('/dashboard', 'Dashboard', 'd'); }
      else if (k === 'i') { e.preventDefault(); go('/auth', 'Settings', 'i'); }
      else if (k === 'c') { e.preventDefault(); flash('c'); setComposeOpen(true); }
      else if (k === '/') { e.preventDefault(); flash('/'); setSearchOpen(true); setTimeout(() => document.getElementById('search-input')?.focus(), 50); }
      else if (k === 'escape') { e.preventDefault(); setComposeOpen(false); setSearchOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); if (secretTimer.current) clearTimeout(secretTimer.current); };
  }, [go, flash, triggerRain, triggerFeathers]);

  // Log rotation
  useEffect(() => {
    const t = setInterval(() => setLogIdx(i => (i + 1) % 4), 2800);
    return () => clearInterval(t);
  }, []);

  const logs = [
    { t: '17:56:01', k: 'inbox.sync', v: 'fetched 3 new messages' },
    { t: '17:56:02', k: 'vector.embed', v: 'generated 1536d embedding' },
    { t: '17:56:05', k: 'webhook', v: 'listening for push events' },
    { t: '17:56:08', k: 'priority', v: 'scored draft at 0.88' },
  ];

  const results = [
    { id: '1', title: 'Product Launch Update', sub: 'Meeting schedule with the team for Q3 launch...', score: 98 },
    { id: '2', title: 'Flight Reservation', sub: 'Confirmation details for upcoming travel...', score: 87 },
    { id: '3', title: 'Calendar Sync Fixed', sub: 'Corsair token refresh now working correctly...', score: 76 },
  ].filter(r => !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.sub.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`min-h-screen flex flex-col bg-bg-primary text-text-primary font-sans accent-top transition-colors duration-150 ${mounted ? '' : 'opacity-0'}`}>

      {/* ── Nav ── */}
      <header className="w-full max-w-5xl mx-auto px-6 h-14 flex items-center justify-between relative z-50">
        <button onClick={handleLogoClick} className={`flex items-center gap-2 cursor-pointer select-none ${spinning ? 'logo-spin' : ''}`} aria-label="Home" id="logo-btn">
          <PigeonLogo size={36} />
          <span className="font-mono text-[12px] tracking-widest text-text-muted font-medium">PIGEON</span>
          {cooVisible && <span className="text-[11px] text-accent font-mono animate-enter">coo!</span>}
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => go('/auth', 'Settings', 'i')} className="text-[13px] text-text-muted hover:text-text-primary transition-colors duration-100 px-3 py-1.5 press cursor-pointer hidden sm:block" id="nav-settings">
            Settings <kbd>I</kbd>
          </button>
          <button onClick={() => go('/dashboard', 'Dashboard', 'd')} className="text-[13px] text-text-primary bg-bg-tertiary hover:bg-bg-hover border border-border-primary px-3.5 py-1.5 rounded-lg press cursor-pointer transition-colors duration-100" id="nav-launch">
            Dashboard <kbd>D</kbd>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 relative z-10">
        <section className="max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left */}
            <div className="flex flex-col items-start max-w-lg">
              <h1 className="text-[2.75rem] sm:text-[3.5rem] font-display font-medium leading-[1.1] tracking-tight text-text-primary mb-5 animate-enter delay-2">
                The email client you
                <br />
                <span className="text-text-muted">actually want to use.</span>
              </h1>

              <p className="text-[15px] text-text-muted leading-relaxed mb-8 animate-enter delay-3">
                Keyboard-first Gmail &amp; Calendar. Semantic search that understands what you mean.
                Secure by default. Feels like it reads your mind.
              </p>

              <div className="flex items-center gap-3 animate-enter delay-4">
                <button
                  onClick={() => go('/dashboard', 'Dashboard', 'd')}
                  className="text-[13px] font-medium text-white bg-accent hover:opacity-90 px-5 py-2.5 rounded-lg press cursor-pointer transition-opacity duration-100 flex items-center gap-2"
                  id="cta-launch"
                >
                  Open Pigeon <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => go('/auth', 'Settings', 'i')}
                  className="text-[13px] text-text-secondary hover:text-text-primary px-5 py-2.5 rounded-lg press cursor-pointer transition-colors duration-100 border border-border-primary hover:border-border-hover"
                  id="cta-connect"
                >
                  Connect Gmail
                </button>
              </div>

              {/* Tiny social proof — not fake metrics */}
              <p className="text-[12px] text-text-dim mt-6 font-mono animate-enter delay-5">
                IMAP + GCal sync · pgvector search · AES-256 encrypted
              </p>
            </div>

            {/* Right — interactive terminal card */}
            <div className="animate-enter delay-3">
              <div className="card overflow-hidden">
                <div className="h-10 border-b border-border-primary flex items-center justify-between px-4">
                  <span className="text-[11px] text-text-dim font-mono flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-text-muted" />
                    pigeon.sh
                  </span>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-border-primary" />
                    <span className="w-2 h-2 rounded-full bg-border-primary" />
                    <span className="w-2 h-2 rounded-full bg-border-primary" />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { key: 'C', label: 'Compose', icon: Mail, action: () => setComposeOpen(true) },
                    { key: '/', label: 'Search', icon: Search, action: () => { setSearchOpen(true); setTimeout(() => document.getElementById('search-input')?.focus(), 80); } },
                    { key: 'D', label: 'Dashboard', icon: ArrowRight, action: () => go('/dashboard', 'Dashboard', 'd') },
                  ].map(s => (
                    <button
                      key={s.key}
                      onClick={s.action}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-border-primary hover:border-border-hover hover:bg-bg-hover press cursor-pointer transition-colors duration-100 text-left group"
                    >
                      <span className="flex items-center gap-3 text-[13px] text-text-secondary group-hover:text-text-primary transition-colors duration-100">
                        <kbd className="text-[11px]">{s.key}</kbd>
                        {s.label}
                      </span>
                      <s.icon className="w-3.5 h-3.5 text-text-dim group-hover:text-text-muted transition-colors duration-100" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="max-w-5xl mx-auto px-6 pb-24 md:pb-32">
          <h2 className="text-[12px] font-mono text-text-dim tracking-widest uppercase mb-8 animate-enter delay-1">How it works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search — wide */}
            <div className="md:col-span-2 card p-5 animate-enter delay-2">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-accent" />
                <h3 className="text-[14px] font-semibold text-text-primary">Semantic Search</h3>
              </div>
              <p className="text-[13px] text-text-muted leading-relaxed mb-4">
                Type what you mean, not exact keywords. Your emails are embedded as vectors and matched by meaning — &quot;that meeting about the product&quot; finds it instantly.
              </p>
              <div className="bg-bg-tertiary rounded-lg p-3 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between text-text-dim">
                  <span>query</span><span>cosine distance</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>&quot;product roadmap meeting&quot;</span><span className="text-text-dim">→ 1536 vectors</span>
                </div>
                <div className="flex justify-between text-text-muted pl-3 border-l border-border-primary">
                  <span>↳ &quot;flight tickets&quot;</span><span className="text-text-dim">0.42</span>
                </div>
                <div className="flex justify-between text-text-primary pl-3 border-l-2 border-accent font-medium">
                  <span>↳ &quot;roadmap sync discussion&quot;</span><span className="text-accent">0.94</span>
                </div>
              </div>
            </div>

            {/* Keyboard */}
            <div className="card p-5 animate-enter delay-3">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-accent" />
                <h3 className="text-[14px] font-semibold text-text-primary">Keyboard-First</h3>
              </div>
              <p className="text-[13px] text-text-muted leading-relaxed mb-4">
                Every action has a shortcut. Navigate, reply, archive — no mouse needed.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[12px] font-mono">
                {[['J/K', 'Navigate'], ['E', 'Archive'], ['S', 'Star'], ['/', 'Search']].map(([k, v]) => (
                  <div key={k} className="bg-bg-tertiary rounded-lg px-2.5 py-2 flex justify-between items-center text-text-secondary">
                    <span>{v}</span>
                    <kbd className="text-[10px]">{k}</kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="card p-5 animate-enter delay-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <h3 className="text-[14px] font-semibold text-text-primary">Encrypted Storage</h3>
              </div>
              <p className="text-[13px] text-text-muted leading-relaxed mb-4">
                OAuth tokens are encrypted with AES-256-GCM before they touch the database. Wiped when you disconnect.
              </p>
              <div className="flex items-center gap-2 font-mono text-[10px] text-text-dim flex-wrap">
                <span className="bg-bg-tertiary px-2 py-1 rounded">Token</span>
                <span>→</span>
                <span className="bg-accent-muted px-2 py-1 rounded text-accent border border-accent/20">KEK</span>
                <span>→</span>
                <span className="bg-bg-tertiary px-2 py-1 rounded">DB</span>
              </div>
            </div>

            {/* Live sync — wide */}
            <div className="md:col-span-2 card p-5 animate-enter delay-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <h3 className="text-[14px] font-semibold text-text-primary">Live Sync</h3>
                </div>
                <span className="text-[10px] text-text-dim font-mono">webhook · no polling</span>
              </div>
              <p className="text-[13px] text-text-muted leading-relaxed mb-4">
                Webhooks push new mail the instant it arrives. No polling, no delays — your inbox is always current.
              </p>
              <div className="bg-bg-tertiary rounded-lg p-3 font-mono text-[11px] space-y-1">
                {logs.map((l, i) => (
                  <div key={i} className={`flex gap-3 transition-opacity duration-200 ${i === logIdx ? 'opacity-100 text-text-primary' : 'opacity-25 text-text-muted'}`}>
                    <span className="text-text-dim shrink-0">{l.t}</span>
                    <span className={`shrink-0 ${i === logIdx ? 'text-accent font-medium' : ''}`}>{l.k}</span>
                    <span className="truncate">{l.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── About section — earned, not cringe ── */}
        <section className="max-w-5xl mx-auto px-6 pb-24 md:pb-32">
          <div className="card p-8 md:p-10 flex flex-col sm:flex-row items-start gap-6 sm:gap-10">
            <div className="shrink-0 pt-1">
              <PigeonLogo size={64} />
            </div>
            <div>
              <p className="text-[15px] text-text-secondary leading-relaxed mb-3">
                Carrier pigeons were the fastest way to deliver messages for centuries — reliable, direct, no noise.
                That&apos;s the idea. An inbox that delivers what matters and stays out of your way.
              </p>
              <p className="text-[12px] text-text-dim font-mono">
                <Bird className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                There might be some secrets hidden around here.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Overlays ── */}

      {/* Redirect */}
      {redirecting && (
        <div className="fixed inset-0 bg-bg-primary/95 z-[60] flex flex-col items-center justify-center animate-enter">
          <span className="text-[12px] text-text-muted font-mono">{redirecting}</span>
        </div>
      )}

      {/* Key toast */}
      {activeKey && (
        <div className="fixed bottom-5 right-5 bg-bg-secondary border border-border-primary px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-[12px] font-mono text-text-secondary toast-enter z-[60]">
          <kbd>{activeKey}</kbd>
        </div>
      )}

      {/* Compose */}
      {composeOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => setComposeOpen(false)}>
          <div className="w-full max-w-lg bg-bg-secondary border border-border-primary rounded-xl overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-border-primary flex justify-between items-center">
              <span className="text-[13px] text-text-primary font-medium flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-text-muted" /> New Draft
              </span>
              <button onClick={() => setComposeOpen(false)} className="text-[12px] text-text-muted hover:text-text-primary cursor-pointer press transition-colors duration-100">
                Close <kbd>Esc</kbd>
              </button>
            </div>
            <div className="p-5 space-y-3 text-[13px]">
              <div className="flex border-b border-border-primary pb-3">
                <span className="text-text-dim w-10 shrink-0">To</span>
                <input type="text" className="bg-transparent text-text-primary outline-none w-full" defaultValue="user@pigeon.dev" />
              </div>
              <div className="flex border-b border-border-primary pb-3">
                <span className="text-text-dim w-10 shrink-0">Sub</span>
                <input type="text" className="bg-transparent text-text-primary outline-none w-full" defaultValue="Unified Inbox via Corsair SDK" />
              </div>
              <textarea rows={4} className="bg-transparent text-text-secondary outline-none resize-none w-full leading-relaxed" defaultValue={`Hey,\n\nLocal cache and pgvector embeddings are syncing cleanly.\n\nLaunch the client to test outbound connections.`} />
            </div>
            <div className="px-5 py-3 border-t border-border-primary flex justify-end">
              <button onClick={() => go('/dashboard', 'Dashboard', 'd')} className="text-[12px] font-medium text-white bg-accent hover:opacity-90 px-4 py-2 rounded-lg press cursor-pointer transition-opacity duration-100">
                Open Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-lg bg-bg-secondary border border-border-primary rounded-xl overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-border-primary flex justify-between items-center">
              <span className="text-[13px] text-text-primary font-medium flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-text-muted" /> Search
              </span>
              <button onClick={() => setSearchOpen(false)} className="text-[12px] text-text-muted hover:text-text-primary cursor-pointer press transition-colors duration-100">
                Close <kbd>Esc</kbd>
              </button>
            </div>
            <div className="p-5">
              <input
                id="search-input"
                type="text"
                placeholder="Search by meaning..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-bg-tertiary w-full px-3.5 py-2.5 border border-border-primary rounded-lg text-[13px] text-text-primary placeholder:text-text-dim outline-none focus:border-border-hover transition-colors duration-100"
              />
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {results.length > 0 ? results.map(r => (
                  <div key={r.id} className="p-3 bg-bg-tertiary border border-border-primary rounded-lg flex justify-between items-center hover:border-border-hover transition-colors duration-100">
                    <div>
                      <div className="text-[13px] font-medium text-text-primary">{r.title}</div>
                      <div className="text-[12px] text-text-muted mt-0.5">{r.sub}</div>
                    </div>
                    <span className="text-[11px] font-mono text-text-dim ml-3 shrink-0">{r.score}%</span>
                  </div>
                )) : (
                  <p className="text-[13px] text-text-dim text-center py-6">No results</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Easter eggs ── */}
      {raining && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className="rain-drop" style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 1}s`,
            }}>
              {['🐦', '🕊️', '🪶'][i % 3]}
            </span>
          ))}
        </div>
      )}

      {feathers && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="feather" style={{
              left: `${15 + Math.random() * 70}%`,
              bottom: `${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 0.8}s`,
            }}>🪶</span>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[101] toast-enter">
          <div className="bg-bg-secondary border border-border-primary px-5 py-2.5 rounded-lg shadow-lg text-[13px] text-text-primary font-medium">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
