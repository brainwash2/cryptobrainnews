'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { RechartsFormatter } from '@/app/data/_lib/recharts-utils';

interface ArticleData {
  id:     string;
  label:  string;
  color:  string;
  points: Array<{ date: string; views: number }>;
}

interface Props {
  articles: ArticleData[];
}

const tooltipFmt: RechartsFormatter = (value, name) => {
  const n = Number(value ?? 0);
  return [isNaN(n) ? '—' : n.toLocaleString(), String(name)];
};

export default function WikiPageviewsClient({ articles }: Props) {
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(0);
  useEffect(() => { setMounted(true); }, []);

  const article = articles[selected];
  if (!article) return null;

  return (
    <div className="space-y-4">
      {/* ── Selector ─────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {articles.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setSelected(i)}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all"
            style={{
              borderColor:  a.color,
              color:        selected === i ? '#000' : a.color,
              background:   selected === i ? a.color : 'transparent',
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* ── Chart ────────────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <div className="mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 pl-3"
              style={{ borderColor: article.color }}>
            {article.label} — Daily Wikipedia Pageviews (30D)
          </h3>
          <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
            Source: Wikimedia Analytics REST API
          </p>
        </div>
        <div className="h-60">
          {mounted && article.points.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={article.points} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="wikiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={article.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={article.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="date" stroke="#444" fontSize={9} fontFamily="monospace" tickLine={false} axisLine={false} minTickGap={25} />
                <YAxis stroke="#444" fontSize={9} fontFamily="monospace" tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : String(v)}
                  width={45}
                />
                <Tooltip
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 0, fontFamily: 'monospace', fontSize: 11 }}
                  formatter={tooltipFmt}
                />
                <Area type="monotone" dataKey="views" stroke={article.color} fill="url(#wikiGrad)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#333] font-mono text-xs uppercase">
              {article.points.length === 0 ? 'No pageview data available' : 'Loading...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
