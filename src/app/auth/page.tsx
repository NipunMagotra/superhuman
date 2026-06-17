'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Calendar, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

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

  useEffect(() => {
    setTimeout(() => {
      fetchConnections();
    }, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-center items-center px-4 relative">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-red/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Back navigation */}
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-6 group w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Command Center
        </Link>

        <h1 className="text-xl font-bold mb-2 text-text-primary">Integrations</h1>
        <p className="text-xs text-text-dim mb-8">
          Connect your Google accounts to link Gmail and Calendar to the AI Command Center.
        </p>

        {/* Status Alerts */}
        {message && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 flex items-start gap-2 mb-6">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-xl text-xs text-accent-red flex items-start gap-2 mb-6">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Connection failed: {errorMsg}</span>
          </div>
        )}

        {/* Connection Buttons */}
        <div className="flex flex-col gap-4">
          
          {/* Gmail */}
          <div className="bg-bg-tertiary/60 border border-border-primary/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Gmail Integration</h3>
                  <span className="text-[10px] text-text-dim">Emails, Send, Drafts, Labels</span>
                </div>
              </div>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-text-dim" />
              ) : connections.gmail === 'connected' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                  Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/10 text-text-dim border border-zinc-500/20">
                  Disconnected
                </span>
              )}
            </div>
            <a
              href="/api/auth/corsair?plugin=gmail"
              className="w-full py-2 bg-accent-blue hover:bg-accent-blue-hover text-white text-center rounded-lg text-xs font-semibold transition-colors block"
            >
              {connections.gmail === 'connected' ? 'Reconnect Gmail' : 'Connect Gmail'}
            </a>
          </div>

          {/* Calendar */}
          <div className="bg-bg-tertiary/60 border border-border-primary/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center text-accent-red">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Google Calendar</h3>
                  <span className="text-[10px] text-text-dim">Schedule, Invites, Meetings</span>
                </div>
              </div>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-text-dim" />
              ) : connections.googlecalendar === 'connected' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                  Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/10 text-text-dim border border-zinc-500/20">
                  Disconnected
                </span>
              )}
            </div>
            <a
              href="/api/auth/corsair?plugin=googlecalendar"
              className="w-full py-2 bg-accent-red hover:bg-accent-red-hover text-white text-center rounded-lg text-xs font-semibold transition-colors block"
            >
              {connections.googlecalendar === 'connected' ? 'Reconnect Calendar' : 'Connect Calendar'}
            </a>
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
