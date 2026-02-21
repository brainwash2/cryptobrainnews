'use client';
import React, { useMemo } from 'react';
import type { PriceTableRow, NewsArticle } from '@/lib/types';

interface Props {
  coins: PriceTableRow[];
  news: NewsArticle[];
}

export default function TerminalHighlights({ coins, news }: Props) {
  const stats = useMemo(() => {
    const totalMarketCap = coins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    const totalVolume = coins.reduce((sum, coin) => sum + (coin.total_volume || 0), 0);
    const gainers = [...coins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 3);
    const losers = [...coins].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 3);

    return { totalMarketCap, totalVolume, gainers, losers };
  }, [coins]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Market Summary */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">
            Market Overview
          </h3>
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full animate-pulse" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-[9px] font-mono text-[#555] uppercase mb-1">
              Total Market Cap
            </div>
            <div className="text-2xl font-black text-[#FABF2C]">
              ${(stats.totalMarketCap / 1e12).toFixed(2)}T
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-[#555] uppercase mb-1">
              24h Volume
            </div>
            <div className="text-2xl font-black text-white">
              ${(stats.totalVolume / 1e9).toFixed(1)}B
            </div>
          </div>
        </div>
      </div>

      {/* Gainers & Losers */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6">
          Market Movers
        </h3>
        <div className="space-y-6">
          <div>
            <div className="text-[9px] font-black text-green-500 uppercase mb-3">
              🔥 Top Gainers (24h)
            </div>
            <div className="space-y-2">
              {stats.gainers.slice(0, 2).map((coin) => (
                <div key={coin.id} className="flex justify-between items-center">
                  <span className="text-xs text-white font-bold">
                    {coin.symbol}
                  </span>
                  <span className="text-xs font-black text-green-500">
                    +{coin.price_change_percentage_24h?.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-black text-red-500 uppercase mb-3">
              ❄️ Top Losers (24h)
            </div>
            <div className="space-y-2">
              {stats.losers.slice(0, 2).map((coin) => (
                <div key={coin.id} className="flex justify-between items-center">
                  <span className="text-xs text-white font-bold">
                    {coin.symbol}
                  </span>
                  <span className="text-xs font-black text-red-500">
                    {coin.price_change_percentage_24h?.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}