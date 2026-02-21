import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Data Terminal | CryptoBrainNews',
  description: 'Real-time blockchain data, DeFi analytics, NFT metrics, and market intelligence.',
};

const DATA_PAGES = [
  {
    title: 'Markets',
    slug: 'markets',
    description: 'Global crypto market cap, volume, and price indexes',
    icon: '📊',
  },
  {
    title: 'DeFi Protocols',
    slug: 'defi',
    description: 'Total value locked, yields, and protocol analysis',
    icon: '🏦',
  },
  {
    title: 'On-Chain',
    slug: 'onchain',
    description: 'Active addresses, transactions, whale movements',
    icon: '⛓️',
  },
  {
    title: 'ETFs',
    slug: 'etfs',
    description: 'Bitcoin & Ethereum ETF flows and holdings',
    icon: '📈',
  },
  {
    title: 'Stablecoins',
    slug: 'stablecoins',
    description: 'Stablecoin supply, flows, and distribution',
    icon: '💵',
  },
  {
    title: 'NFTs',
    slug: 'nfts',
    description: 'Top collections, volumes, and market metrics',
    icon: '🖼️',
  },
  {
    title: 'DEX Volumes',
    slug: 'exchanges',
    description: 'Decentralized exchange trading volumes by protocol',
    icon: '🔄',
  },
  {
    title: 'Layer 2s',
    slug: 'l2',
    description: 'Arbitrum, Optimism, Base, and ZkSync comparison',
    icon: '🚀',
  },
  {
    title: 'Governance',
    slug: 'governance',
    description: 'DAO votes, proposals, and governance tokens',
    icon: '🗳️',
  },
];

export default function DataIndexPage() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16">
          <h1 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.95]">
            Data <span className="text-[#FABF2C]">Terminal</span>
          </h1>
          <p className="text-gray-400 font-serif text-lg mt-4 max-w-2xl leading-relaxed">
            Real-time blockchain analytics, DeFi metrics, and institutional-grade market intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DATA_PAGES.map((page) => (
            <Link
              key={page.slug}
              href={`/data/${page.slug}`}
              className="group border border-[#1a1a1a] hover:border-[#FABF2C] bg-[#0a0a0a] hover:bg-[#0a0a0a] p-8 transition-all"
            >
              <div className="text-3xl mb-3">{page.icon}</div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 group-hover:text-[#FABF2C] transition-colors">
                {page.title}
              </h3>
              <p className="text-xs text-[#555] leading-relaxed">{page.description}</p>
              <div className="mt-6 flex items-center gap-2 text-[#FABF2C] text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Explore →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
