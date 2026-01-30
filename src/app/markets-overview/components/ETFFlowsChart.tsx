'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ETFFlowData {
  date: string;
  inflows: number;
  outflows: number;
  net: number;
}

export default function ETFFlowsChart({ data }: { data: ETFFlowData[] }) {
  // Fix: Explicitly type 'value' as number so Recharts is happy
  const formatValue = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${(value / 1e3).toFixed(1)}K`;
  };

  return (
    <div className="w-full h-96 bg-card border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground font-heading mb-2">Bitcoin ETF Flows</h3>
        <p className="text-sm text-muted-foreground font-caption">Daily inflows and outflows</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis dataKey="date" stroke="#A3A3A3" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
          <YAxis stroke="#A3A3A3" tickFormatter={formatValue} style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
            formatter={(value: any) => formatValue(Number(value))} 
            labelStyle={{ color: '#FFFFFF' }} 
          />
          <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
          <Bar dataKey="inflows" fill="#22C55E" name="Inflows" />
          <Bar dataKey="outflows" fill="#EF4444" name="Outflows" />
          <Bar dataKey="net" fill="#FABF2C" name="Net Flow" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
