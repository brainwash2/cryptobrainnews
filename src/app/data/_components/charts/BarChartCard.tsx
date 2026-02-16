'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  source?: string;
  data: any[];
  xKey: string;
  yKey: string;
  yFormat?: 'usd' | 'number' | 'percent';
  color?: string;
  height?: number;
}

export default function BarChartCard({ title, subtitle, source, data, xKey, yKey, yFormat = 'usd', color = '#627EEA', height = 320 }: BarChartCardProps) {
  const formatValue = (v: any) => {
    const val = Number(v);
    if (yFormat === 'usd') return `$${val.toLocaleString()}`;
    return val.toLocaleString();
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-white font-black text-xs uppercase tracking-widest border-l-2 border-primary pl-3">{title}</h3>
          {subtitle && <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">{subtitle}</p>}
        </div>
      </div>
      <div style={{ height: height - 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey={xKey} stroke="#444" fontSize={10} fontFamily="monospace" />
            <YAxis stroke="#444" fontSize={10} fontFamily="monospace" tickFormatter={formatValue} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
              formatter={(value: any) => [formatValue(value), yKey]}
            />
            <Bar dataKey={yKey} fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
