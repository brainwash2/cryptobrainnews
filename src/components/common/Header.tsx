'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

const NAV_ITEMS = [
  { 
    label: 'NEWS', 
    href: '/homepage',
    children: [
      { label: 'LATEST', href: '/homepage' },
      { label: 'BITCOIN', href: '/homepage?category=BTC' },
      { label: 'ETHEREUM', href: '/homepage?category=ETH' },
      { label: 'DEFI', href: '/homepage?category=DEFI' },
    ]
  },
  { 
    label: 'MARKETS', 
    href: '/markets-overview',
    children: [
      { label: 'SPOT', href: '/markets-overview' },
      { label: 'FUTURES', href: '/price-indexes' },
    ]
  },
  { 
    label: 'PRICES', 
    href: '/price-indexes'
  },
  { label: 'DEFI TERMINAL', href: '/de-fi-analytics' },
  { label: 'LEARNING', href: '/homepage' },
];

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-black border-b border-[#1a1a1a] h-16">
      <div className="container mx-auto h-full flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/homepage" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 bg-primary rounded flex items-center justify-center font-black text-black">CB</div>
            <span className="text-xl font-black tracking-tighter text-white group-hover:text-primary transition-colors uppercase">
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
                        className="block px-4 py-2 text-[10px] font-bold text-[#555] hover:text-primary hover:bg-white/5 transition-all"
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
            href="/go-alpha" 
            className="hidden md:block bg-primary text-black px-4 py-2 text-[10px] font-black hover:bg-white transition-all uppercase tracking-widest"
          >
            Go Alpha
          </Link>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
