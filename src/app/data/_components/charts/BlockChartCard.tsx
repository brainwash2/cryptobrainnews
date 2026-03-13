'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, AreaChart, Area, LineChart, Line, ComposedChart 
} from 'recharts';
import { Maximize2, Box, DownloadCloud, Share2 } from 'lucide-react';

export interface BlockChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  type: 'barStack' | 'lineDual' | 'area100' | 'area' | 'bar' | 'line' | 'composed';
  colors: Record<string, string>;
  description?: string;
  yAxisFormat?: 'currency' | 'percent' | 'number';
}

interface TooltipPayloadItem {
  color?: string;
  name?: string;
  value?: number | string;
}

export default function BlockChartCard({ 
  title, data, type, colors, description = "Market data provided via live public APIs.", yAxisFormat = 'number' 
}: BlockChartCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [zoom, setZoom] = useState<'ALL' | 'YTD' | '12M' | '3M' | '1M'>('ALL');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { setIsMounted(true); },[]);

  const slicedData = useMemo(() => {
    if (!data?.length) return[];
    if (zoom === '1M') return data.slice(-30);
    if (zoom === '3M') return data.slice(-90);
    if (zoom === '12M') return data.slice(-365);
    if (zoom === 'YTD') return data.slice(-180);
    return data;
  }, [data, zoom]);

  const formatYAxis = (v: number) => {
    if (type === 'area100') return `${v.toFixed(0)}%`;
    if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
    return yAxisFormat === 'currency' ? `$${v.toLocaleString()}` : v.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded-none text-xs shadow-2xl z-50 min-w-[160px]">
        <p className="text-[#888] mb-2 font-bold border-b border-[#1a1a1a] pb-2 uppercase tracking-widest">{label}</p>
        {payload.map((entry: TooltipPayloadItem, i: number) => (
          <div key={i} className="flex justify-between items-center gap-8 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2" style={{ backgroundColor: entry.color }} />
              <span className="text-white font-mono">{entry.name?.toUpperCase()}</span>
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
  const keys = Object.keys(colors);

  return (
    <div className={`bg-[#0a0a0a] border border-[#1a1a1a] flex flex-col font-sans ${expanded ? 'fixed inset-4 z-[9999] shadow-2xl' : 'h-[480px]'}`}>
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a] bg-[#050505]">
        <div className="w-8 h-8 flex items-center justify-center bg-[#0a0a0a] border border-[#1a1a1a]"><Box size={14} className="text-[#FABF2C]" /></div>
        <button onClick={() => setExpanded(!expanded)} className="text-[#555] hover:text-white">
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="pt-6 pb-2 text-center px-4">
        <h3 className="text-lg font-black uppercase tracking-tighter mb-4 text-white">{title}</h3>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {keys.map(key => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5" style={{ backgroundColor: colors[key] }} />
              <span className="text-[10px] font-black text-[#888] uppercase tracking-widest">{key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex-1 min-h-[260px] px-4 mt-2">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center text-[#555] font-mono text-xs uppercase animate-pulse">Rendering...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'composed' ? (
              <ComposedChart data={slicedData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis yAxisId="left" {...axisProps} tickFormatter={formatYAxis} width={55} />
                <YAxis yAxisId="right" orientation="right" {...axisProps} tickFormatter={formatYAxis} width={55} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
                {keys[0] && <Bar yAxisId="left" dataKey={keys[0]} fill={colors[keys[0]]} maxBarSize={40} isAnimationActive={false} />}
                {keys[1] && <Line yAxisId="right" type="monotone" dataKey={keys[1]} stroke={colors[keys[1]]} strokeWidth={2} dot={false} isAnimationActive={false} />}
              </ComposedChart>
            ) : type.includes('bar') ? (
              <BarChart data={slicedData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis {...axisProps} tickFormatter={formatYAxis} width={55} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
                {keys.map(key => (
                  <Bar key={key} dataKey={key} stackId={type === 'barStack' ? "a" : undefined} fill={colors[key]} maxBarSize={40} isAnimationActive={false} />
                ))}
              </BarChart>
            ) : type.includes('line') ? (
              <LineChart data={slicedData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis yAxisId="left" {...axisProps} tickFormatter={formatYAxis} width={50} />
                {type === 'lineDual' && <YAxis yAxisId="right" orientation="right" {...axisProps} tickFormatter={formatYAxis} width={50} />}
                <Tooltip content={<CustomTooltip />} />
                {keys.map((key, i) => (
                  <Line key={key} yAxisId={type === 'lineDual' && i === 1 ? "right" : "left"} type="monotone" dataKey={key} stroke={colors[key]} strokeWidth={2} dot={false} isAnimationActive={false} />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={slicedData} stackOffset={type === 'area100' ? "expand" : "none"} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  {keys.map(key => (
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
                {keys.map(key => (
                  <Area key={key} type="monotone" dataKey={key} stackId={type === 'area100' ? "1" : undefined} stroke={colors[key]} fill={type === 'area100' ? colors[key] : `url(#grad-${key})`} isAnimationActive={false} />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex justify-between items-end px-6 pb-4 pt-2">
        <div className="text-[9px] text-[#555] font-mono uppercase tracking-widest">
          <p>SOURCE: DEFILLAMA / DUNE</p>
        </div>
        <div className="flex items-center gap-1 bg-[#050505] p-0.5 border border-[#1a1a1a]">
          {(['ALL', 'YTD', '12M', '3M', '1M'] as const).map(d => (
            <button key={d} onClick={() => setZoom(d)} className={`px-2 py-1 text-[9px] font-black transition-colors uppercase ${zoom === d ? 'bg-[#1a1a1a] text-[#FABF2C]' : 'text-[#555] hover:text-white'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
