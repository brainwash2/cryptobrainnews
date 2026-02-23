'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

const NAV_ITEMS = [
  { label: 'NEWS', href: '/' },
  { label: 'DATA', href: '/data' },
  { label: 'PRICES', href: '/price-indexes' },
  { label: 'EVENTS', href: '/events' },
  { label: 'LEARNING', href: '/learning' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-black border-b border-[#1a1a1a] h-16">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          
          <Link href="/" className="flex items-center gap-3 group z-[1001] relative">
            <div className="w-8 h-8 bg-[#FABF2C] flex items-center justify-center font-black text-black text-sm">
              CB
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase hidden sm:block">
              CryptoBrain
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[11px] font-black text-[#888] hover:text-white uppercase tracking-widest transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-4">
              <Link href="/advertise" className="text-[10px] font-black text-[#555] hover:text-[#FABF2C] uppercase tracking-widest">
                Advertise
              </Link>
              <AuthButton />
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden w-10 h-10 flex items-center justify-center border border-[#333] bg-[#111] text-[#FABF2C] z-[1001] relative"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[999] bg-black pt-24 px-6 xl:hidden overflow-y-auto pb-10">
          <div className="flex flex-col space-y-8">
            
            {/* Login Section - Stacked cleanly */}
            <div className="pb-8 border-b border-[#1a1a1a] flex flex-col items-start w-full">
              <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-4">Account</span>
              <div className="w-full">
                <AuthButton />
              </div>
            </div>

            {/* Nav Links - Smaller, cleaner font */}
            <nav className="flex flex-col space-y-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-black text-white uppercase tracking-wider hover:text-[#FABF2C]"
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="h-px w-full bg-[#1a1a1a] my-2" />
              
              <Link href="/advertise" onClick={() => setMobileOpen(false)} className="text-sm font-bold text-[#888] uppercase tracking-widest">
                Advertising
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
