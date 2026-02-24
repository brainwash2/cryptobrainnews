'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

interface Series {
  key: string;
  name: string;
  color: string;
}

interface BlockChartCardProps {
  title: string;
  type: 'line' | 'bar' | 'area';
  data: any[];
  series: Series[];
  stacked?: boolean;
  expandType?: 'expand' | 'none'; // For 100% stacked charts
  yAxisFormat?: 'currency' | 'percent' | 'number';
}

export default function BlockChartCard({ title, type, data, series, stacked = false, expandType = 'none', yAxisFormat = 'number' }: BlockChartCardProps) {
  const [zoom, setZoom] = useState('ALL');

  const formatYAxis = (tick: number) => {
    if (expandType === 'expand') return `${(tick * 100).toFixed(0)}%`;
    if (yAxisFormat === 'percent') return `${tick}%`;
    if (yAxisFormat === 'currency') {
      if (tick >= 1e9) return `$${(tick / 1e9).toFixed(0)}b`;
      if (tick >= 1e6) return `$${(tick / 1e6).toFixed(0)}m`;
      return `$${tick}`;
    }
    if (tick >= 1e9) return `${(tick / 1e9).toFixed(0)}b`;
    if (tick >= 1e6) return `${(tick / 1e6).toFixed(0)}m`;
    return tick.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111] border border-[#333] p-3 text-xs shadow-2xl z-50">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[#888]">{entry.name}</span>
              </div>
              <span className="text-white font-mono">
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
    const commonProps = { data, margin: { top: 10, right: 10, left: 0, bottom: 0 } };

    if (type === 'bar') {
      return (
        <BarChart {...commonProps} stackOffset={expandType === 'expand' ? "expand" : "none"}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} dx={-10} width={45} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} stackId={stacked ? "a" : undefined} fill={s.color} isAnimationActive={false} />
          ))}
        </BarChart>
      );
    }

    if (type === 'area') {
      return (
        <AreaChart {...commonProps} stackOffset={expandType === 'expand' ? "expand" : "none"}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} dx={-10} width={45} />
          <Tooltip content={<CustomTooltip />} />
          {series.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stackId={stacked ? "a" : undefined} stroke={s.color} fill={s.color} fillOpacity={1} isAnimationActive={false} />
          ))}
        </AreaChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} dy={10} />
        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} dx={-10} width={45} />
        <Tooltip content={<CustomTooltip />} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />
        ))}
      </LineChart>
    );
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] flex flex-col font-sans h-[420px]">
      {/* Title & Legend */}
      <div className="p-4 border-b border-[#27272a]">
        <h3 className="text-white text-base font-medium mb-3">{title}</h3>
        <div className="flex flex-wrap gap-4">
          {series.map(s => (
            <div key={s.key} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-[#a1a1aa]">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-4 pb-0 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Zoom & Source Controls */}
      <div className="px-4 py-3 flex justify-between items-end">
        <div className="text-[9px] text-[#71717a] font-mono leading-tight">
          <p>SOURCE: CRYPTOBRAINNEWS</p>
          <p>UPDATED: FEB 24, 2026</p>
        </div>
        <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded">
          <span className="text-[9px] text-[#71717a] font-bold px-2">ZOOM</span>
          {['ALL', 'YTD', '12M', '3M', '1M'].map(z => (
            <button 
              key={z} 
              onClick={() => setZoom(z)}
              className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${zoom === z ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'}`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex border-t border-[#27272a] bg-[#111113]">
        <button className="flex-1 py-2 text-[10px] text-[#71717a] hover:text-white font-bold flex items-center justify-center gap-2 border-r border-[#27272a] transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          EXPAND
        </button>
        <button className="flex-1 py-2 text-[10px] text-[#71717a] hover:text-white font-bold flex items-center justify-center gap-2 border-r border-[#27272a] transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          SHARE
        </button>
        <button className="flex-1 py-2 text-[10px] text-[#71717a] hover:text-white font-bold flex items-center justify-center gap-2 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          MORE INFO
        </button>
      </div>
    </div>
  );
}
