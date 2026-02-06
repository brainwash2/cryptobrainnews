'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AuthButton from '@/components/auth/AuthButton';

const Header = () => {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const navConfig = [
    { label: 'NEWS', href: '/homepage', subItems: ['Bitcoin', 'Ethereum', 'DeFi', 'Policy'] },
    { label: 'MARKETS', href: '/markets-overview', subItems: ['Spot', 'Futures', 'ETFs'] },
    { label: 'PRICES', href: '/price-indexes', subItems: ['Top 100', 'Movers'] },
    { label: 'DEFI', href: '/de-fi-analytics', subItems: [] },
    { label: 'LEARNING', href: '/learning', subItems: [] },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[2000] bg-black border-b border-white/10 h-16 shadow-2xl" onMouseLeave={() => setHoveredLink(null)}>
      <div className="container mx-auto px-4 lg:px-8 h-full flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/homepage" className="flex items-center gap-2 group bg-black">
          <div className="bg-primary text-black font-black p-1 text-xl leading-none transition-all group-hover:rotate-12">CB</div>
          <span className="font-serif font-black text-white text-2xl tracking-tighter">CRYPTO<span className="text-primary">BRAIN</span></span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-8 h-full">
          {navConfig.map((item) => (
            <div key={item.label} className="relative h-full flex items-center group" onMouseEnter={() => setHoveredLink(item.label)}>
              <Link href={item.href} className={`text-[11px] font-black tracking-[0.1em] transition-colors flex items-center gap-1 ${pathname === item.href || hoveredLink === item.label ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                {item.label}
                {item.subItems.length > 0 && <Icon name="ChevronDownIcon" size={10} className="group-hover:rotate-180 transition-transform" />}
              </Link>

              {/* DROPDOWN */}
              {item.subItems.length > 0 && hoveredLink === item.label && (
                <div className="absolute top-16 left-0 w-48 bg-black border border-gray-800 shadow-2xl py-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {item.subItems.map(sub => (
                    <Link key={sub} href={item.href} className="block px-6 py-2 text-[10px] font-black text-gray-500 hover:text-primary hover:bg-gray-900 transition-colors uppercase tracking-widest">{sub}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 text-gray-500">
            <Icon name="MagnifyingGlassIcon" size={18} className="hover:text-primary cursor-pointer transition-colors" />
            <span className="text-[10px] font-black border border-gray-800 px-2 py-1 hover:text-white cursor-pointer">EN</span>
          </div>
          <Link href="/go-alpha" className="bg-primary text-black text-[10px] font-black px-4 py-2 hover:bg-white transition-all transform hover:-translate-y-0.5 uppercase tracking-widest">Go Alpha</Link>
          <AuthButton />
        </div>
      </div>
    </header>
  );
};
export default Header;