'use client';

import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function BlockChartCard({ title, type, data, series, stacked = false, yAxisFormat = 'number' }: any) {
  
  const formatYAxis = (tick: number) => {
    if (yAxisFormat === 'currency') {
      if (tick >= 1e9) return `$${(tick / 1e9).toFixed(1)}B`;
      if (tick >= 1e6) return `$${(tick / 1e6).toFixed(1)}M`;
      return `$${tick.toLocaleString()}`;
    }
    return tick.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111] border border-[#333] p-3 text-xs z-50">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-6 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[#888]">{entry.name}</span>
              </div>
              <span className="text-white font-mono">
                {yAxisFormat === 'currency' 
                  ? `$${Number(entry.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}` 
                  : Number(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const common = { data, margin: { top: 10, right: 10, left: 0, bottom: 0 } };
    if (type === 'bar') {
      return (
        <BarChart {...common}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} width={50} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fff', opacity: 0.05 }} />
          {series.map((s: any) => <Bar key={s.key} dataKey={s.key} name={s.name} stackId={stacked ? "a" : undefined} fill={s.color} isAnimationActive={false} />)}
        </BarChart>
      );
    }
    return (
      <LineChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} dy={10} />
        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} width={50} />
        <Tooltip content={<CustomTooltip />} />
        {series.map((s: any) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />)}
      </LineChart>
    );
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded overflow-hidden flex flex-col h-[380px]">
      <div className="p-4 border-b border-[#27272a]">
        <h3 className="text-white text-sm font-bold mb-3">{title}</h3>
        <div className="flex flex-wrap gap-3">
          {series.map((s: any) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] text-[#a1a1aa] uppercase">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 pb-0 min-h-0">
        <ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer>
      </div>
      <div className="px-4 py-3 bg-[#111113] border-t border-[#27272a] text-[9px] text-[#71717a] font-mono">
        DATA: REAL-TIME API FETCH
      </div>
    </div>
  );
}
