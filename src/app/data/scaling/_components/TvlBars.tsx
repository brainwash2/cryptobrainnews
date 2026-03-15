import React from 'react';
import type { ScalingChain } from '@/lib/scaling-data';

interface Props {
  chains:   ScalingChain[];
  maxItems?: number;
  title?:   string;
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return '—';
}

export function TvlBars({ chains, maxItems = 12, title = 'TVL Market Share' }: Props) {
  const top     = chains.slice(0, maxItems);
  const maxTvl  = top[0]?.tvl ?? 1;
  const totalTvl = chains.reduce((s, c) => s + c.tvl, 0);

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-6">
        {title}
      </h3>
      <div className="space-y-2">
        {top.map((c) => {
          const share = totalTvl > 0 ? (c.tvl / totalTvl) * 100 : 0;
          const barW  = maxTvl  > 0 ? (c.tvl / maxTvl)   * 100 : 0;
          return (
            <div key={c.slug} className="flex items-center gap-3">
              <span className="w-28 text-right font-bold text-white text-[10px] shrink-0 truncate">
                {c.name}
              </span>
              <div className="flex-1 h-4 bg-[#111] overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${barW}%`, background: c.color, opacity: 0.8 }}
                />
              </div>
              <span
                className="w-20 text-right font-mono text-[10px] tabular-nums shrink-0"
                style={{ color: c.color }}
              >
                {fmtUsd(c.tvl)}
              </span>
              <span className="w-12 text-right font-mono text-[10px] text-[#555] tabular-nums shrink-0">
                {share.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TvlBars;
