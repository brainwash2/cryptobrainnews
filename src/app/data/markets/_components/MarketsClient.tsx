'use client';
import React from 'react';
import { formatNumber } from '../../_lib/formatters';

export default function MarketsClient({ global }: { global: any }) {
  if (!global?.data) {
    return (
      <div className="py-20 text-center border border-dashed border-[#1a1a1a]">
        <p className="text-[#333] font-mono text-xs uppercase tracking-widest">No data available</p>
      </div>
    );
  }

  const {
    total_market_cap,
    total_volume,
    btc_dominance,
    eth_dominance,
    market_cap_change_percentage_24h_usd,
  } = global.data;

  const btcCap = total_market_cap?.btc || 0;
  const ethCap = total_market_cap?.eth || 0;
  const usdCap = total_market_cap?.usd || 0;
  const usdVolume = total_volume?.usd || 0;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Market Cap (USD)', value: `$${formatNumber(usdCap)}` },
          { label: '24h Volume (USD)', value: `$${formatNumber(usdVolume)}` },
          { label: 'BTC Dominance', value: `${btc_dominance?.toFixed(2) || '—'}%` },
          { label: '24h Change', value: `${market_cap_change_percentage_24h_usd?.toFixed(2) || '—'}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 hover:border-[#FABF2C]/30 transition-all"
          >
            <div className="text-2xl font-black text-[#FABF2C] font-data tabular-nums">
              {stat.value}
            </div>
            <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="border border-[#1a1a1a] p-8 bg-[#0a0a0a]">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6">
          Top Markets by Cap
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Bitcoin', cap: btcCap, pct: btc_dominance },
            { name: 'Ethereum', cap: ethCap, pct: eth_dominance },
          ].map((market) => (
            <div key={market.name} className="flex justify-between items-center pb-3 border-b border-[#111]">
              <span className="text-xs font-bold text-white uppercase">{market.name}</span>
              <div className="text-right">
                <div className="text-xs font-black text-[#FABF2C]">${formatNumber(market.cap)}</div>
                <div className="text-[9px] text-[#555]">{market.pct?.toFixed(1) || '—'}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
