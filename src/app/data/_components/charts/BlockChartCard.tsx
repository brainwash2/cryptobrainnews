'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, AreaChart, Area, LineChart, Line 
} from 'recharts';
import { BarChart3, TrendingUp, PieChart, DownloadCloud, Share2, Box } from 'lucide-react';

interface BlockChartCardProps {
  title: string;
  data: any[];
  type: 'barStack' | 'lineDual' | 'area100';
  colors: Record<string, string>;
  description?: string;
}

export default function BlockChartCard({ title, data, type, colors, description = "Market data provided via live public APIs." }: BlockChartCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const[zoom, setZoom] = useState('ALL');

  useEffect(() => { setIsMounted(true); },[]);

  // THE FIX: Actual Interactive Data Slicing for the Zoom Buttons
  const slicedData = useMemo(() => {
    if (!data || data.length === 0) return[];
    const isDaily = data.length > 20; // Heuristic to check if data is daily or monthly
    
    if (zoom === '1M') return data.slice(-(isDaily ? 30 : 1));
    if (zoom === '3M') return data.slice(-(isDaily ? 90 : 3));
    if (zoom === '12M') return data.slice(-(isDaily ? 365 : 12));
    if (zoom === 'YTD') return data.slice(-(isDaily ? 180 : 6));
    
    return data; // 'ALL'
  }, [data, zoom]);

  const icon = type === 'barStack' ? <BarChart3 className="w-4 h-4 text-[#a1a1aa]" /> : 
               type === 'lineDual' ? <TrendingUp className="w-4 h-4 text-[#a1a1aa]" /> : 
               <PieChart className="w-4 h-4 text-[#a1a1aa]" />;

  const formatYAxis = (v: number) => {
    if (type === 'area100') return `${v}%`;
    if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}k`;
    return `$${v}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#18181b] border border-[#27272a] p-3 text-xs text-white shadow-2xl rounded-sm min-w-[160px] font-sans">
          <p className="text-[#a1a1aa] mb-2 pb-2 border-b border-[#27272a] uppercase tracking-wider font-bold">{label}</p>
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex justify-between items-center gap-8 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[#e4e4e7] font-medium">{entry.name}</span>
              </div>
              <span className="font-mono font-bold">
                {type === 'area100' ? `${Number(entry.value).toFixed(2)}%` : 
                 entry.value >= 1000 ? `$${Number(entry.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}` :
                 `$${Number(entry.value).toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const axisProps = { stroke: "#71717a", fontSize: 10, tickLine: false, axisLine: false };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl flex flex-col text-white font-sans shadow-2xl overflow-hidden">
      
      {/* 1. Header (The Block Style) */}
      <div className="flex items-center justify-between p-3 border-b border-[#27272a] bg-[#18181b]">
        <div className="w-8 h-8 rounded border border-[#3f3f46] flex items-center justify-center bg-[#27272a]/30">
          <Box className="w-4 h-4 text-[#a1a1aa]" />
        </div>
        <button className="text-[#71717a] hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* 2. Centered Title & Legend */}
      <div className="pt-6 pb-2 text-center px-4">
        <h3 className="text-xl font-medium tracking-tight mb-4">{title}</h3>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {Object.keys(colors).map((key) => (
            <div key={key} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[key] }} />
              <span className="text-[11px] font-bold text-[#a1a1aa] uppercase">{key === 'btc' ? 'Bitcoin' : key === 'eth' ? 'Ethereum' : key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. The Chart (Fixed Height kills the -1 error) */}
      <div style={{ height: '320px', width: '100%' }} className="px-4 mt-4">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-6 h-6 border-2 border-[#3f3f46] border-t-[#2563eb] rounded-full animate-spin"/>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'barStack' ? (
              <BarChart data={slicedData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis {...axisProps} tickFormatter={formatYAxis} width={50} dx={-5} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
                {Object.keys(colors).map((key) => (
                  <Bar key={key} dataKey={key} name={key.charAt(0).toUpperCase() + key.slice(1)} stackId="a" fill={colors[key]} maxBarSize={45} isAnimationActive={false} />
                ))}
              </BarChart>
            ) : type === 'lineDual' ? (
              <LineChart data={slicedData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis yAxisId="left" {...axisProps} tickFormatter={formatYAxis} width={50} dx={-5} />
                <YAxis yAxisId="right" orientation="right" {...axisProps} tickFormatter={formatYAxis} width={50} dx={5} />
                <Tooltip content={<CustomTooltip />} />
                {Object.keys(colors).map((key, i) => (
                  <Line key={key} yAxisId={i === 0 ? "left" : "right"} type="monotone" dataKey={key} name={key.toUpperCase()} stroke={colors[key]} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={slicedData} stackOffset="expand" margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  {Object.keys(colors).map((key) => (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[key]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={colors[key]} stopOpacity={0.2}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis {...axisProps} tickFormatter={formatYAxis} width={40} dx={-5} />
                <Tooltip content={<CustomTooltip />} />
                {Object.keys(colors).map((key) => (
                  <Area key={key} type="monotone" dataKey={key} name={key.toUpperCase()} stackId="1" stroke={colors[key]} fill={`url(#grad-${key})`} isAnimationActive={false} />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* 4. Zoom & Source Text (Inside Chart Area) */}
      <div className="flex justify-between items-end px-6 pb-5 pt-2">
        <div className="text-[10px] text-[#71717a] font-mono leading-relaxed font-bold tracking-widest">
          <p>SOURCE: THE BLOCK (REPLICA)</p>
          <p>UPDATED: {new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year: 'numeric'})}</p>
        </div>
        <div className="flex items-center gap-1 bg-[#09090b] p-0.5 rounded border border-[#27272a]">
          <span className="text-[10px] text-white font-bold px-2 uppercase tracking-widest">Zoom</span>
          {['ALL', 'YTD', '12M', '3M', '1M'].map(d => (
            <button 
              key={d} 
              onClick={() => setZoom(d)} 
              className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${zoom === d ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Dark Footer Actions */}
      <div className="bg-[#09090b] border-t border-[#27272a] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-b-xl">
        <div>
          <h4 className="text-white font-bold text-sm tracking-tight mb-1">ABOUT THIS GRAPH</h4>
          <p className="text-[#a1a1aa] text-xs max-w-sm leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2">
            <DownloadCloud size={16} /> Request Data
          </button>
          <button className="flex-1 md:flex-none bg-[#27272a] hover:bg-[#3f3f46] text-white px-5 py-2.5 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2">
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
