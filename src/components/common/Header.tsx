'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AuthButton from '@/components/auth/AuthButton';

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navConfig = [
    { 
      label: 'NEWS', 
      href: '/homepage',
      subItems: [
        { label: 'Latest Updates', href: '/homepage' },
        { label: 'Bitcoin News', href: '/homepage?cat=btc' },
        { label: 'Ethereum News', href: '/homepage?cat=eth' },
        { label: 'Policy & Regs', href: '/homepage?cat=policy' },
        { label: 'DeFi Insights', href: '/homepage?cat=defi' }
      ]
    },
    { 
      label: 'MARKETS', 
      href: '/markets-overview',
      subItems: [
        { label: 'Market Dashboard', href: '/markets-overview' },
        { label: 'Spot Volume', href: '/markets-overview?tab=spot' },
        { label: 'Futures/OI', href: '/markets-overview?tab=futures' },
        { label: 'ETF Tracker', href: '/markets-overview?tab=etf' }
      ]
    },
    { 
      label: 'PRICES', 
      href: '/price-indexes',
      subItems: [
        { label: 'Top 100 Coins', href: '/price-indexes' },
        { label: 'Top Gainers', href: '/price-indexes?filter=gainers' },
        { label: 'Top Losers', href: '/price-indexes?filter=losers' }
      ]
    },
    { label: 'DEFI', href: '/de-fi-analytics', subItems: [] },
    { label: 'LEARNING', href: '/learning', subItems: [] },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-black border-b-2 border-primary h-16 shadow-2xl">
      <div className="container mx-auto px-4 lg:px-8 h-full flex items-center justify-between">
        
        {/* LOGO SECTION */}
        <Link href="/homepage" className="flex items-center gap-2 group z-50">
          <div className="bg-primary text-black font-black p-1.5 text-xl leading-none transition-all group-hover:rotate-6">CB</div>
          <span className="font-serif font-black text-white text-2xl tracking-tighter hidden sm:block">
            CRYPTO<span className="text-primary">BRAIN</span>
          </span>
        </Link>

        {/* CENTER NAVIGATION (Mega Menu Style) */}
        <nav className="hidden lg:flex items-center gap-2 h-full">
          {navConfig.map((item) => (
            <div key={item.label} className="relative h-full flex items-center group">
              <Link 
                href={item.href} 
                className={`px-4 py-2 text-[11px] font-black tracking-widest transition-colors flex items-center gap-1 ${
                  pathname === item.href ? 'text-primary' : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
                {item.subItems.length > 0 && <Icon name="ChevronDownIcon" size={10} className="group-hover:rotate-180 transition-transform" />}
              </Link>

              {/* DROPDOWN MENU */}
              {item.subItems.length > 0 && (
                <div className="absolute top-16 left-0 w-56 bg-black border-2 border-primary shadow-[0_20px_50px_rgba(250,191,44,0.2)] py-4 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                  {item.subItems.map(sub => (
                    <Link 
                      key={sub.label} 
                      href={sub.href}
                      className="block px-6 py-2.5 text-[10px] font-black text-gray-400 hover:text-primary hover:bg-gray-900 transition-colors uppercase tracking-[0.2em]"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4 z-50">
          <Link 
            href="/go-alpha" 
            className="hidden xl:block bg-white/10 text-primary border border-primary/50 text-[10px] font-black px-5 py-2 hover:bg-primary hover:text-black transition-all uppercase tracking-widest"
          >
            GO ALPHA
          </Link>
          
          <AuthButton />

          <button className="text-white hover:text-primary lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Icon name="Bars3Icon" size={28} />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-black border-b-2 border-primary p-8 flex flex-col gap-6 lg:hidden animate-in slide-in-from-top">
          {navConfig.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-white font-black text-sm tracking-widest hover:text-primary">
              {link.label}
            </Link>
          ))}
          <Link href="/go-alpha" onClick={() => setIsMenuOpen(false)} className="bg-primary text-black text-center py-3 font-black text-sm tracking-widest">
            GO ALPHA
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;