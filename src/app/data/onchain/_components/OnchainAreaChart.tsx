'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { RechartsFormatter } from '@/app/data/_lib/recharts-utils';

// ── Loose enough to accept ChainHistoryPoint, DuneRow mappings, etc. ─────────
type DataPoint = Record<string, unknown>;

interface Props {
  title:       string;
  subtitle?:   string;
  data:        DataPoint[];
  dataKey:     string;
  color:       string;
  yFormatter?: (v: number) => string;
  height?:     number;
}

export function OnchainAreaChart({
  title, subtitle, data, dataKey, color,
  yFormatter = (v) => `$${(v / 1e9).toFixed(1)}B`,
  height = 240,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const tooltipFormatter: RechartsFormatter = (value, name) => {
    const n = Number(value ?? 0);
    return [isNaN(n) ? '—' : yFormatter(n), String(name)];
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <div className="mb-4">
        <h3
          className="text-xs font-black uppercase tracking-widest text-white border-l-2 pl-3"
          style={{ borderColor: color }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">{subtitle}</p>
        )}
      </div>
      <div style={{ height }}>
        {mounted && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#444"
                fontSize={9}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                stroke="#444"
                fontSize={9}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                tickFormatter={yFormatter}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  fontSize: 11,
                }}
                formatter={tooltipFormatter}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fill={`url(#grad-${dataKey})`}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div
            className="flex items-center justify-center text-[#333] font-mono text-xs uppercase"
            style={{ height }}
          >
            {data.length === 0 ? 'No data available' : 'Loading...'}
          </div>
        )}
      </div>
    </div>
  );
}

export default OnchainAreaChart;
