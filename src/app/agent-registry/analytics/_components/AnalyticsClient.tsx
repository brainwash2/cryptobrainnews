'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

const MOCK_CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  computes: Math.floor(Math.random() * 50) + 10,
  sats: (Math.floor(Math.random() * 50) + 10) * 10
}));

const MOCK_EXECUTIONS =[
  { id: 'cbn_exec_1092', action: 'execute_arbitrage_swap', protocol: 'Uniswap V3', status: 'settled', cost: 10, time: '1.2s', date: '2 mins ago' },
  { id: 'cbn_exec_1091', action: 'bridge_liquidity', protocol: 'Arbitrum', status: 'settled', cost: 10, time: '0.8s', date: '15 mins ago' },
  { id: 'cbn_exec_1090', action: 'fetch_oracle_feed', protocol: 'CryptoBrain', status: 'settled', cost: 10, time: '0.3s', date: '1 hour ago' },
  { id: 'cbn_exec_1089', action: 'execute_arbitrage_swap', protocol: 'Curve', status: 'failed (slippage)', cost: 10, time: '2.1s', date: '3 hours ago' },
];

export default function AnalyticsClient() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  },[]);

  const totalComputes = MOCK_CHART_DATA.reduce((sum, d) => sum + d.computes, 0);
  const totalSats = MOCK_CHART_DATA.reduce((sum, d) => sum + d.sats, 0);

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 hover:border-[#00d672]/50 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-[#555]">
            <Activity size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Computes</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">{totalComputes.toLocaleString()}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 hover:border-[#00d672]/50 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-[#555]">
            <Zap size={16} className="text-[#FABF2C]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sats Spent</span>
          </div>
          <div className="text-3xl font-black text-[#FABF2C] tabular-nums">{totalSats.toLocaleString()}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 hover:border-[#00d672]/50 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-[#555]">
            <CheckCircle size={16} className="text-[#00d672]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Success Rate</span>
          </div>
          <div className="text-3xl font-black text-[#00d672] tabular-nums">98.2%</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 hover:border-[#00d672]/50 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-[#555]">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Avg Exec Time</span>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">0.8s</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-l-2 border-[#00d672] pl-3">Compute Usage (30D)</h3>
        <div className="w-full h-[300px]">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComputes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d672" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d672" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="date" stroke="#444" fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis stroke="#444" fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#00d672', fontWeight: 'bold' }}
                />
                <Area type="step" dataKey="computes" stroke="#00d672" strokeWidth={2} fillOpacity={1} fill="url(#colorComputes)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#555] font-mono text-xs animate-pulse">Loading execution telemetry...</div>
          )}
        </div>
      </div>

      {/* Recent Executions Table */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
        <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center">
          <h3 className="text-xs font-black text-white uppercase tracking-widest border-l-2 border-[#00d672] pl-3">Recent Executions</h3>
          <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest">L402 Validated</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#050505] text-[#555] uppercase tracking-widest border-b border-[#1a1a1a]">
              <tr>
                <th className="px-6 py-4">Exec ID</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {MOCK_EXECUTIONS.map((exec, i) => (
                <tr key={i} className="hover:bg-[#111] transition-colors">
                  <td className="px-6 py-4 text-[#888]">{exec.id}</td>
                  <td className="px-6 py-4 text-[#00d672] font-bold">{exec.action}</td>
                  <td className="px-6 py-4 text-white">{exec.protocol}</td>
                  <td className="px-6 py-4 text-[#FABF2C]">{exec.cost} sats</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[9px] uppercase tracking-widest rounded ${exec.status.includes('failed') ? 'bg-[#ff4757]/10 text-[#ff4757]' : 'bg-[#00d672]/10 text-[#00d672]'}`}>
                      {exec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[#555]">{exec.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
