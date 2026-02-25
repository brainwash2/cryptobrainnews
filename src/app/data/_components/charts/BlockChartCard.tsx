'use client';

import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function BlockChartCard({ title, type, data, series, stacked = false, expandType = 'none', yAxisFormat = 'number' }: any) {
  const formatYAxis = (tick: number) => {
    if (expandType === 'expand') return `${(tick * 100).toFixed(0)}%`;
    if (yAxisFormat === 'percent') return `${tick}%`;
    if (yAxisFormat === 'currency') {
      if (tick >= 1e9) return `$${(tick / 1e9).toFixed(0)}b`;
      if (tick >= 1e6) return `$${(tick / 1e6).toFixed(0)}m`;
      return `$${tick}`;
    }
    return tick.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111] border border-[#333] p-3 text-xs z-[100] shadow-xl rounded-sm min-w-[150px]">
          <p className="text-white font-bold mb-2 pb-2 border-b border-[#333]">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-6 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[#a1a1aa] font-medium">{entry.name}</span>
              </div>
              <span className="text-white font-mono font-bold">
                {expandType === 'expand' 
                  ? `${(entry.value * 100).toFixed(2)}%` 
                  : yAxisFormat === 'currency' 
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
    const common = { data, margin: { top: 0, right: 0, left: 0, bottom: 0 } };
    if (type === 'bar') {
      return (
        <BarChart {...common} stackOffset={expandType === 'expand' ? "expand" : "none"}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
          <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} width={50} dx={-5} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
          {series.map((s: any) => <Bar key={s.key} dataKey={s.key} name={s.name} stackId={stacked ? "a" : undefined} fill={s.color} isAnimationActive={false} />)}
        </BarChart>
      );
    }
    if (type === 'area') {
      return (
        <AreaChart {...common} stackOffset={expandType === 'expand' ? "expand" : "none"}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
          <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} width={50} dx={-5} />
          <Tooltip content={<CustomTooltip />} />
          {series.map((s: any) => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stackId={stacked ? "a" : undefined} stroke={s.color} fill={s.color} fillOpacity={1} isAnimationActive={false} />)}
        </AreaChart>
      );
    }
    return (
      <LineChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} width={50} dx={-5} />
        <Tooltip content={<CustomTooltip />} />
        {series.map((s: any) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />)}
      </LineChart>
    );
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-lg flex flex-col font-sans shadow-xl overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b border-[#27272a] bg-[#18181b]">
        <div className="w-8 h-8 border border-[#3f3f46] rounded flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        </div>
      </div>
      <div className="pt-6 pb-4 px-6 text-center">
        <h3 className="text-white text-lg font-medium tracking-tight mb-3">{title}</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {series.map((s: any) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] text-[#a1a1aa] font-medium">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Explicit Height stops the Recharts -1 bug */}
      <div className="w-full h-[280px] px-4">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className="bg-[#09090b] border-t border-[#27272a] p-4 flex justify-between items-center mt-4">
        <span className="text-[#71717a] text-[9px] font-mono tracking-widest uppercase">DATA: REAL-TIME APIS</span>
        <button className="bg-[#2563eb] text-white px-4 py-2 rounded text-xs font-bold">Request Data</button>
      </div>
    </div>
  );
}
