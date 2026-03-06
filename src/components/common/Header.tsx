'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

const NAV_ITEMS =[
  { label: 'NEWS', href: '/' },
  { label: 'DATA', href: '/data/markets/spot' },
  { label: 'PRICES', href: '/price-indexes' },
  { label: 'EVENTS', href: '/events' },
  { label: 'AIRDROPS', href: '/airdrops' },
  { label: 'LEARNING', href: '/learning' },
];

export default function Header() {
  const[mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-[#050505] border-b border-[#1a1a1a] h-14">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group z-[1001] relative">
            <div className="w-7 h-7 flex items-center justify-center font-black text-black text-xs bg-[#FABF2C]">CB</div>
            <span className="text-lg font-black tracking-tighter text-white uppercase font-sans">CryptoBrain</span>
          </Link>
          <nav className="hidden xl:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="text-[11px] font-black tracking-widest text-[#888] hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 z-[1001]">
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/advertise" className="text-[10px] font-black text-[#555] hover:text-[#FABF2C] uppercase tracking-widest">Advertise</Link>
              <AuthButton />
              <Link href="/alpha-guides" className="bg-[#FABF2C] text-black font-black text-[10px] px-4 py-2 uppercase tracking-widest hover:bg-white transition-colors">The Cartel</Link>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="xl:hidden text-white p-1">
              {mobileOpen ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[999] bg-[#050505] pt-14 flex flex-col font-sans overflow-y-auto">
          <div className="flex flex-col px-4 py-6 space-y-6">
            <nav className="flex flex-col space-y-6">
              {NAV_ITEMS.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="text-2xl font-black text-white hover:text-[#FABF2C] uppercase tracking-tighter">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
