'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Terminal, Shield } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks =[
    { name: 'NEWS', href: '/news' },
    { name: 'DATA', href: '/data/markets/spot' },
    { name: 'PRICES', href: '/prices' },
    { name: 'EVENTS', href: '/events' },
    { name: 'AIRDROPS', href: '/airdrops' },
    { name: 'DOCS', href: '/docs' },
    { name: 'SANDBOX', href: '/agent-registry/sandbox' },
  ];

  return (
    <header className="bg-black border-b border-[#222] sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#FABF2C] text-black font-black text-xs px-2 py-1 rounded-sm group-hover:bg-white transition-colors">
              CB
            </div>
            <span className="font-black tracking-tighter text-lg uppercase hidden sm:block">
              CryptoBrain
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                  link.name === 'DOCS' || link.name === 'SANDBOX' 
                    ? 'text-[#00d672] hover:text-white' 
                    : 'text-[#888] hover:text-[#FABF2C]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: CTA & Dashboard */}
        <div className="hidden lg:flex items-center gap-4">
          <Link 
            href="/advertise" 
            className="text-[10px] text-[#555] font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            Advertise
          </Link>
          
          <div className="h-4 w-px bg-[#333] mx-2" />

          <Link 
            href="/dashboard"
            className="flex items-center gap-2 bg-[#111] border border-[#333] text-[#FABF2C] px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#FABF2C] hover:text-black transition-all"
          >
            <Shield size={12} /> Dashboard
          </Link>

          <Link 
            href="/pricing"
            className="bg-[#FABF2C] text-black px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
          >
            The Cartel
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="lg:hidden text-white p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-[#0a0a0a] border-b border-[#222] p-4 flex flex-col gap-4 shadow-2xl">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-xs font-black uppercase tracking-widest text-[#888] hover:text-white border-b border-[#222] pb-4"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <Link 
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="bg-[#111] border border-[#333] text-[#FABF2C] text-center px-4 py-3 rounded-sm text-xs font-black uppercase tracking-widest"
            >
              Operator Dashboard
            </Link>
            <Link 
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="bg-[#FABF2C] text-black text-center px-4 py-3 rounded-sm text-xs font-black uppercase tracking-widest"
            >
              Join The Cartel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
