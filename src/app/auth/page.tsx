'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Calendar, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AuthPage() {
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState({
    gmail: 'not_connected',
    googlecalendar: 'not_connected',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse URL queries for success / error alerts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === 'true') {
        const pluginName = params.get('plugin');
        setTimeout(() => {
          setMessage(`Successfully connected ${pluginName === 'gmail' ? 'Gmail' : 'Google Calendar'}!`);
        }, 0);
      }
      if (params.get('error')) {
        const err = params.get('error');
        setTimeout(() => {
          setErrorMsg(decodeURIComponent(err || ''));
        }, 0);
      }
    }
  }, []);

  const fetchConnections = async () => {
    try {
      const statusRes = await fetch('/api/auth/status').catch(() => null);
      if (statusRes && statusRes.ok) {
        const data = await statusRes.json();
        setConnections(data);
      }
    } catch (err) {
      console.error('Failed to get connection statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (plugin: 'gmail' | 'googlecalendar') => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setMessage(null);
      const res = await fetch(`/api/auth/disconnect?plugin=${plugin}`, {
        method: 'POST',
      });
      if (res.ok) {
        setMessage(`Successfully disconnected ${plugin === 'gmail' ? 'Gmail' : 'Google Calendar'}.`);
        await fetchConnections();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to disconnect.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Theme Toggle in top right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-red/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg bg-bg-secondary border border-border-primary rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Back navigation */}
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6 group w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        <h1 className="text-xl font-bold mb-2 text-text-primary">Integrations & Settings</h1>
        <p className="text-xs text-text-dim mb-6 leading-relaxed">
          Link your Google workspace accounts to read email and manage your calendar in Pigeon.
        </p>

        {/* Informative Banner about Shared Tenant */}
        <div className="p-4 bg-accent-blue/5 border border-accent-blue/20 rounded-xl text-xs text-text-primary mb-6 flex flex-col gap-1.5 leading-relaxed">
          <span className="font-semibold text-accent-blue flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            💡 Shared Database Notice:
          </span>
          <span className="text-text-muted">
            This project runs on a shared developer database. If you see a service marked as <strong>Connected</strong> but want to use your own account, click <strong>Disconnect</strong> first to wipe the credentials, then connect your personal account.
          </span>
        </div>

        {/* Status Alerts */}
        {message && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 flex items-start gap-2 mb-6 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-400" />
            <span>{message}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-xl text-xs text-accent-red flex items-start gap-2 mb-6 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-accent-red" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Connection Cards */}
        <div className="flex flex-col gap-6">
          
          {/* Gmail */}
          <div className="bg-bg-tertiary/60 border border-border-primary/50 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/10">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Gmail Integration</h3>
                  <p className="text-[11px] text-text-dim mt-0.5">Read, search, compose, and manage emails</p>
                </div>
              </div>
              
              {loading ? (
                <span className="text-[10px] text-text-dim">Checking…</span>
              ) : connections.gmail === 'connected' ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-zinc-500/10 text-text-dim border border-zinc-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Not Connected
                </span>
              )}
            </div>

            <p className="text-[11px] text-text-dim leading-relaxed bg-bg-primary/30 p-3 rounded-lg border border-border-primary/20">
              {connections.gmail === 'connected' 
                ? "Your Gmail is connected. You can read, search, compose, and manage emails from the dashboard."
                : "No active Gmail connection found. Link your account to get started."}
            </p>

            <div className="flex items-center gap-3 mt-1">
              {connections.gmail === 'connected' ? (
                <>
                  <a
                    href="/api/auth/corsair?plugin=gmail"
                    className="flex-1 py-2 bg-bg-hover hover:bg-border-primary text-text-primary text-center rounded-lg text-xs font-semibold transition-colors border border-border-primary active-press"
                  >
                    Switch Account
                  </a>
                  <button
                    onClick={() => handleDisconnect('gmail')}
                    disabled={loading}
                    className="px-4 py-2 bg-accent-red/10 hover:bg-accent-red/20 text-accent-red border border-accent-red/20 rounded-lg text-xs font-semibold transition-colors active-press"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <a
                  href="/api/auth/corsair?plugin=gmail"
                  className="w-full py-2 bg-accent-blue hover:bg-accent-blue-hover text-white text-center rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-accent-blue/10 active-press"
                >
                  Connect Gmail Account
                </a>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-bg-tertiary/60 border border-border-primary/50 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-red/10 flex items-center justify-center text-accent-red border border-accent-red/10">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Google Calendar</h3>
                  <p className="text-[11px] text-text-dim mt-0.5">Manage schedules, create events, and check slots</p>
                </div>
              </div>
              
              {loading ? (
                <span className="text-[10px] text-text-dim">Checking…</span>
              ) : connections.googlecalendar === 'connected' ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-zinc-500/10 text-text-dim border border-zinc-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Not Connected
                </span>
              )}
            </div>

            <p className="text-[11px] text-text-dim leading-relaxed bg-bg-primary/30 p-3 rounded-lg border border-border-primary/20">
              {connections.googlecalendar === 'connected'
                ? "Your Google Calendar is connected. You can view, create, and manage events from the dashboard."
                : "No active Google Calendar connection. Link your account to manage events from the dashboard."}
            </p>

            <div className="flex items-center gap-3 mt-1">
              {connections.googlecalendar === 'connected' ? (
                <>
                  <a
                    href="/api/auth/corsair?plugin=googlecalendar"
                    className="flex-1 py-2 bg-bg-hover hover:bg-border-primary text-text-primary text-center rounded-lg text-xs font-semibold transition-colors border border-border-primary active-press"
                  >
                    Switch Account
                  </a>
                  <button
                    onClick={() => handleDisconnect('googlecalendar')}
                    disabled={loading}
                    className="px-4 py-2 bg-accent-red/10 hover:bg-accent-red/20 text-accent-red border border-accent-red/20 rounded-lg text-xs font-semibold transition-colors active-press"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <a
                  href="/api/auth/corsair?plugin=googlecalendar"
                  className="w-full py-2 bg-accent-red hover:bg-accent-red-hover text-white text-center rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-accent-red/10 active-press"
                >
                  Connect Calendar Account
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Security Disclaimers */}
        <div className="mt-8 pt-6 border-t border-border-primary/40 text-[10px] text-text-dim text-center">
          Credentials are encrypted locally and securely processed using KEK.
        </div>
      </div>
    </div>
  );
}
