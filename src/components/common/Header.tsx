'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

const NAV_ITEMS = [
  { label: 'NEWS', href: '/' },
  { label: 'DATA', href: '/data' }, // Simplified for mobile
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
          
          {/* 1. Logo Section */}
          <Link href="/" className="flex items-center gap-2 group z-[1001] relative">
            <div className="relative w-8 h-8 bg-[#FABF2C] flex items-center justify-center font-black text-black text-sm">
              CB
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase hidden sm:block">
              CryptoBrain
            </span>
          </Link>

          {/* 2. Desktop Navigation (Hidden on Mobile) */}
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

          {/* 3. Actions (Desktop: Auth + Ads / Mobile: Hamburger) */}
          <div className="flex items-center gap-4">
            
            {/* Desktop-only Auth & Buttons */}
            <div className="hidden xl:flex items-center gap-4">
              <Link href="/advertise" className="text-[10px] font-black text-[#555] hover:text-[#FABF2C] uppercase tracking-widest">
                Advertise
              </Link>
              <AuthButton />
            </div>

            {/* Mobile Hamburger Button (ALWAYS VISIBLE ON MOBILE) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden w-10 h-10 flex items-center justify-center border border-[#333] bg-[#111] text-[#FABF2C]"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 4. Mobile Dropdown Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl pt-24 px-6 xl:hidden overflow-y-auto">
          <div className="flex flex-col space-y-6">
            
            {/* Mobile Auth (Moved here so it doesn't crowd header) */}
            <div className="pb-6 border-b border-[#333]">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-4">Account Access</p>
              <AuthButton />
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-black text-white uppercase tracking-tight hover:text-[#FABF2C]"
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="h-px bg-[#333] my-4" />
              
              <Link href="/data/markets" onClick={() => setMobileOpen(false)} className="text-sm font-mono text-[#888]">Data Terminal</Link>
              <Link href="/advertise" onClick={() => setMobileOpen(false)} className="text-sm font-mono text-[#888]">Advertising</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
