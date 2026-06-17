'use client';

import React from 'react';

interface PigeonLogoProps {
  size?: number;
  className?: string;
}

export function PigeonLogo({ size = 32, className = '' }: PigeonLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pigeon"
    >
      {/* Body */}
      <ellipse cx="32" cy="36" rx="15" ry="13" fill="currentColor" opacity="0.15" />
      <ellipse cx="32" cy="36" rx="15" ry="13" stroke="currentColor" strokeWidth="1.5" opacity="0.4" fill="none" />

      {/* Head */}
      <circle cx="39" cy="22" r="8.5" fill="currentColor" opacity="0.15" />
      <circle cx="39" cy="22" r="8.5" stroke="currentColor" strokeWidth="1.5" opacity="0.4" fill="none" />

      {/* Neck */}
      <ellipse cx="36" cy="28" rx="6.5" ry="5.5" fill="currentColor" opacity="0.1" />

      {/* Eye */}
      <circle cx="42" cy="20.5" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="42.8" cy="19.8" r="1" fill="var(--bg-primary)" />

      {/* Beak */}
      <path d="M47 22 L53 20.5 L47 24.5 Z" fill="currentColor" opacity="0.45" />

      {/* Wing */}
      <path
        d="M19 33 Q13 29 12 37 Q11 44 18 45 Q24 45 28 41 Q24 37 19 33Z"
        fill="currentColor"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.25"
      />

      {/* Tail */}
      <path d="M17 43 Q12 49 10 54 Q14 51 19 47Z" fill="currentColor" opacity="0.12" />
      <path d="M21 44 Q17 50 15 55 Q19 53 23 49Z" fill="currentColor" opacity="0.08" />

      {/* Feet */}
      <path d="M28 48 L26 55 M28 48 L30 55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
      <path d="M36 48 L34 55 M36 48 L38 55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
    </svg>
  );
}
