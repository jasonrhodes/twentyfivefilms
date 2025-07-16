import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { IconCopyright, IconHome } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata = {
  title: 'twenty five films',
  description: 'from puzzlefactory productions'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="p-[8px] sm:p-[32px] pb-20 min-h-svh font-[family-name:var(--font-geist-sans)] flex justify-between items-center flex-col">
          <main className="flex pb-20 items-center justify-center w-full lg:w-[960px]">
            {children}
          </main>
          <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm">
            <Link className="flex items-center" href="/">
              <IconHome size={16} className="mr-1" /> Home
            </Link>
            <p className="flex items-center">
              <IconCopyright className="mr-1" size={16} />{' '}
              <span>{new Date().getFullYear()} puzzlefactory productions</span>
            </p>
          </footer>
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
