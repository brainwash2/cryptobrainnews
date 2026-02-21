'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

const NAV_ITEMS = [
  { label: 'NEWS', href: '/' },
  {
    label: 'DATA',
    href: '/data',
    children: [
      { label: 'Markets', href: '/data/markets' },
      { label: 'DeFi', href: '/data/defi' },
      { label: 'On-Chain', href: '/data/onchain' },
      { label: 'ETFs', href: '/data/etfs' },
      { label: 'Stablecoins', href: '/data/stablecoins' },
      { label: 'NFTs', href: '/data/nfts' },
      { label: 'Exchanges', href: '/data/exchanges' },
      { label: 'Layer 2s', href: '/data/l2' },
      { label: 'Governance', href: '/data/governance' },
    ],
  },
  { label: 'PRICES', href: '/price-indexes' },
  { label: 'EVENTS', href: '/events' },
  { label: 'LEARNING', href: '/learning' },
];

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-black border-b border-[#1a1a1a] h-16">
      <div className="container mx-auto h-full flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 bg-[#FABF2C] flex items-center justify-center font-black text-black text-sm">
              CB
            </div>
            <span className="text-xl font-black tracking-tighter text-white group-hover:text-[#FABF2C] transition-colors uppercase">
              CryptoBrain
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setActiveMenu(item.label)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  href={item.href}
                  className="px-4 py-2 text-[11px] font-black text-[#888] hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1"
                >
                  {item.label}
                  {item.children && <span className="text-[8px] opacity-40">▼</span>}
                </Link>

                {item.children && activeMenu === item.label && (
                  <div className="absolute top-full left-0 w-48 bg-black border border-[#1a1a1a] py-2 shadow-2xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-[10px] font-bold text-[#555] hover:text-[#FABF2C] hover:bg-white/5 transition-all"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/advertise"
            className="hidden lg:block border border-[#1a1a1a] text-[#888] hover:border-[#FABF2C] hover:text-[#FABF2C] px-4 py-2 text-[10px] font-black transition-all uppercase tracking-widest"
          >
            Advertise
          </Link>
          <Link
            href="/go-alpha"
            className="hidden md:block bg-[#FABF2C] text-black px-4 py-2 text-[10px] font-black hover:bg-white transition-all uppercase tracking-widest"
          >
            Go Alpha
          </Link>
          <AuthButton />
          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden text-white p-2"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              {mobileOpen ? (
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" fill="none" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="xl:hidden absolute top-16 left-0 right-0 bg-black border-b border-[#1a1a1a] py-4 px-4 z-[999]">
          {NAV_ITEMS.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-[11px] font-black text-[#888] hover:text-white uppercase tracking-widest border-b border-[#111]"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="pl-4 space-y-2 py-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block text-[10px] text-[#555] hover:text-[#FABF2C] transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/advertise"
            onClick={() => setMobileOpen(false)}
            className="block py-3 text-[11px] font-black text-[#FABF2C] uppercase tracking-widest"
          >
            Advertise
          </Link>
        </div>
      )}
    </header>
  );
}
