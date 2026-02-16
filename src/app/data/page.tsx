import React from 'react';
import { getLivePrices, getDeFiProtocols } from '@/lib/api';
import { MetricCard } from './_components/MetricCard';
import Link from 'next/link';

export default async function DataTerminalRoot() {
  const [prices, protocols] = await Promise.all([
    getLivePrices(),
    getDeFiProtocols(),
  ]);

  const totalMcap = prices.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  const totalTVL = protocols.reduce((sum, p) => sum + (p.tvl || 0), 0);
  const btc = prices.find((c) => c.id === 'bitcoin');
  const eth = prices.find((c) => c.id === 'ethereum');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white font-heading uppercase tracking-tighter">
          Data <span className="text-primary">Terminal</span>
        </h1>
        <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          Institutional-Grade Crypto Intelligence
        </p>
        <div className="h-px w-20 bg-primary/40 mt-3" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Crypto Market Cap"
          value={`$${(totalMcap / 1e12).toFixed(2)}T`}
        />
        <MetricCard
          label="BTC Price"
          value={`$${btc?.current_price?.toLocaleString() ?? '—'}`}
          trend={btc?.price_change_percentage_24h ?? undefined}
        />
        <MetricCard
          label="ETH Price"
          value={`$${eth?.current_price?.toLocaleString() ?? '—'}`}
          trend={eth?.price_change_percentage_24h ?? undefined}
        />
        <MetricCard
          label="Total DeFi TVL"
          value={`$${(totalTVL / 1e9).toFixed(2)}B`}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Markets', href: '/data/markets', desc: 'Spot, Futures, Options, Indices' },
          { label: 'ETFs', href: '/data/etfs', desc: 'Bitcoin & Ethereum ETF flows' },
          { label: 'DeFi', href: '/data/defi', desc: 'TVL, DEX Volume, Yields, Whale Watch' },
          { label: 'On-Chain', href: '/data/onchain', desc: 'Active addresses, Gas, CEX flows' },
          { label: 'Scaling', href: '/data/scaling', desc: 'L2 metrics and comparisons' },
          { label: 'NFTs', href: '/data/nfts', desc: 'Sales volume, top collections' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 hover:border-primary/50 transition-colors group"
          >
            <h3 className="text-lg font-black text-white uppercase group-hover:text-primary transition-colors">
              {card.label}
            </h3>
            <p className="text-xs text-[#555] font-mono mt-2">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
