'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const CT_MENU = [
  { title: 'News', links: ['Latest News', 'Bitcoin', 'Markets', 'Ethereum', 'Altcoins', 'Blockchain', 'Regulation'] },
  { title: 'Indices', links: ['Price Indices', 'Converter', 'Memecoins'] },
  { title: 'Podcasts', links: [] },
  { title: 'In Depth', links: ['Magazine', 'Opinion', 'Interview', 'Investigation', 'Features'] },
  { title: 'Learn', links: ['Explained', 'How to', 'Guides', 'Glossary'] },
  { title: 'About', links: ['Team', 'Editorial Policy', 'Ads Disclosure', 'Careers'] },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('News');

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-[#0a0a0a] border-b border-[#1a1a1a] h-14">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          
          <Link href="/" className="flex items-center gap-2 group z-[1001] relative">
            <div className="w-8 h-8 flex items-center justify-center font-black text-black text-sm bg-[#FABF2C] rounded-full">
              CB
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white uppercase leading-none font-sans">
                CryptoBrain
              </span>
              <span className="text-[8px] text-[#888] uppercase tracking-widest font-sans">The future of money</span>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-white hover:text-[#FABF2C] transition-colors">News</Link>
            <Link href="/price-indexes" className="text-sm font-bold text-white hover:text-[#FABF2C] transition-colors">Indices</Link>
            <Link href="/data/markets" className="text-sm font-bold text-white hover:text-[#FABF2C] transition-colors">In Depth</Link>
          </nav>

          <div className="flex items-center gap-4 z-[1001]">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white p-2"
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* COINTELEGRAPH STYLE MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] bg-[#0a0a0a] pt-14 flex flex-col overflow-hidden font-sans">
          <div className="p-4 border-b border-[#1a1a1a]">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search CryptoBrain" 
                className="w-full bg-transparent border border-[#333] rounded-full px-10 py-3 text-white text-sm outline-none focus:border-[#FABF2C]"
              />
              <svg className="absolute left-4 top-3.5 text-[#555]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-2 pb-24">
            {CT_MENU.map((section) => (
              <div key={section.title} className="border-b border-[#1a1a1a] py-4">
                <button 
                  onClick={() => setOpenSection(openSection === section.title ? null : section.title)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className={`text-xl font-bold ${openSection === section.title ? 'text-[#FABF2C]' : 'text-white'}`}>
                    {section.title}
                  </span>
                </button>
                
                {openSection === section.title && section.links.length > 0 && (
                  <div className="flex flex-col gap-4 mt-4 pl-2">
                    {section.links.map(link => (
                      <Link key={link} href="/" onClick={() => setMobileOpen(false)} className="text-base text-gray-300 hover:text-white">
                        {link}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center bg-[#111] p-4 rounded-xl border border-[#222]">
                <span className="text-white font-bold">English</span>
                <span className="text-[#888]">›</span>
              </div>
              <div className="flex justify-between items-center bg-[#111] p-4 rounded-xl border border-[#222]">
                <span className="text-white font-bold">USD</span>
                <span className="text-[#888]">›</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
