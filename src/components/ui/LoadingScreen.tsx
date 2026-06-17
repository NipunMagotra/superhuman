import React from 'react';
import { PigeonLoader } from './PigeonLoader';

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ message = 'Loading…', className = '' }: LoadingScreenProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 bg-bg-primary text-text-primary ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <PigeonLoader />
      {message ? (
        <p className="font-mono text-[12px] tracking-widest text-text-muted uppercase">{message}</p>
      ) : null}
    </div>
  );
}
