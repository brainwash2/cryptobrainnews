'use client';

import React from 'react';
import type { CoinMarketData } from '@/lib/types';
import MiniSparkline from './MiniSparkline';

interface Props {
  coin: CoinMarketData;
  isEven: boolean;
}

// Format price with appropriate decimals
function fmtPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(6);
}

// Format large numbers
function fmtCompact(val: number): string {
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

// Color class for percentage change
function changeColor(val: number | null | undefined): string {
  if (!val) return 'text-[#555]';
  if (val > 0) return 'text-[#00d672]';
  if (val < 0) return 'text-[#ff4757]';
  return 'text-[#555]';
}

function fmtChange(val: number | null | undefined): string {
  if (!val) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
}

export default function TerminalTableRow({ coin, isEven }: Props) {
  const bg = isEven ? 'bg-[#080808]' : 'bg-[#0b0b0b]';

  return (
    <tr
      className={`${bg} border-b border-[#111] hover:bg-[#0f0f0f] transition-colors duration-75 group`}
    >
      {/* Rank */}
      <td className="px-3 py-[10px] w-10">
        <span className="text-[11px] font-mono text-[#444] tabular-nums">
          {coin.market_cap_rank || '—'}
        </span>
      </td>

      {/* Asset */}
      <td className="px-3 py-[10px]">
        <div className="flex items-center gap-2.5 min-w-[140px]">
          {coin.image && (
            <img
              src={coin.image}
              alt={coin.name}
              className="w-5 h-5 rounded-full flex-shrink-0"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-white tracking-wide">
              {coin.symbol.toUpperCase()}
            </span>
            <span className="text-[10px] text-[#444] font-mono hidden xl:inline truncate max-w-[100px]">
              {coin.name}
            </span>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-3 py-[10px] text-right">
        <span className="text-[12px] font-mono font-bold text-white tabular-nums">
          ${fmtPrice(coin.current_price || 0)}
        </span>
      </td>

      {/* 24H % */}
      <td className="px-3 py-[10px] text-right">
        <span className={`text-[11px] font-mono font-bold tabular-nums ${changeColor(coin.price_change_percentage_24h)}`}>
          {fmtChange(coin.price_change_percentage_24h)}
        </span>
      </td>

      {/* 7D % */}
      <td className="px-3 py-[10px] text-right">
        <span className={`text-[11px] font-mono font-bold tabular-nums ${changeColor(coin.price_change_percentage_7d)}`}>
          {fmtChange(coin.price_change_percentage_7d)}
        </span>
      </td>

      {/* Market Cap */}
      <td className="px-3 py-[10px] text-right">
        <span className="text-[11px] font-mono text-[#888] tabular-nums">
          {fmtCompact(coin.market_cap || 0)}
        </span>
      </td>

      {/* Volume */}
      <td className="px-3 py-[10px] text-right">
        <span className="text-[11px] font-mono text-[#666] tabular-nums">
          {fmtCompact(coin.total_volume || 0)}
        </span>
      </td>

      {/* Sparkline */}
      <td className="px-3 py-[10px] w-[100px]">
        {coin.sparkline_in_7d?.price && (
          <MiniSparkline
            data={coin.sparkline_in_7d.price}
            isPositive={(coin.price_change_percentage_7d || 0) >= 0}
          />
        )}
      </td>
    </tr>
  );
}
