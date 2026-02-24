'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';
import Icon from '@/components/ui/AppIcon';

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
    ],
  },
  { label: 'PRICES', href: '/price-indexes' },
  { label: 'EVENTS', href: '/events' },
  { label: 'LEARNING', href: '/learning' },
];

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDataOpen, setMobileDataOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-black border-b border-[#1a1a1a] h-16">
        <div className="container mx-auto h-full flex items-center justify-between px-4 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group z-[1001] relative">
            <div className="relative w-8 h-8 bg-[#FABF2C] flex items-center justify-center font-black text-black text-sm">
              CB
            </div>
            <span className="text-xl font-black tracking-tighter text-white group-hover:text-[#FABF2C] transition-colors uppercase hidden sm:block">
              CryptoBrain
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-2">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative group h-16 flex items-center"
                onMouseEnter={() => setActiveMenu(item.label)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  href={item.href}
                  className="px-4 py-2 text-[11px] font-black text-[#888] hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1"
                >
                  {item.label}
                  {item.children && <span className="text-[8px] opacity-50 ml-1">▼</span>}
                </Link>

                {item.children && activeMenu === item.label && (
                  <div className="absolute top-16 left-0 w-48 bg-[#0a0a0a] border border-[#1a1a1a] shadow-2xl py-2 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2.5 text-[10px] font-black text-[#555] hover:text-[#FABF2C] hover:bg-white/5 uppercase tracking-widest transition-all"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Actions / Mobile Hamburger */}
          <div className="flex items-center gap-4 z-[1001]">
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/advertise" className="border border-[#1a1a1a] text-[#888] hover:border-[#FABF2C] hover:text-[#FABF2C] px-4 py-2 text-[10px] font-black transition-all uppercase tracking-widest">
                Advertise
              </Link>
              <Link href="/go-alpha" className="bg-[#FABF2C] text-black px-4 py-2 text-[10px] font-black hover:bg-white transition-all uppercase tracking-widest">
                Go Alpha
              </Link>
              <AuthButton />
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden w-10 h-10 flex items-center justify-center border border-[#1a1a1a] bg-[#0a0a0a] text-white hover:text-[#FABF2C]"
            >
              {mobileOpen ? <Icon name="XMarkIcon" size={20} /> : <Icon name="Bars3Icon" size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] bg-[#050505] pt-20 px-4 xl:hidden overflow-y-auto pb-10">
          <div className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="border-b border-[#1a1a1a]">
                {item.children ? (
                  <>
                    <button 
                      onClick={() => setMobileDataOpen(!mobileDataOpen)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="text-xl font-black text-white uppercase tracking-tighter">{item.label}</span>
                      <span className="text-[#FABF2C] text-xl">{mobileDataOpen ? '−' : '+'}</span>
                    </button>
                    {mobileDataOpen && (
                      <div className="flex flex-col pl-4 pb-4 space-y-4 border-l border-[#1a1a1a] ml-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm font-bold text-[#888] hover:text-[#FABF2C] uppercase tracking-widest"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-4 text-xl font-black text-white uppercase tracking-tighter hover:text-[#FABF2C]"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            <div className="pt-8 space-y-4">
              <AuthButton />
              <Link href="/go-alpha" className="block w-full text-center bg-[#FABF2C] text-black px-4 py-3 text-xs font-black uppercase tracking-widest">
                Go Alpha
              </Link>
              <Link href="/advertise" className="block w-full text-center border border-[#1a1a1a] text-[#888] px-4 py-3 text-xs font-black uppercase tracking-widest">
                Advertise
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
