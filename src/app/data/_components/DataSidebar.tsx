'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import AffiliateLink from '@/components/monetization/AffiliateLink';

interface SidebarLink {
  label: string;
  href: string;
}

interface SidebarSection {
  title: string;
  icon: string;
  children: SidebarLink[];
}

const SECTIONS: SidebarSection[] =[
  {
    title: 'Markets',
    icon: '📊',
    children:[
      { label: 'Spot', href: '/data/markets/spot' },
      { label: 'Futures', href: '/data/markets/futures' },
      { label: 'Crypto Indices', href: '/data/markets/indices' },
      { label: 'CME COTs', href: '/data/markets/cme-cots' },
      { label: 'Options', href: '/data/markets/options' },
      { label: 'Prices', href: '/data/markets/prices' },
      { label: 'Volumes', href: '/data/markets/volumes' },
    ],
  },
  {
    title: 'On-Chain Metrics',
    icon: '⛓️',
    children:[
      { label: 'Bitcoin', href: '/data/onchain/bitcoin' },
      { label: 'Ethereum', href: '/data/onchain/ethereum' },
      { label: 'Solana', href: '/data/onchain/solana' },
      { label: 'Flows', href: '/data/onchain/flows' },
    ],
  },
  {
    title: 'DeFi',
    icon: '🔄',
    children:[
      { label: 'Exchange Volume', href: '/data/defi/dex-volume' },
      { label: 'Value Locked', href: '/data/defi/tvl' },
      { label: 'Yields', href: '/data/defi/yields' },
      { label: 'Protocol Revenue', href: '/data/defi/revenue' },
      { label: 'Whale Watch', href: '/data/defi/whale-watch' },
    ],
  },
  {
    title: 'Stablecoins',
    icon: '💵',
    children:[
      { label: 'USD Pegged', href: '/data/stablecoins/usd' },
      { label: 'Non-USD Pegged', href: '/data/stablecoins/non-usd' },
      { label: 'By Chain', href: '/data/stablecoins/chains' },
    ],
  },
  {
    title: 'Scaling & L2',
    icon: '⚡',
    children:[
      { label: 'Overview', href: '/data/scaling' },
      { label: 'Optimistic Rollups', href: '/data/scaling/optimistic' },
      { label: 'ZK Rollups', href: '/data/scaling/zk' },
    ],
  },
  {
    title: 'NFTs',
    icon: '🖼️',
    children:[
      { label: 'Top Collections', href: '/data/nfts/collections' },
      { label: 'Sales Volume', href: '/data/nfts/volume' },
    ],
  },
];

export default function DataSidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>(['Markets', 'On-Chain Metrics']);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className="w-72 bg-[#050505] border-r border-[#1a1a1a] h-[calc(100vh-3.5rem)] overflow-y-auto sticky top-14 hidden lg:flex flex-col font-mono text-xs">
      <div className="p-6 flex-1">
        <div className="uppercase text-[10px] tracking-[0.2em] text-[#FABF2C] mb-6 font-black">DATA TERMINAL</div>
        
        {SECTIONS.map((section) => {
          const isOpen = openSections.includes(section.title);
          return (
            <div key={section.title} className="mb-6">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between py-2 text-white hover:text-[#FABF2C] transition-colors font-black uppercase tracking-widest text-left"
              >
                <span className="flex items-center gap-2">
                  <span>{section.icon}</span> {section.title}
                </span>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              
              {isOpen && (
                <div className="pl-6 border-l border-[#1a1a1a] mt-1 space-y-0.5">
                  {section.children.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block py-1.5 px-3 rounded transition-all text-[#888] hover:text-white hover:bg-[#1a1a1a] ${
                        pathname === link.href ? 'text-[#FABF2C] bg-[#1a1a1a] font-bold' : ''
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Monetization Block */}
      <div className="p-6 border-t border-[#1a1a1a] bg-[#0a0a0a]">
        <h4 className="text-[10px] font-black text-[#FABF2C] uppercase tracking-[0.2em] mb-2">Trade the Data</h4>
        <p className="text-[#888] text-[10px] mb-4 leading-relaxed">
          Execute your thesis. Get up to $5,000 in bonuses on our partner exchange.
        </p>
        <AffiliateLink 
          exchange="bybit" 
          className="block w-full text-center bg-[#111] border border-[#1a1a1a] hover:bg-[#FABF2C] text-[#888] hover:text-black py-3 text-[10px] uppercase tracking-widest transition-all"
        >
          Claim Bonus
        </AffiliateLink>
      </div>
    </aside>
  );
}
