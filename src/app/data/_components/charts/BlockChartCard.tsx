'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, AreaChart, Area, LineChart, Line 
} from 'recharts';
import { BarChart3, DownloadCloud, Share2, Maximize2 } from 'lucide-react';

interface BlockChartCardProps {
  title: string;
  data: any[];
  type: 'barStack' | 'lineDual' | 'area100';
  colors: Record<string, string>;
  description?: string;
}

export default function BlockChartCard({ title, data, type, colors, description = "Live via Dune + CoinGecko" }: BlockChartCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [zoom, setZoom] = useState<'ALL' | 'YTD' | '12M' | '3M' | '1M'>('ALL');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const slicedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const isDaily = data.length > 20;
    if (zoom === '1M') return data.slice(-(isDaily ? 30 : 1));
    if (zoom === '3M') return data.slice(-(isDaily ? 90 : 3));
    if (zoom === '12M') return data.slice(-(isDaily ? 365 : 12));
    if (zoom === 'YTD') return data.slice(-(isDaily ? 180 : 6));
    return [...data]; // force new reference for re-render
  }, [data, zoom]);

  const formatYAxis = (v: number) => {
    if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
    return `$${v.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-[#18181b] border border-[#27272a] p-4 rounded text-xs shadow-2xl min-w-[180px]">
        <p className="text-[#a1a1aa] mb-3 font-bold">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex justify-between gap-8 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-white">{entry.name}</span>
            </div>
            <span className="font-mono font-bold">{formatYAxis(Number(entry.value))}</span>
          </div>
        ))}
      </div>
    );
  };

  const handleShare = () => navigator.share?.({ title, url: window.location.href });

  return (
    <div className={`bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden ${expanded ? 'fixed inset-4 z-[100]' : ''}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#3f3f46] flex items-center justify-center bg-[#27272a]">
            <BarChart3 className="w-4 h-4 text-[#a1a1aa]" />
          </div>
          <div>
            <h3 className="font-medium text-lg tracking-tight">{title}</h3>
            <p className="text-[10px] text-[#71717a] font-mono">The Block Replica • Live</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-[#71717a] hover:text-white"><Maximize2 size={18} /></button>
      </div>

      <div className="px-6 pt-6 pb-2 flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
        {Object.keys(colors).map(key => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[key] }} />
            <span className="uppercase font-bold text-[#a1a1aa]">{key}</span>
          </div>
        ))}
      </div>

      <div style={{ height: expanded ? 'calc(100vh - 280px)' : '340px', minHeight: '300px' }} className="px-6">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" key={zoom}> {/* ← key forces re-render on zoom */}
            {type === 'barStack' ? (
              <BarChart data={slicedData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickFormatter={formatYAxis} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {Object.keys(colors).map(key => (
                  <Bar key={key} dataKey={key} stackId="a" fill={colors[key]} maxBarSize={42} radius={2} />
                ))}
              </BarChart>
            ) : type === 'lineDual' ? (
              <LineChart data={slicedData}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                <YAxis yAxisId="left" stroke="#71717a" tickFormatter={formatYAxis} />
                <YAxis yAxisId="right" orientation="right" stroke="#71717a" tickFormatter={formatYAxis} />
                <Tooltip content={<CustomTooltip />} />
                {Object.keys(colors).map((key, i) => (
                  <Line key={key} yAxisId={i === 0 ? "left" : "right"} type="monotone" dataKey={key} stroke={colors[key]} strokeWidth={3} dot={false} />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={slicedData} stackOffset="expand">
                <defs>
                  {Object.keys(colors).map(key => (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[key]} stopOpacity={0.85} />
                      <stop offset="95%" stopColor={colors[key]} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" tickFormatter={formatYAxis} />
                <Tooltip content={<CustomTooltip />} />
                {Object.keys(colors).map(key => (
                  <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={colors[key]} fill={`url(#grad-${key})`} />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[#444]">Loading chart...</div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-[#27272a] flex items-center justify-between bg-[#09090b]">
        <div className="flex gap-1">
          {(['ALL','YTD','12M','3M','1M'] as const).map(z => (
            <button 
              key={z}
              onClick={() => setZoom(z)}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${zoom === z ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'}`}
            >
              {z}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#71717a] hover:text-white"><Share2 size={14} /> Share</button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#2563eb] text-white rounded hover:bg-[#1d4ed8]"><DownloadCloud size={14} /> Export</button>
        </div>
      </div>

      {description && <div className="px-6 py-5 text-[10px] text-[#71717a] border-t border-[#27272a] font-mono bg-[#09090b]">{description}</div>}
    </div>
  );
}
