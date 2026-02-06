'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/AppIcon';

const DATA = [
  { time: '00:00', inflow: 400, net: 240 },
  { time: '04:00', inflow: 300, net: 139 },
  { time: '08:00', inflow: 900, net: 980 }, // WHALE MOVE
  { time: '12:00', inflow: 200, net: 390 },
  { time: '16:00', inflow: 278, net: 480 },
  { time: '20:00', inflow: 189, net: 480 },
];

export default function WhaleWatch() {
  return (
    <div className="bg-[#0a0a0a] border-2 border-primary/20 p-6 shadow-[0_0_50px_rgba(250,191,44,0.05)]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-primary animate-pulse rounded-full"></span>
            <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Whale Liquidity Tracker</h3>
          </div>
          <p className="text-[10px] text-gray-500 font-mono">ON-CHAIN SIGNAL: SOLANA / ETH BRIDGE</p>
        </div>
        <div className="bg-primary text-black text-[9px] font-black px-2 py-1 uppercase italic">Live Signal</div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA}>
            <defs>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FABF2C" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FABF2C" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="time" stroke="#333" fontSize={10} font-family="monospace" />
            <YAxis stroke="#333" fontSize={10} font-family="monospace" tickFormatter={(v) => `$${v}M`} />
            <Tooltip 
              contentStyle={{backgroundColor: '#000', border: '1px solid #FABF2C', borderRadius: '0px'}}
              itemStyle={{color: '#FABF2C', fontSize: '10px'}}
            />
            <Area type="monotone" dataKey="net" stroke="#FABF2C" fillOpacity={1} fill="url(#colorNet)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-bold">Large Inflow (24h)</p>
          <p className="text-xl font-black text-white">$1.24B</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase font-bold">Whale Sentiment</p>
          <p className="text-xl font-black text-green-500 uppercase italic">Bullish</p>
        </div>
      </div>
    </div>
  );
}
