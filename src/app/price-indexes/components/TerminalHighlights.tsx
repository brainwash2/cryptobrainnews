// src/app/price-indexes/components/TerminalHighlights.tsx
'use client';

import React, { useMemo } from 'react';
import type { PriceTableRow, NewsArticle } from '@/lib/types';

interface Props {
  coins: PriceTableRow[];
  news: NewsArticle[];
}

function ChangeCell({ value }: { value: number }) {
  const color =
    value > 0 ? 'text-[#00d672]' : value < 0 ? 'text-[#ff4757]' : 'text-[#555]';
  const prefix = value > 0 ? '+' : '';
  return (
    <span className={`font-mono font-bold text-sm tabular-nums ${color}`}>
      {prefix}{value.toFixed(2)}%
    </span>
  );
}

export default function TerminalHighlights({ coins, news }: Props) {
  const { gainers, losers, totalMcap } = useMemo(() => {
    const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);
    const totalMcap = coins.reduce((sum, c) => sum + c.marketCap, 0);
    return {
      gainers: sorted.slice(0, 4),
      losers: sorted.slice(-4).reverse(),
      totalMcap,
    };
  }, [coins]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Gainers */}
      <div className="bg-[#080808] border border-[#1a1a1a] p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#111]">
          <span className="text-[10px] font-black text-[#00d672] uppercase tracking-[0.2em]">
            ▲ TOP GAINERS
          </span>
          <span className="text-[9px] font-mono text-[#333]">24H</span>
        </div>
        <div className="space-y-2">
          {gainers.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={c.image} alt="" className="w-4 h-4 rounded-full" onError={e => e.currentTarget.style.display='none'} />
                <span className="text-[11px] font-bold text-white">{c.symbol.toUpperCase()}</span>
              </div>
              <ChangeCell value={c.change24h} />
            </div>
          ))}
        </div>
      </div>

      {/* Losers */}
      <div className="bg-[#080808] border border-[#1a1a1a] p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#111]">
          <span className="text-[10px] font-black text-[#ff4757] uppercase tracking-[0.2em]">
            ▼ TOP LOSERS
          </span>
          <span className="text-[9px] font-mono text-[#333]">24H</span>
        </div>
        <div className="space-y-2">
          {losers.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={c.image} alt="" className="w-4 h-4 rounded-full" onError={e => e.currentTarget.style.display='none'} />
                <span className="text-[11px] font-bold text-white">{c.symbol.toUpperCase()}</span>
              </div>
              <ChangeCell value={c.change24h} />
            </div>
          ))}
        </div>
      </div>

      {/* Market Pulse */}
      <div className="bg-[#080808] border border-[#1a1a1a] p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#111]">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            ◆ MARKET WIRE
          </span>
          <span className="text-[9px] font-mono text-[#333]">LIVE</span>
        </div>
        <div className="space-y-2.5">
          {news.slice(0, 4).map((n, i) => (
            <a
              key={n.id || i}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <p className="text-[10px] font-bold text-[#888] group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                {n.title}
              </p>
              <span className="text-[9px] font-mono text-[#333]">
                {n.source}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
