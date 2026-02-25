'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function BlockChartCard({ title, type, data, series, stacked = false, expandType = 'none', yAxisFormat = 'number', description = 'Market data fetched via real-time APIs.' }: any) {
  const [zoom, setZoom] = useState('ALL');

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
          <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} width={55} dx={-5} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
          {series.map((s: any) => <Bar key={s.key} dataKey={s.key} name={s.name} stackId={stacked ? "a" : undefined} fill={s.color} isAnimationActive={false} />)}
        </BarChart>
      );
    }
    if (type === 'area') {
      return (
        <AreaChart {...common} stackOffset={expandType === 'expand' ? "expand" : "none"}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} width={55} dx={-5} />
          <Tooltip content={<CustomTooltip />} />
          {series.map((s: any) => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stackId={stacked ? "a" : undefined} stroke={s.color} fill={s.color} fillOpacity={1} isAnimationActive={false} />)}
        </AreaChart>
      );
    }
    return (
      <LineChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
        <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} width={55} dx={-5} />
        <Tooltip content={<CustomTooltip />} />
        {series.map((s: any) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />)}
      </LineChart>
    );
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-lg flex flex-col font-sans shadow-xl overflow-hidden">
      
      {/* 1. Card Top Header (The Block Style) */}
      <div className="flex justify-between items-center p-3 border-b border-[#27272a] bg-[#18181b]">
        <div className="w-8 h-8 border border-[#3f3f46] rounded flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <button className="text-[#71717a] hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </button>
      </div>

      {/* 2. Inner Title & Legend */}
      <div className="pt-6 pb-4 px-6 text-center">
        <h3 className="text-white text-lg md:text-xl font-medium tracking-tight mb-3">{title}</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {series.map((s: any) => (
            <div key={s.key} className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] text-[#a1a1aa] font-medium">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. The Chart Area (Fixing the flexbox/height bug) */}
      <div className="w-full h-[280px] px-4">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* 4. Zoom & Source Row */}
      <div className="px-6 py-4 flex justify-between items-end mt-2">
        <div className="text-[9px] text-[#71717a] font-bold leading-relaxed tracking-wider">
          <p>SOURCE: CRYPTOBRAINNEWS</p>
          <p>UPDATED: FEB 25, 2026</p>
        </div>
        <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded border border-[#27272a]">
          <span className="text-[10px] text-white font-bold px-2">ZOOM</span>
          {['ALL', 'YTD', '12M', '3M', '1M'].map(z => (
            <button key={z} onClick={() => setZoom(z)} className={`text-[10px] font-bold px-3 py-1 rounded transition-colors ${zoom === z ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'}`}>
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Footer Action Bar */}
      <div className="bg-[#09090b] border-t border-[#27272a] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-tight mb-1">ABOUT THIS GRAPH</span>
          <span className="text-[#a1a1aa] text-xs max-w-sm leading-relaxed">{description}</span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Request Data
          </button>
          <button className="flex-1 sm:flex-none bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
        </div>
      </div>

    </div>
  );
}
