'use client';

import React from 'react';

interface PigeonLogoProps {
  size?: number;
  className?: string;
}

export function PigeonLogo({ size = 32, className = '' }: PigeonLogoProps) {
  return (
    <img
      src="/pigeon.png"
      alt="Pigeon Logo"
      width={size}
      height={size}
      className={`${className} object-contain`}
    />
  );
}
