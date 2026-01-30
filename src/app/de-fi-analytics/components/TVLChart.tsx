'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TVLChartProps {
  data: any[];
}

const TVLChart = ({ data }: TVLChartProps) => {
  return (
    <div className="bg-card border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-heading text-white">Total Value Locked (TVL)</h2>
        <span className="text-xs font-caption text-success">+8.2% (30d)</span>
      </div>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTvl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FABF2C" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FABF2C" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="date" stroke="#444" fontSize={12} />
            <YAxis stroke="#444" fontSize={12} tickFormatter={(val) => `$${(val/1e9).toFixed(0)}B`} />
            <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
            <Area type="monotone" dataKey="tvl" stroke="#FABF2C" fillOpacity={1} fill="url(#colorTvl)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default TVLChart;
