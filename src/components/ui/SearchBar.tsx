'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X } from 'lucide-react';

interface SearchBarProps {
  onSemanticResults: (results: any[] | null) => void;
  onKeywordChange: (query: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchBar({ onSemanticResults, onKeywordChange, inputRef }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const localInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = inputRef || localInputRef;

  // Sync keyword search with parent
  useEffect(() => {
    if (!isSemanticMode) {
      onKeywordChange(query);
    }
  }, [query, isSemanticMode, onKeywordChange]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (isSemanticMode) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/emails/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, threshold: 0.35, count: 15 }),
        });

        const data = await res.json();
        if (data.results) {
          onSemanticResults(data.results);
        } else {
          onSemanticResults([]);
        }
      } catch (err) {
        console.error('Semantic search failed:', err);
        onSemanticResults([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    onSemanticResults(null);
    onKeywordChange('');
  };

  // Keyboard shortcut: Pressing "/" focuses search bar
  useEffect(() => {
    const handleGlobalSlash = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        activeInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalSlash);
    return () => window.removeEventListener('keydown', handleGlobalSlash);
  }, [activeInputRef]);

  return (
    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl flex items-center">
      <div className={`relative w-full flex items-center bg-bg-tertiary border transition-all duration-200 rounded-lg px-3 py-1.5 ${
        isSemanticMode 
          ? 'border-border-primary/60 hover:border-[#dc2626]/40 focus-within:border-accent-red focus-within:shadow-[0_0_12px_rgba(220,38,38,0.12)]'
          : 'border-border-primary/60 hover:border-[#2563eb]/40 focus-within:border-accent-blue focus-within:shadow-[0_0_12px_rgba(37,99,235,0.12)]'
      }`}>
        {isSemanticMode ? (
          <Sparkles className="w-4 h-4 text-accent-red mr-2" />
        ) : (
          <Search className="w-4 h-4 text-text-dim mr-2" />
        )}
        
        <input
          ref={activeInputRef as any}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isSemanticMode ? "Describe what you're looking for (press Enter)..." : "Filter by sender, subject... (press '/' to focus)"}
          className="bg-transparent text-xs text-text-primary placeholder:text-text-dim focus:outline-none w-full"
        />

        {isLoading ? (
          <span className="text-[10px] text-text-dim mr-2">…</span>
        ) : query ? (
          <button type="button" onClick={handleClear} className="text-text-dim hover:text-text-secondary mr-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        ) : null}

        {/* Search Mode Toggle */}
        <button
          type="button"
          onClick={() => {
            const newMode = !isSemanticMode;
            setIsSemanticMode(newMode);
            if (!newMode) {
              onSemanticResults(null); // Clear semantic results
            }
          }}
          className={`flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded transition-all duration-200 cursor-pointer ${
            isSemanticMode
              ? 'bg-accent-red/15 text-accent-red border border-accent-red/20'
              : 'bg-bg-hover text-text-muted hover:text-text-secondary border border-transparent'
          }`}
        >
          {isSemanticMode ? 'Semantic' : 'Keyword'}
        </button>
      </div>
    </form>
  );
}
