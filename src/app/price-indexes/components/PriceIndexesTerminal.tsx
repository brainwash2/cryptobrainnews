// src/app/price-indexes/components/PriceIndexesTerminal.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { PriceTableRow, NewsArticle } from '@/lib/types';
import TerminalTableRow from './TerminalTableRow';
import MiniSparkline from './MiniSparkline';
import TerminalHighlights from './TerminalHighlights';

interface Props {
  initialCoins: PriceTableRow[];
  initialNews: NewsArticle[];
}

type SortField = 'rank' | 'price' | 'change1h' | 'change24h' | 'change7d' | 'marketCap' | 'volume24h';
type SortDir = 'asc' | 'desc';

export default function PriceIndexesTerminal({ initialCoins, initialNews }: Props) {
  const [coins] = useState<PriceTableRow[]>(initialCoins);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'rank' ? 'asc' : 'desc');
    }
  }, [sortField]);

  const filteredAndSorted = useMemo(() => {
    let result = [...coins];

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const multiplier = sortDir === 'asc' ? 1 : -1;
      return (Number(aVal) - Number(bVal)) * multiplier;
    });

    return result;
  }, [coins, sortField, sortDir, searchQuery]);

  const SortHeader = ({
    field,
    label,
    align = 'right',
  }: {
    field: SortField;
    label: string;
    align?: 'left' | 'right';
  }) => {
    const isActive = sortField === field;
    return (
      <th
        className={`px-3 py-2 cursor-pointer select-none group whitespace-nowrap ${
          align === 'right' ? 'text-right' : 'text-left'
        }`}
        onClick={() => handleSort(field)}
      >
        <span
          className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
            isActive
              ? 'text-primary'
              : 'text-[#555] group-hover:text-[#888]'
          }`}
        >
          {label}
          {isActive && (
            <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
          )}
        </span>
      </th>
    );
  };

  return (
    <div className="space-y-6">
      {/* Terminal Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-green-500 uppercase tracking-[0.3em]">
              LIVE
            </span>
          </div>
          <h1 className="text-3xl font-black font-heading uppercase tracking-tight text-white">
            Price <span className="text-primary">Index</span>
          </h1>
          <p className="text-[10px] font-mono text-[#555] uppercase tracking-[0.2em] mt-1">
            TOP {coins.length} ASSETS BY MARKET CAP • USD
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH ASSET..."
            className="bg-[#0a0a0a] border border-[#1a1a1a] text-white font-mono text-[11px] 
                       px-4 py-2 w-64 outline-none focus:border-primary/50 placeholder:text-[#333]
                       uppercase tracking-wider"
          />
        </div>
      </div>

      {/* Highlight Cards */}
      <TerminalHighlights coins={coins} news={initialNews} />

      {/* ─── THE TABLE ─────────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* STICKY HEADER */}
            <thead className="sticky top-0 z-10 bg-[#0a0a0a] border-b-2 border-[#1a1a1a]">
              <tr>
                <SortHeader field="rank" label="#" align="left" />
                <th className="px-3 py-2 text-left">
                  <span className="text-[10px] font-black text-[#555] uppercase tracking-wider">
                    Asset
                  </span>
                </th>
                <SortHeader field="price" label="Price" />
                <SortHeader field="change1h" label="1H %" />
                <SortHeader field="change24h" label="24H %" />
                <SortHeader field="change7d" label="7D %" />
                <SortHeader field="marketCap" label="Mkt Cap" />
                <SortHeader field="volume24h" label="Vol 24H" />
                <th className="px-3 py-2 text-right">
                  <span className="text-[10px] font-black text-[#555] uppercase tracking-wider">
                    7D Chart
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAndSorted.map((coin, index) => (
                <TerminalTableRow
                  key={coin.id}
                  coin={coin}
                  isEven={index % 2 === 0}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[#333] font-mono text-xs uppercase tracking-widest">
              No assets match "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Terminal footer */}
      <div className="flex justify-between items-center text-[9px] font-mono text-[#333] uppercase tracking-widest px-1">
        <span>DATA: COINGECKO API • REFRESH: 60S</span>
        <span>{filteredAndSorted.length} ASSETS</span>
      </div>
    </div>
  );
}
