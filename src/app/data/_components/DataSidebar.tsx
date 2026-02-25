'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

const DATA_MENU = [
  { title: 'Markets', links: [{ label: 'Overview', href: '/data/markets' }, { label: 'Spot', href: '/data/markets/spot' }, { label: 'Futures', href: '/data/markets/futures' }, { label: 'Prices', href: '/data/markets/prices' }] },
  { title: 'ETFs', links: [{ label: 'Overview', href: '/data/etfs' }, { label: 'Bitcoin ETFs', href: '/data/etfs/bitcoin' }, { label: 'Ethereum ETFs', href: '/data/etfs/ethereum' }] },
  { title: 'Stablecoins', links: [{ label: 'Overview', href: '/data/stablecoins' }, { label: 'USD Pegged', href: '/data/stablecoins/usd' }] },
  { title: 'On-Chain', links: [{ label: 'Overview', href: '/data/onchain' }, { label: 'Ethereum', href: '/data/onchain/ethereum' }] },
  { title: 'DeFi', links: [{ label: 'Overview', href: '/data/defi' }, { label: 'DEX Volume', href: '/data/defi/dex-volume' }, { label: 'TVL Rankings', href: '/data/defi/tvl' }, { label: 'Whale Watch', href: '/data/defi/whale-watch' }] },
  { title: 'NFTs', links: [{ label: 'Overview', href: '/data/nfts' }] }
];

export function DataSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed top-14 left-0 right-0 z-[40] bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center px-4 py-3">
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 text-[11px] font-black text-[#888] uppercase tracking-widest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg> Dashboard Menu
        </button>
      </div>
      {isOpen && <div className="lg:hidden fixed inset-0 z-[45] bg-black/80" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed lg:sticky top-14 left-0 z-[50] lg:z-0 w-64 h-[calc(100vh-3.5rem)] bg-[#050505] border-r border-[#1a1a1a] transform transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5">
          <div className="flex justify-end lg:hidden mb-4"><button onClick={() => setIsOpen(false)} className="text-[#888]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>
          {DATA_MENU.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] mb-3">{section.title}</h3>
              <div className="flex flex-col space-y-1 border-l border-[#1a1a1a] ml-1">
                {section.links.map((link) => (
                  <Link key={link.label} href={link.href} onClick={() => setIsOpen(false)} className={`text-xs block pl-4 py-1.5 font-bold uppercase tracking-wider ${pathname === link.href ? 'border-l-2 border-[#FABF2C] text-[#FABF2C] -ml-[1px]' : 'border-l-2 border-transparent text-[#888] hover:text-white -ml-[1px]'}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
