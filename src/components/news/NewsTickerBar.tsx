'use client';
import React, { useState } from 'react';
import useSWR from 'swr';
import type { WeightedArticle } from '@/lib/types';

// Fetches via API — no server lib imports needed
const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(d => Array.isArray(d.results) ? d.results : []);

export default function NewsTickerBar() {
  const { data: articles = [] } = useSWR<WeightedArticle[]>(
    '/api/news/search?q=crypto',
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: false }
  );

  const [paused, setPaused] = useState(false);
  const items = (articles as WeightedArticle[]).slice(0, 12);
  const doubled = [...items, ...items];

  if (items.length === 0) return null;

  return (
    <div
      className="w-full bg-[#0a0a0a] border-b border-[#1a1a1a] overflow-hidden py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-0">
        <div className="shrink-0 bg-[#FABF2C] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 mr-4 z-10">
          LIVE
        </div>

        <div className="overflow-hidden flex-1">
          <div
            className="flex gap-8 whitespace-nowrap"
            style={{
              animation: paused ? 'none' : 'ticker-scroll 60s linear infinite',
            }}
          >
            {doubled.map((a, i) => (
              <a
                key={`${a.id}-${i}`}
                href={(a.url ?? '').startsWith('http') ? a.url : `/news/${a.id}`}
                target={a.sourceType === 'wire' ? '_blank' : undefined}
                rel={a.sourceType === 'wire' ? 'noopener noreferrer' : undefined}
                className="shrink-0 text-[10px] font-mono text-[#888] hover:text-[#FABF2C] transition-colors flex items-center gap-2"
              >
                <span className="text-[#333]">•</span>
                {a.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
