'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '@/components/ui/AppIcon';

// Simulated Dune Analytics Data (Whale Net Inflows to Exchanges)
const DUNE_DATA = [
  { date: 'Feb 1', inflow: 450, outflow: 120, net: 330 },
  { date: 'Feb 2', inflow: 380, outflow: 200, net: 180 },
  { date: 'Feb 3', inflow: 820, outflow: 150, net: 670 }, // Huge Inflow (Dump Signal)
  { date: 'Feb 4', inflow: 290, outflow: 180, net: 110 },
  { date: 'Feb 5', inflow: 310, outflow: 490, net: -180 }, // Outflow (Accumulation)
  { date: 'Feb 6', inflow: 470, outflow: 160, net: 310 },
];

export default function WhaleWatch() {
  return (
    <div className="bg-[#0f0f0f] border border-gray-800 p-6 relative overflow-hidden group">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-black uppercase text-sm tracking-widest">Whale Exchange NetFlows</h3>
            <span className="bg-primary text-black text-[9px] font-bold px-1.5 py-0.5 rounded">ALPHA</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono">DATA SOURCE: DUNE ANALYTICS (QUERY #34810)</p>
        </div>
        <Icon name="EyeIcon" className="text-primary animate-pulse" size={20} />
      </div>

      {/* Insight Alert */}
      <div className="bg-red-500/10 border-l-2 border-red-500 p-3 mb-6">
        <p className="text-red-400 text-xs font-bold flex items-center gap-2">
          <Icon name="ExclamationTriangleIcon" size={12} />
          SYSTEM ALERT: High Inflow Detected on Feb 3 ($670M)
        </p>
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DUNE_DATA}>
            <XAxis dataKey="date" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: '#ffffff10'}}
              contentStyle={{backgroundColor: '#000', border: '1px solid #333'}}
            />
            <Bar dataKey="net" radius={[2, 2, 2, 2]}>
              {DUNE_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.net > 0 ? '#EF4444' : '#22C55E'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between text-[10px] font-mono text-gray-500">
        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> NET DEPOSIT (SELL PRESSURE)</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> NET WITHDRAWAL (ACCUMULATION)</span>
      </div>
    </div>
  );
}
