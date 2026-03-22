"use client";
/**
 * ExchangeTokensChart - client component
 * Recharts horizontal bar chart of 7-day % change.
 * Green bars = positive, red bars = negative.
 */
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

interface ChartRow {
  name:     string;
  change7d: number;
}

interface Props {
  data: ChartRow[];
}

function CustomTooltip({ active, payload, label }: {
  active?:  boolean;
  payload?: Array<{ value: number }>;
  label?:   string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const v = payload[0].value;
  const isPos = v >= 0;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-mono font-black ${isPos ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
        {isPos ? '+' : ''}{v.toFixed(2)}%
      </p>
    </div>
  );
}

export default function ExchangeTokensChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="h-[220px] flex items-center justify-center text-[#333] font-mono text-xs uppercase animate-pulse">
        Rendering chart...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
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
          tickFormatter={(v: number) => `${v}%`}
          width={42}
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