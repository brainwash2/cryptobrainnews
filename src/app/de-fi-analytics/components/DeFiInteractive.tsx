'use client';
import React from 'react';
import ProtocolRankings from './ProtocolRankings';
import OnChainMetrics from './OnChainMetrics';
import AlphaGate from '@/components/auth/AlphaGate';
import WhaleWatch from './WhaleWatch';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DeFiInteractive = ({ initialProtocols, dexVolume, stableMcap }: any) => {
  return (
    <div className="space-y-12">
      
      {/* 1. PUBLIC INTEL (Protocol Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
           <ProtocolRankings protocols={initialProtocols} />
        </div>
        <div className="lg:col-span-4">
           <OnChainMetrics />
        </div>
      </div>

      {/* 2. ALPHA INTEL (Charts locked in the Gate) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AlphaGate>
          <div className="bg-[#0a0a0a] border border-gray-900 p-8 shadow-2xl h-full">
            <h3 className="text-white font-black text-xs uppercase mb-8 border-l-2 border-primary pl-4 tracking-widest">Daily DEX Volume (7DMA)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dexVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="date" stroke="#444" fontSize={10} />
                  <YAxis stroke="#444" fontSize={10} tickFormatter={(v) => `$${(v/1e9).toFixed(1)}B`} />
                  <Tooltip contentStyle={{backgroundColor:'#000', border:'1px solid #333'}} />
                  <Area type="monotone" dataKey="volume" stroke="#FABF2C" fill="#FABF2C" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </AlphaGate>

        <AlphaGate>
          <div className="bg-[#0a0a0a] border border-gray-900 p-8 shadow-2xl h-full">
            <h3 className="text-white font-black text-xs uppercase mb-8 border-l-2 border-primary pl-4 tracking-widest">Total Stablecoin Supply</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stableMcap}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="date" stroke="#444" fontSize={10} />
                  <YAxis stroke="#444" fontSize={10} tickFormatter={(v) => `$${(v/1e9).toFixed(0)}B`} />
                  <Bar dataKey="mcap" fill="#627EEA" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </AlphaGate>
      </div>

      {/* 3. EXCLUSIVE ALPHA TOOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <AlphaGate>
            <WhaleWatch />
          </AlphaGate>
        </div>
        <div className="lg:col-span-5 bg-card border border-border p-8 flex items-center justify-center text-center">
            <div>
              <p className="text-primary font-black text-xs tracking-widest mb-2 uppercase">Member Status</p>
              <p className="text-white font-mono text-sm uppercase">Active Intelligence Stream Verified</p>
            </div>
        </div>
      </div>
    </div>
  );
};
export default DeFiInteractive;
