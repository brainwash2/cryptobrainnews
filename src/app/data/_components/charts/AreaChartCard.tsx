'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface AreaChartCardProps<T> {
  title: string;
  subtitle?: string;
  source?: string;
  data: T[];
  xKey: Extract<keyof T, string>;
  yKey: Extract<keyof T, string>;
  yFormat?: 'usd' | 'number' | 'percent';
  color?: string;
  height?: number;
}

export default function AreaChartCard<T extends Record<string, unknown>>({ 
  title, subtitle, source, data, xKey, yKey, yFormat = 'usd', color = '#FABF2C', height = 320 
}: AreaChartCardProps<T>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatValue = (v: unknown): string => {
    const val = Number(v);
    if (isNaN(val)) return '—';
    if (yFormat === 'usd') {
      if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
      if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
      return `$${val.toLocaleString()}`;
    }
    return val.toLocaleString();
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-white font-black text-xs uppercase tracking-widest border-l-2 border-primary pl-3">{title}</h3>
          {subtitle && <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">{subtitle}</p>}
        </div>
        {source && <span className="text-[9px] font-mono text-[#333] uppercase">{source}</span>}
      </div>
      
      <div style={{ width: '100%', height: height - 80, position: 'relative' }}>
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis 
                dataKey={xKey as string} 
                stroke="#444" 
                fontSize={10} 
                fontFamily="monospace" 
                minTickGap={30}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#444" 
                fontSize={10} 
                fontFamily="monospace" 
                tickFormatter={formatValue} 
                width={45}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                formatter={(value: unknown) => [formatValue(value), yKey as string]}
                labelStyle={{ color: '#888', fontSize: 10 }}
                cursor={{ stroke: '#333', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey={yKey as string} 
                stroke={color} 
                fill={`url(#grad-${yKey})`} 
                strokeWidth={2} 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-end justify-between px-4 pb-4 opacity-20">
             {[30, 50, 40, 70, 60, 80].map((h, i) => (
               <div key={i} style={{ height: `${h}%` }} className="w-[10%] bg-gray-700 rounded-t" />
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
