'use client';
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MiniPriceChart({ data, isPositive }: any) {
  return (
    <div className="h-8 w-20 ml-auto">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={isPositive ? '#22C55E' : '#EF4444'} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
