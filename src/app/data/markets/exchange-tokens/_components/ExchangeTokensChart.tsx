'use client';
import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';

interface ExchangeToken {
  symbol: string;
  price_change_percentage_7d_in_currency: number | null;
  current_price: number | null;
}

interface Props {
  tokens: ExchangeToken[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const v: number = payload[0].value;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-mono font-black ${v >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
        {v >= 0 ? '+' : ''}{v.toFixed(2)}%
      </p>
    </div>
  );
}

export default function ExchangeTokensChart({ tokens }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = tokens.map((t) => ({
    name: t.symbol.toUpperCase(),
    change7d: t.price_change_percentage_7d_in_currency ?? 0,
  }));

  if (!mounted) {
    return (
      <div className="h-[200px] flex items-center justify-center text-[#333] font-mono text-xs uppercase animate-pulse">
        Rendering chart…
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#555"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          fontFamily="monospace"
        />
        <YAxis
          stroke="#555"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          width={40}
        />
        <ReferenceLine y={0} stroke="#2a2a2a" strokeWidth={1} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
        <Bar dataKey="change7d" maxBarSize={36} radius={[2, 2, 0, 0]} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={entry.change7d >= 0 ? '#00d672' : '#ff4757'}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
