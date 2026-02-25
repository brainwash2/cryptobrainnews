'use client';

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, AreaChart, Area, LineChart, Line 
} from 'recharts';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';

interface BlockChartCardProps {
  title: string;
  data: any[];
  type: 'barStack' | 'lineDual' | 'area100';
  colors: Record<string, string>;
}

export default function BlockChartCard({ title, data, type, colors }: BlockChartCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [days, setDays] = useState('ALL');

  useEffect(() => { setIsMounted(true); },[]);

  const icon = type === 'barStack' ? <BarChart3 className="w-5 h-5 text-[#F0B90B]" /> : 
               type === 'lineDual' ? <TrendingUp className="w-5 h-5 text-white" /> : 
               <PieChart className="w-5 h-5 text-white" />;

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
        <div className="bg-[#18181b] border border-[#27272a] p-3 text-xs text-white shadow-2xl rounded-sm min-w-[150px] font-sans">
          <p className="text-[#a1a1aa] mb-2 pb-2 border-b border-[#27272a] uppercase tracking-wider">{label}</p>
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex justify-between items-center gap-6 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[#e4e4e7]">{entry.name}</span>
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
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl flex flex-col text-white font-sans shadow-lg h-[460px]">
      {/* Header matching The Block exactly */}
      <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 border border-[#3f3f46] rounded-md bg-[#27272a]/50">
            {icon}
          </div>
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        </div>
        <div className="hidden sm:flex items-center gap-1 bg-[#09090b] p-1 rounded-md border border-[#27272a]">
          <span className="text-[9px] text-[#71717a] font-bold px-2 uppercase tracking-widest">Zoom</span>
          {['ALL', 'YTD', '12M', '3M', '1M'].map(d => (
            <button key={d} onClick={() => setDays(d)} className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${days === d ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-4 pb-0 relative">
        {!isMounted ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-6 h-6 border-2 border-[#3f3f46] border-t-[#2563eb] rounded-full animate-spin"/>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'barStack' ? (
              <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis {...axisProps} tickFormatter={formatYAxis} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff', opacity: 0.05 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {Object.keys(colors).map((key) => (
                  <Bar key={key} dataKey={key} name={key.charAt(0).toUpperCase() + key.slice(1)} stackId="a" fill={colors[key]} maxBarSize={45} isAnimationActive={false} />
                ))}
              </BarChart>
            ) : type === 'lineDual' ? (
              <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" {...axisProps} dy={10} minTickGap={30} />
                <YAxis yAxisId="left" {...axisProps} tickFormatter={formatYAxis} width={50} stroke={colors.btc} />
                <YAxis yAxisId="right" orientation="right" {...axisProps} tickFormatter={formatYAxis} width={50} stroke={colors.eth} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="btc" name="BTC" stroke={colors.btc} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="eth" name="ETH" stroke={colors.eth} strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            ) : (
              <AreaChart data={data} stackOffset="expand" margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
                <YAxis {...axisProps} tickFormatter={formatYAxis} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {Object.keys(colors).map((key) => (
                  <Area key={key} type="monotone" dataKey={key} name={key.charAt(0).toUpperCase() + key.slice(1)} stackId="1" stroke={colors[key]} fill={`url(#grad-${key})`} isAnimationActive={false} />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-4 p-4 bg-[#09090b] border-t border-[#27272a] flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-xl">
        <div className="text-[10px] text-[#71717a] font-mono">
          SOURCE: THE BLOCK / COINGECKO • UPDATED: {new Date().toLocaleDateString('en-US', { month:'short', day:'numeric'})}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2">
            Request Data
          </button>
          <button className="flex-1 sm:flex-none bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
