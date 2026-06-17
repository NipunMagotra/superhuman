'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onKeywordChange: (query: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchBar({ onKeywordChange, inputRef }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const localInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = inputRef || localInputRef;

  useEffect(() => {
    onKeywordChange(query);
  }, [query, onKeywordChange]);

  const handleClear = () => {
    setQuery('');
    onKeywordChange('');
  };

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
    <div className="relative w-full max-w-xl flex items-center">
      <div className="relative w-full flex items-center bg-bg-tertiary border border-border-primary/60 hover:border-[#2563eb]/40 focus-within:border-accent-blue focus-within:shadow-[0_0_12px_rgba(37,99,235,0.12)] transition-all duration-200 rounded-lg px-3 py-1.5">
        <Search className="w-4 h-4 text-text-dim mr-2" />
        <input
          ref={activeInputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by sender, subject... (press '/' to focus)"
          className="bg-transparent text-xs text-text-primary placeholder:text-text-dim focus:outline-none w-full"
        />
        {query ? (
          <button type="button" onClick={handleClear} className="text-text-dim hover:text-text-secondary cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
