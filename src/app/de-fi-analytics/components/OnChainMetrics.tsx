'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/AppIcon';

const OnChainMetrics = () => {
  const mockMetricsData = [
    { date: '2026-01-21', transactions: 1250000, uniqueUsers: 345000 },
    { date: '2026-01-22', transactions: 1320000, uniqueUsers: 367000 },
    { date: '2026-01-23', transactions: 1180000, uniqueUsers: 328000 },
    { date: '2026-01-24', transactions: 1450000, uniqueUsers: 389000 },
    { date: '2026-01-25', transactions: 1560000, uniqueUsers: 412000 },
    { date: '2026-01-26', transactions: 1420000, uniqueUsers: 395000 },
    { date: '2026-01-27', transactions: 1680000, uniqueUsers: 445000 }
  ];

  return (
    <div className="bg-card border border-border p-6">
      <h2 className="text-xl font-bold font-heading mb-4 text-primary uppercase tracking-widest">Network Activity</h2>
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockMetricsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(val) => val.split('-')[2]} />
            <YAxis stroke="#666" fontSize={10} />
            <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#FABF2C'}} />
            <Bar dataKey="transactions" fill="#FABF2C" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default OnChainMetrics;
