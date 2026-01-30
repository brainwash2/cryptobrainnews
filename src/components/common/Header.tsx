'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'NEWS', href: '/homepage' },
    { label: 'MARKETS', href: '/markets-overview' },
    { label: 'PRICES', href: '/price-indexes' },
    { label: 'DEFI', href: '/de-fi-analytics' },
    { label: 'LEARNING', href: '/learning' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-black border-b-2 border-primary h-16 shadow-2xl">
      <div className="container mx-auto px-4 lg:px-8 h-full flex items-center justify-between">
        <Link href="/homepage" className="flex items-center gap-2 group">
          <div className="bg-primary text-black font-black p-1.5 text-xl leading-none transition-all group-hover:rotate-6">CB</div>
          <span className="font-serif font-black text-white text-2xl tracking-tighter hidden sm:block">
            CRYPTO<span className="text-primary">BRAIN</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`text-xs font-black tracking-widest transition-colors ${pathname === link.href ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/go-alpha" className="bg-primary text-black text-xs font-black px-5 py-2 hover:bg-white transition-all transform hover:-translate-y-0.5 active:translate-y-0">
            GO ALPHA
          </Link>
          <button className="text-white hover:text-primary lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Icon name="Bars3Icon" size={28} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-black border-b-2 border-primary p-8 flex flex-col gap-6 lg:hidden">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-white font-black text-sm tracking-widest">{link.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
};
export default Header;
