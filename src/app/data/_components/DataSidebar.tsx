'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarLink {
  label: string;
  href: string;
}

interface SidebarSection {
  title: string;
  icon: string;
  children: SidebarLink[];
}

const SECTIONS: SidebarSection[] = [
  {
    title: 'Markets',
    icon: '📊',
    children: [
      { label: 'Spot', href: '/data/markets/spot' },
      { label: 'Futures', href: '/data/markets/futures' },
      { label: 'Crypto Indices', href: '/data/markets/indices' },
      { label: 'CME COTs', href: '/data/markets/cme-cots' },
      { label: 'Options', href: '/data/markets/options' },
      { label: 'Prices', href: '/data/markets/prices' },
      { label: 'Companies', href: '/data/markets/companies' },
      { label: 'Exchange Tokens', href: '/data/markets/exchange-tokens' },
      { label: 'Sports Tokens', href: '/data/markets/sports-tokens' },
    ],
  },
  {
    title: 'ETFs',
    icon: '📈',
    children: [
      { label: 'Bitcoin ETFs', href: '/data/etfs/bitcoin' },
      { label: 'Ethereum ETFs', href: '/data/etfs/ethereum' },
      { label: 'Solana ETFs', href: '/data/etfs/solana' },
      { label: 'XRP ETFs', href: '/data/etfs/xrp' },
      { label: 'Crypto ETFs', href: '/data/etfs/crypto' },
      { label: 'ETF Comparison', href: '/data/etfs/comparison' },
    ],
  },
  {
    title: 'Treasuries',
    icon: '🏦',
    children: [
      { label: 'Bitcoin Treasuries', href: '/data/treasuries/bitcoin' },
      { label: 'Ethereum Treasuries', href: '/data/treasuries/ethereum' },
      { label: 'Solana Treasuries', href: '/data/treasuries/solana' },
      { label: 'Crypto Treasuries', href: '/data/treasuries/crypto' },
    ],
  },
  {
    title: 'Stablecoins',
    icon: '💵',
    children: [
      { label: 'USD Pegged', href: '/data/stablecoins/usd' },
      { label: 'Non-USD Pegged', href: '/data/stablecoins/non-usd' },
      { label: 'Non-Fiat Pegged', href: '/data/stablecoins/non-fiat' },
    ],
  },
  {
    title: 'On-Chain Metrics',
    icon: '⛓️',
    children: [
      { label: 'Bitcoin', href: '/data/onchain/bitcoin' },
      { label: 'Ethereum', href: '/data/onchain/ethereum' },
      { label: 'Solana', href: '/data/onchain/solana' },
      { label: 'Avalanche', href: '/data/onchain/avalanche' },
      { label: 'Aptos', href: '/data/onchain/aptos' },
      { label: 'Comparison', href: '/data/onchain/comparison' },
      { label: 'Flows', href: '/data/onchain/flows' },
    ],
  },
  {
    title: 'Scaling Solutions',
    icon: '⚡',
    children: [
      { label: 'Overview', href: '/data/scaling' },
      { label: 'Layer 1: EVM Blockchains', href: '/data/scaling/l1-evm' },
      { label: 'Layer 1: Non-EVM Blockchains', href: '/data/scaling/l1-non-evm' },
      { label: 'Layer 2: Optimistic Rollups', href: '/data/scaling/optimistic' },
      { label: 'Layer 2: ZK Rollups', href: '/data/scaling/zk' },
      { label: 'Data Availability', href: '/data/scaling/data-availability' },
    ],
  },
  {
    title: 'DeFi',
    icon: '🔄',
    children: [
      { label: 'Exchange', href: '/data/defi/dex-volume' },
      { label: 'Restaking', href: '/data/defi/restaking' },
      { label: 'Lending', href: '/data/defi/lending' },
      { label: 'Launchpads', href: '/data/defi/launchpads' },
      { label: 'Prediction Markets and Betting', href: '/data/defi/prediction' },
      { label: 'Derivatives', href: '/data/defi/derivatives' },
      { label: 'RWA', href: '/data/defi/rwa' },
      { label: 'Exploits', href: '/data/defi/exploits' },
      { label: 'Protocol Revenue', href: '/data/defi/revenue' },
      { label: 'Value Locked', href: '/data/defi/tvl' },
      { label: 'Social', href: '/data/defi/social' },
    ],
  },
  {
    title: 'NFTs',
    icon: '🖼️',
    children: [
      { label: 'Overview', href: '/data/nfts' },
      { label: 'Art and Collectibles', href: '/data/nfts/art' },
      { label: 'Gaming', href: '/data/nfts/gaming' },
      { label: 'Marketplaces', href: '/data/nfts/marketplaces' },
    ],
  },
];

export default function DataSidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>(['Markets']);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className="w-72 bg-[#050505] border-r border-[#1a1a1a] h-[calc(100vh-3.5rem)] overflow-y-auto sticky top-14 hidden lg:block font-mono text-xs">
      <div className="p-6">
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
    </aside>
  );
}
