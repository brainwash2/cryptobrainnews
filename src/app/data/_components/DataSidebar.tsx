'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const DATA_MENU = [
  {
    title: 'Markets',
    links: [
      { label: 'Spot', href: '/data/markets/spot' },
      { label: 'Prices', href: '/price-indexes' },
      { label: 'Overview', href: '/data/markets' },
    ]
  },
  {
    title: 'DeFi',
    links: [
      { label: 'Exchange Volume', href: '/data/defi/dex-volume' },
      { label: 'TVL Rankings', href: '/data/defi/tvl' },
    ]
  },
  {
    title: 'On-Chain',
    links: [
      { label: 'Ethereum Data', href: '/data/onchain/ethereum' },
      { label: 'Whale Watch', href: '/data/defi/whale-watch' },
    ]
  }
];

export function DataSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [isOpen]);

  return (
    <>
      {/* Mobile Sticky Toggle Bar */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-[40] bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center px-4 py-3 shadow-md">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-[11px] font-black text-[#888] uppercase tracking-widest hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          Dashboard Menu
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[45] bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Actual Sidebar Content */}
      <aside
        className={`
          fixed lg:sticky top-14 left-0 z-[50] lg:z-0
          w-64 h-[calc(100vh-3.5rem)] bg-[#050505] 
          border-r border-[#1a1a1a] 
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-5 font-sans">
          {/* Close button for mobile inside drawer */}
          <div className="flex justify-end lg:hidden mb-4">
            <button onClick={() => setIsOpen(false)} className="text-[#888] hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {DATA_MENU.map((section) => (
            <div key={section.title} className="mb-8">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">
                {section.title}
              </h3>
              <div className="flex flex-col space-y-1 border-l border-[#1a1a1a] ml-1">
                {section.links.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-[13px] block pl-4 py-1.5 transition-colors ${
                        active 
                          ? 'border-l-2 border-[#FABF2C] text-[#FABF2C] font-bold -ml-[1px]' 
                          : 'border-l-2 border-transparent text-[#888] hover:text-white -ml-[1px]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
