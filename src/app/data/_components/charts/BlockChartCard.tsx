'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function BlockChartCard({ title, type, data, series, stacked = false, expandType = 'none', yAxisFormat = 'number' }: any) {
  const [isMounted, setIsMounted] = useState(false);
  const [zoom, setZoom] = useState('ALL');

  useEffect(() => {
    setIsMounted(true);
  },[]);

  const formatYAxis = (tick: number) => {
    if (tick === 0) return '0';
    if (expandType === 'expand') return `${(tick * 100).toFixed(0)}%`;
    if (yAxisFormat === 'percent') return `${tick}%`;
    if (yAxisFormat === 'currency') {
      if (tick >= 1e9) return `$${(tick / 1e9).toFixed(0)}b`;
      if (tick >= 1e6) return `$${(tick / 1e6).toFixed(0)}m`;
      if (tick >= 1e3) return `$${(tick / 1e3).toFixed(0)}k`;
      return `$${tick}`;
    }
    return tick >= 1e9 ? `${(tick / 1e9).toFixed(0)}b` : tick >= 1e6 ? `${(tick / 1e6).toFixed(0)}m` : tick.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111113] border border-[#27272a] p-3 text-xs z-50 shadow-2xl rounded font-sans">
          <p className="text-[#e4e4e7] font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-8 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
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
    const common = { data, margin: { top: 15, right: 10, left: 0, bottom: 0 } };
    const axisProps = { stroke: "#52525b", fontSize: 10, tickLine: false, axisLine: false };

    if (type === 'bar') {
      return (
        <BarChart {...common} stackOffset={expandType === 'expand' ? "expand" : "none"}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={20} />
          <YAxis {...axisProps} tickFormatter={formatYAxis} width={45} dx={-5} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
          {series.map((s: any) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} stackId={stacked ? "a" : undefined} fill={s.color} maxBarSize={40} isAnimationActive={false} />
          ))}
        </BarChart>
      );
    }
    if (type === 'area') {
      return (
        <AreaChart {...common} stackOffset={expandType === 'expand' ? "expand" : "none"}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={20} />
          <YAxis {...axisProps} tickFormatter={formatYAxis} width={45} dx={-5} />
          <Tooltip content={<CustomTooltip />} />
          {series.map((s: any) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stackId={stacked ? "a" : undefined} stroke={s.color} fill={s.color} fillOpacity={1} strokeWidth={0} isAnimationActive={false} />
          ))}
        </AreaChart>
      );
    }
    // Line Chart with Dual Y-Axis Support to prevent flat lines
    return (
      <LineChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={20} />
        {/* Left Y Axis */}
        <YAxis yAxisId="left" {...axisProps} tickFormatter={formatYAxis} width={45} dx={-5} />
        {/* Right Y Axis (for second metric like ETH) */}
        {series.length > 1 && <YAxis yAxisId="right" orientation="right" {...axisProps} tickFormatter={formatYAxis} width={45} dx={5} />}
        
        <Tooltip content={<CustomTooltip />} />
        {series.map((s: any, i: number) => (
          <Line key={s.key} yAxisId={i === 0 ? "left" : "right"} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />
        ))}
      </LineChart>
    );
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-lg flex flex-col font-sans overflow-hidden">
      {/* Block Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#18181b] border-b border-[#27272a]">
        <div className="flex items-center gap-3 w-full">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          <h3 className="text-white text-[15px] font-medium tracking-tight truncate flex-1 text-center pr-5">{title}</h3>
        </div>
      </div>
      
      {/* Legend */}
      <div className="pt-4 pb-2 px-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {series.map((s: any) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[11px] text-[#a1a1aa] font-medium">{s.name}</span>
          </div>
        ))}
      </div>
      
      {/* Chart Area - Explicit Height kills the -1 bug */}
      <div className="w-full h-[260px] px-2">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#3f3f46] text-xs font-mono animate-pulse">Loading Data...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 flex justify-between items-end mt-2">
        <div className="text-[9px] text-[#71717a] font-mono leading-relaxed">
          <p>SOURCE: THE BLOCK PRO (REPLICA)</p>
          <p>UPDATED: LIVE API</p>
        </div>
        <div className="flex items-center gap-1 bg-[#09090b] p-0.5 rounded border border-[#27272a]">
          <span className="text-[9px] text-[#71717a] font-bold px-1.5">ZOOM</span>
          {['ALL', 'YTD', '12M'].map(z => (
            <button key={z} onClick={() => setZoom(z)} className={`text-[9px] font-bold px-2 py-0.5 rounded transition-colors ${zoom === z ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'}`}>{z}</button>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex border-t border-[#27272a] bg-[#111113]">
        <button className="flex-1 py-2 text-[10px] text-[#2563eb] hover:text-[#3b82f6] font-bold flex items-center justify-center gap-1.5 border-r border-[#27272a] transition-colors bg-[#2563eb]/10">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Request Data
        </button>
        <button className="flex-1 py-2 text-[10px] text-[#71717a] hover:text-white font-bold flex items-center justify-center gap-1.5 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share
        </button>
      </div>
    </div>
  );
}
