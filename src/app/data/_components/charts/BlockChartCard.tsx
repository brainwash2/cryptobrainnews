'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, AreaChart, Area, LineChart, Line 
} from 'recharts';
import { Maximize2, Box, DownloadCloud, Share2 } from 'lucide-react';

export interface SeriesConfig {
  key: string;
  name: string;
  color: string;
}

export interface BlockChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  type: 'barStack' | 'lineDual' | 'area100';
  colors: Record<string, string>;
  description?: string;
  yAxisFormat?: 'currency' | 'percent' | 'number';
}

// 1. Define strict custom types for the Tooltip to bypass Recharts broken generics
interface TooltipPayloadItem {
  color: string;
  name: string;
  value: number | string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export default function BlockChartCard({ 
  title, data, type, colors, description = "Market data provided via live public APIs.", yAxisFormat = 'number' 
}: BlockChartCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const[zoom, setZoom] = useState<'ALL' | 'YTD' | '12M' | '3M' | '1M'>('ALL');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { setIsMounted(true); },[]);

  const slicedData = useMemo(() => {
    if (!data?.length) return[];
    if (zoom === '1M') return data.slice(-30);
    if (zoom === '3M') return data.slice(-90);
    if (zoom === '12M') return data.slice(-365);
    if (zoom === 'YTD') return data.slice(-180);
    return data;
  },[data, zoom]);

  const formatYAxis = (v: number) => {
    if (type === 'area100') return `${v.toFixed(0)}%`;
    if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
    return `$${v.toLocaleString()}`;
  };

  // 2. Use our Custom interface here
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-none text-xs shadow-2xl z-50 min-w-[160px]">
        <p className="text-[#888] mb-2 font-bold border-b border-[#1a1a1a] pb-2 uppercase tracking-widest">{label}</p>
        {payload.map((entry: TooltipPayloadItem, i: number) => (
          <div key={i} className="flex justify-between items-center gap-8 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2" style={{ backgroundColor: entry.color }} />
              <span className="text-white font-mono">{entry.name}</span>
            </div>
            <span className="font-mono font-black text-[#FABF2C]">
              {formatYAxis(Number(entry.value))}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const axisProps = { stroke: "#555", fontSize: 10, tickLine: false, axisLine: false };

  return (
    <div className={`bg-[#0a0a0a] border border-[#1a1a1a] rounded-none overflow-hidden flex flex-col font-sans ${expanded ? 'fixed inset-4 z-[9999] shadow-2xl' : 'h-[480px]'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a] bg-[#050505]">
        <div className="w-8 h-8 border border-[#1a1a1a] flex items-center justify-center bg-[#0a0a0a]">
          <Box className="w-4 h-4 text-[#FABF2C]" />
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-[#555] hover:text-white transition-colors">
          {expanded ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Title & Legend */}
      <div className="pt-6 pb-2 text-center px-4">
        <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-4 text-white">{title}</h3>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {Object.keys(colors).map(key => (
            <div key={key} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <div className="w-2.5 h-2.5" style={{ backgroundColor: colors[key] }} />
              <span className="text-[10px] font-black text-[#888] uppercase tracking-widest">{key === 'btc' ? 'Bitcoin' : key === 'eth' ? 'Ethereum' : key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full flex-1 min-h-[260px] px-4 mt-2">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center text-[#555] animate-pulse font-mono text-xs uppercase tracking-widest">Rendering...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'barStack' ? (
              <BarChart data={slicedData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis {...axisProps} tickFormatter={formatYAxis} width={55} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
                {Object.keys(colors).map(key => (
                  <Bar key={key} dataKey={key} name={key.toUpperCase()} stackId="a" fill={colors[key]} maxBarSize={40} isAnimationActive={false} />
                ))}
              </BarChart>
            ) : type === 'lineDual' ? (
              <LineChart data={slicedData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis yAxisId="left" {...axisProps} tickFormatter={formatYAxis} width={50} />
                <YAxis yAxisId="right" orientation="right" {...axisProps} tickFormatter={formatYAxis} width={50} />
                <Tooltip content={<CustomTooltip />} />
                {Object.keys(colors).map((key, i) => (
                  <Line key={key} yAxisId={i === 0 ? "left" : "right"} type="monotone" dataKey={key} name={key.toUpperCase()} stroke={colors[key]} strokeWidth={2} dot={false} isAnimationActive={false} />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={slicedData} stackOffset="expand" margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  {Object.keys(colors).map(key => (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[key]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={colors[key]} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis {...axisProps} tickFormatter={formatYAxis} width={45} />
                <Tooltip content={<CustomTooltip />} />
                {Object.keys(colors).map(key => (
                  <Area key={key} type="monotone" dataKey={key} name={key.toUpperCase()} stackId="1" stroke={colors[key]} fill={`url(#grad-${key})`} isAnimationActive={false} />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-end px-6 pb-4 pt-2">
        <div className="text-[9px] text-[#555] font-mono uppercase tracking-widest leading-relaxed">
          <p>SOURCE: PUBLIC APIS</p>
          <p>UPDATED: LIVE</p>
        </div>
        <div className="flex items-center gap-1 bg-[#050505] p-0.5 border border-[#1a1a1a]">
          <span className="text-[9px] text-white font-black px-2 uppercase tracking-widest hidden sm:inline">Zoom</span>
          {(['ALL', 'YTD', '12M', '3M', '1M'] as const).map(d => (
            <button key={d} onClick={() => setZoom(d)} className={`px-2 py-1 text-[9px] font-black transition-colors uppercase ${zoom === d ? 'bg-[#1a1a1a] text-[#FABF2C]' : 'text-[#555] hover:text-white'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-[#050505] border-t border-[#1a1a1a] p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="text-[#FABF2C] font-black text-[10px] uppercase tracking-widest mb-1">ABOUT THIS GRAPH</h4>
          <p className="text-[#555] text-[11px] font-mono max-w-sm leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none border border-[#1a1a1a] hover:border-[#FABF2C] hover:text-[#FABF2C] text-[#888] px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <DownloadCloud size={14} /> Data
          </button>
          <button className="flex-1 md:flex-none border border-[#1a1a1a] hover:bg-[#1a1a1a] text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
