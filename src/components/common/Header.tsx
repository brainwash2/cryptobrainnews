'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

const NAV_ITEMS = [
  { label: 'News', href: '/' },
  { label: 'Data', href: '/data/markets' },
  { label: 'Prices', href: '/price-indexes' },
  { label: 'Events', href: '/events' },
  { label: 'Learning', href: '/learning' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [mobileOpen]);

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-[#050505] border-b border-[#1a1a1a] h-14">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          
          <Link href="/" className="flex items-center gap-2 group z-[1001] relative">
            <div className="w-7 h-7 flex items-center justify-center font-black text-black text-xs bg-[#FABF2C] rounded-sm">
              CB
            </div>
            <span className="text-lg font-black tracking-tight text-white uppercase font-sans">
              CryptoBrain
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="text-sm font-bold text-[#888] hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions / Mobile Toggle */}
          <div className="flex items-center gap-4 z-[1001]">
            <div className="hidden sm:flex items-center gap-4">
              <AuthButton />
              <Link href="/go-alpha" className="bg-[#FABF2C] text-black font-black text-[10px] px-4 py-2 uppercase tracking-widest hover:bg-white transition-colors">
                Go Alpha
              </Link>
            </div>
            
            <button onClick={() => setMobileOpen(!mobileOpen)} className="xl:hidden text-white p-1">
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Menu Overlay (Block Style) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] bg-[#050505] pt-14 flex flex-col font-sans overflow-y-auto">
          <div className="flex flex-col px-4 py-6 space-y-6">
            
            <div className="w-full pb-6 border-b border-[#1a1a1a] sm:hidden">
              <AuthButton />
            </div>

            <nav className="flex flex-col space-y-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-normal text-white hover:text-[#FABF2C]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-8 mt-auto">
              <Link href="/go-alpha" onClick={() => setMobileOpen(false)} className="block w-full text-center bg-[#FABF2C] text-black font-black text-sm px-4 py-3 uppercase tracking-widest">
                Try Alpha Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
