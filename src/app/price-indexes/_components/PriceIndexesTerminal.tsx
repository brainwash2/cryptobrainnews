'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CoinMarketData, NewsArticle } from '@/lib/types';
import MiniSparkline from './MiniSparkline';

interface Props {
  prices: CoinMarketData[];
  news: NewsArticle[];
}

const CATEGORIES = [
  'All Coins', 'Solana Ecosystem', 'Stablecoin', 'Ethereum Ecosystem', 'Meme', 'AI Agents',
  'DeFi', 'Gaming', 'Real World Assets', 'Layer 1', 'Layer 2', 'ZK Proofs', 'DePIN'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CAD', 'AUD'];

export default function PriceIndexesTerminal({ prices, news }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCurrency = (searchParams.get('currency') || 'usd').toUpperCase();
  const [activeCat, setActiveCat] = useState('All Coins');
  const [search, setSearch] = useState('');

  // Hot News extraction
  const hotNews = news.slice(0, 3);
  const topGainers = [...prices].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 3);
  const topLosers = [...prices].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 3);

  const formatUsd = (val: number, isPrice = false) => {
    const symbol = currentCurrency === 'EUR' ? '€' : currentCurrency === 'GBP' ? '£' : '$';
    if (isPrice) {
      if (val >= 1000) return `${symbol}${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      if (val >= 1) return `${symbol}${val.toFixed(2)}`;
      return `${symbol}${val.toFixed(6)}`;
    }
    if (val >= 1e12) return `${symbol}${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `${symbol}${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${symbol}${(val / 1e6).toFixed(2)}M`;
    return `${symbol}${val.toLocaleString()}`;
  };

  const ColorPct = ({ val }: { val?: number | null }) => {
    if (!val) return <span className="text-[#555]">—</span>;
    const isPos = val >= 0;
    return (
      <span className={`font-mono font-bold ${isPos ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
        {isPos ? '▲' : '▼'} {Math.abs(val).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-full overflow-hidden">
      {/* HEADER ROW: Title + Currency */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Cryptocurrency <span className="text-[#FABF2C]">Prices</span>
          </h1>
          <p className="text-[10px] font-mono text-[#555] uppercase mt-2">
            Global market cap is {formatUsd(prices.reduce((s, p) => s + (p.market_cap || 0), 0))}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#1a1a1a] p-1">
          {CURRENCIES.map(c => (
            <button 
              key={c}
              onClick={() => router.push(`?currency=${c.toLowerCase()}`)}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${currentCurrency === c ? 'bg-[#FABF2C] text-black' : 'text-[#555] hover:text-white'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* HOT MARKET NEWS & GAINERS/LOSERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6">Hot Market News</h2>
          <div className="space-y-4">
            {hotNews.map(n => (
              <a key={n.id} href={n.url} target="_blank" rel="noreferrer" className="flex gap-4 group">
                <div className="w-24 h-16 relative shrink-0 overflow-hidden border border-white/5">
                  <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-300 group-hover:text-[#FABF2C] transition-colors leading-tight">{n.title}</h3>
                  <span className="text-[9px] font-mono text-[#555] uppercase">{n.source}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <h2 className="text-[10px] font-black text-[#00d672] uppercase tracking-[0.3em] mb-4">Top Gainers 24h</h2>
            {topGainers.map(c => (
              <div key={c.id} className="flex justify-between items-center mb-2 last:mb-0">
                <div className="flex items-center gap-2">
                  <img src={c.image} alt={c.name} className="w-4 h-4 rounded-full" />
                  <span className="text-xs font-bold text-white uppercase">{c.symbol}</span>
                </div>
                <ColorPct val={c.price_change_percentage_24h} />
              </div>
            ))}
          </div>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <h2 className="text-[10px] font-black text-[#ff4757] uppercase tracking-[0.3em] mb-4">Top Losers 24h</h2>
            {topLosers.map(c => (
              <div key={c.id} className="flex justify-between items-center mb-2 last:mb-0">
                <div className="flex items-center gap-2">
                  <img src={c.image} alt={c.name} className="w-4 h-4 rounded-full" />
                  <span className="text-xs font-bold text-white uppercase">{c.symbol}</span>
                </div>
                <ColorPct val={c.price_change_percentage_24h} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORIES SCROLLER */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide border-b border-[#1a1a1a]">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
              activeCat === cat ? 'bg-[#FABF2C] text-black border-[#FABF2C]' : 'bg-[#0a0a0a] text-[#888] border-[#1a1a1a] hover:border-[#333]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="border border-[#1a1a1a] bg-[#080808] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap">
            <thead className="bg-[#0a0a0a] border-b-2 border-[#1a1a1a]">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-black text-[#555] uppercase">#</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-[#555] uppercase">Name</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-[#555] uppercase">Price</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-[#555] uppercase">1h %</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-[#555] uppercase">24h %</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-[#555] uppercase">7d %</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-[#555] uppercase">Market Cap</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-[#555] uppercase">24h Volume</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-[#555] uppercase">7d Chart</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((coin, idx) => (
                <tr key={coin.id} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${idx % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0b0b0b]'}`}>
                  <td className="px-4 py-4 text-[11px] font-mono text-[#444]">{coin.market_cap_rank || '—'}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {coin.image && <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />}
                      <div>
                        <span className="text-[12px] font-bold text-white block">{coin.name}</span>
                        <span className="text-[10px] font-mono text-[#666] uppercase">{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-[12px] font-mono font-bold text-white">{formatUsd(coin.current_price, true)}</td>
                  {/* @ts-ignore - injecting 1h from API */}
                  <td className="px-4 py-4 text-right text-[11px]"><ColorPct val={coin.price_change_percentage_1h_in_currency} /></td>
                  <td className="px-4 py-4 text-right text-[11px]"><ColorPct val={coin.price_change_percentage_24h} /></td>
                  <td className="px-4 py-4 text-right text-[11px]"><ColorPct val={coin.price_change_percentage_7d} /></td>
                  <td className="px-4 py-4 text-right text-[11px] font-mono text-[#888]">{formatUsd(coin.market_cap)}</td>
                  <td className="px-4 py-4 text-right text-[11px] font-mono text-[#666]">{formatUsd(coin.total_volume)}</td>
                  <td className="px-4 py-4 w-[100px]">
                    {coin.sparkline_in_7d?.price && (
                      <MiniSparkline data={coin.sparkline_in_7d.price} isPositive={(coin.price_change_percentage_7d || 0) >= 0} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
