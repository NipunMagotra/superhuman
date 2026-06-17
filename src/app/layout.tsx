import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Command Center — High-Speed Email & Calendar Hub',
  description: 'Ultra-minimalist, keyboard-first, AI-powered control panel for Gmail and Google Calendar.',
  keywords: ['gmail', 'google calendar', 'ai assistant', 'keyboard shortcuts', 'superhuman style', 'inbox zero'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
