'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Shield, Search, ChevronDown } from 'lucide-react';
import { NEWS_CATEGORIES } from '@/lib/news-categories';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setNewsDropdownOpen(false); setIsOpen(false); }, [pathname]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNewsDropdownOpen(false);
      }
    };
    const onScroll = () => setNewsDropdownOpen(false);
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery('');
    router.push(`/news/search?q=${encodeURIComponent(q)}`);
  }

  const navLinks = [
    { name: 'DATA',     href: '/data/markets/spot' },
    { name: 'PRICES',   href: '/price-indexes' },
    { name: 'EVENTS',   href: '/events' },
    { name: 'AIRDROPS', href: '/airdrops' },
    { name: 'DOCS',     href: '/docs' },
    { name: 'SANDBOX',  href: '/agent-registry/sandbox' },
  ];

  return (
    <header className="bg-black border-b border-[#222]">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">

        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#FABF2C] text-black font-black text-xs px-2 py-1 rounded-sm group-hover:bg-white transition-colors">CB</div>
            <span className="font-black tracking-tighter text-lg uppercase hidden sm:block">CryptoBrain</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {/* NEWS with full-width dropdown + dim overlay */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setNewsDropdownOpen(v => !v)}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#888] hover:text-[#FABF2C] transition-colors"
              >
                NEWS
                <ChevronDown size={10} className={`transition-transform duration-200 ${newsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {newsDropdownOpen && (
                <>
                  {/* Full-viewport dim overlay — covers the hero text completely */}
                  <div
                    className="fixed inset-0 top-[130px] bg-black/75"
                    onClick={() => setNewsDropdownOpen(false)}
                  />
                  {/* Dropdown panel — sits above the overlay */}
                  <div className="absolute top-full left-0 mt-2 w-52 bg-black border border-[#333] shadow-2xl z-10">
                    <Link href="/news" onClick={() => setNewsDropdownOpen(false)}
                      className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#FABF2C] hover:bg-[#111] border-b border-[#222] transition-colors">
                      All News
                    </Link>
                    {NEWS_CATEGORIES.map(cat => (
                      <Link key={cat.slug} href={`/news/category/${cat.slug}`}
                        onClick={() => setNewsDropdownOpen(false)}
                        className="block px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#888] hover:text-[#FABF2C] hover:bg-[#111] transition-colors">
                        {cat.label}
                      </Link>
                    ))}
                    <div className="border-t border-[#222]">
                      <Link href="/bookmarks" onClick={() => setNewsDropdownOpen(false)}
                        className="block px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-[#FABF2C] hover:bg-[#111] transition-colors">
                        🔖 Saved Articles
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {navLinks.map(link => (
              <Link key={link.name} href={link.href}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                  link.name === 'DOCS' || link.name === 'SANDBOX'
                    ? 'text-[#00d672] hover:text-white'
                    : 'text-[#888] hover:text-[#FABF2C]'
                }`}>
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="relative flex items-center">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input ref={searchInputRef} type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search intelligence…"
                  className="bg-[#111] border border-[#333] text-white placeholder-[#444] px-3 py-1.5 text-xs font-mono w-52 focus:outline-none focus:border-[#FABF2C] transition-colors rounded-sm"
                />
                <button type="submit" className="text-[#FABF2C] hover:text-white transition-colors"><Search size={14} /></button>
                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="text-[#555] hover:text-white transition-colors"><X size={14} /></button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)}
                className="text-[#555] hover:text-[#FABF2C] transition-colors p-1" aria-label="Search">
                <Search size={16} />
              </button>
            )}
          </div>
          <Link href="/advertise" className="text-[10px] text-[#555] font-black uppercase tracking-widest hover:text-white transition-colors">Advertise</Link>
          <div className="h-4 w-px bg-[#333] mx-2" />
          <Link href="/dashboard" className="flex items-center gap-2 bg-[#111] border border-[#333] text-[#FABF2C] px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#FABF2C] hover:text-black transition-all">
            <Shield size={12} /> Dashboard
          </Link>
          <Link href="/pricing" className="bg-[#FABF2C] text-black px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">
            The Cartel
          </Link>
        </div>

        <button className="lg:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden w-full bg-black border-b border-[#222] p-4 flex flex-col gap-4 shadow-2xl max-h-[80vh] overflow-y-auto">
          <form onSubmit={(e) => {
            e.preventDefault();
            const q = searchQuery.trim();
            if (!q) return;
            setIsOpen(false);
            setSearchQuery('');
            router.push(`/news/search?q=${encodeURIComponent(q)}`);
          }} className="flex gap-2">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-[#111] border border-[#333] text-white placeholder-[#444] px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#FABF2C]" />
            <button type="submit" className="bg-[#FABF2C] text-black px-4 py-2 text-[10px] font-black uppercase">Go</button>
          </form>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#FABF2C] pb-2 border-b border-[#1a1a1a] mb-2">News</p>
            <Link href="/news" onClick={() => setIsOpen(false)} className="block text-xs font-black uppercase tracking-widest text-[#FABF2C] py-2">All News</Link>
            {NEWS_CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/news/category/${cat.slug}`} onClick={() => setIsOpen(false)}
                className="block text-xs font-black uppercase tracking-widest text-[#888] hover:text-white py-2">{cat.label}</Link>
            ))}
            <Link href="/bookmarks" onClick={() => setIsOpen(false)}
              className="block text-xs font-black uppercase tracking-widest text-[#555] hover:text-white py-2">🔖 Saved Articles</Link>
          </div>
          {navLinks.map(link => (
            <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}
              className="text-xs font-black uppercase tracking-widest text-[#888] hover:text-white border-b border-[#222] pb-4">{link.name}</Link>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/dashboard" onClick={() => setIsOpen(false)}
              className="bg-[#111] border border-[#333] text-[#FABF2C] text-center px-4 py-3 rounded-sm text-xs font-black uppercase tracking-widest">Operator Dashboard</Link>
            <Link href="/pricing" onClick={() => setIsOpen(false)}
              className="bg-[#FABF2C] text-black text-center px-4 py-3 rounded-sm text-xs font-black uppercase tracking-widest">Join The Cartel</Link>
          </div>
        </div>
      )}
    </header>
  );
}
