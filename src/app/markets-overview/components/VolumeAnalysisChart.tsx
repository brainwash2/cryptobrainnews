'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VolumeData {
  time: string;
  spotVolume: number;
  futuresVolume: number;
  totalVolume: number;
}

export default function VolumeAnalysisChart({ data }: { data: VolumeData[] }) {
  const formatValue = (value: number) => value >= 1e9 ? `$${(value/1e9).toFixed(1)}B` : `$${(value/1e6).toFixed(1)}M`;

  return (
    <div className="w-full h-80 bg-card border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground font-heading mb-2">24-Hour Volume Analysis</h3>
        <p className="text-sm text-muted-foreground font-caption">Trading volume breakdown across spot and futures markets</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis dataKey="time" stroke="#A3A3A3" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
          <YAxis stroke="#A3A3A3" tickFormatter={formatValue} style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }} />
          <Legend />
          <Line type="monotone" dataKey="spotVolume" stroke="#22C55E" strokeWidth={2} name="Spot" dot={false} />
          <Line type="monotone" dataKey="futuresVolume" stroke="#EF4444" strokeWidth={2} name="Futures" dot={false} />
          <Line type="monotone" dataKey="totalVolume" stroke="#FABF2C" strokeWidth={3} name="Total" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
