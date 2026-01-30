'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StablecoinAnalyticsProps {
  data: any[];
}

const StablecoinAnalytics = ({ data }: StablecoinAnalyticsProps) => {
  const COLORS = ['#FABF2C', '#627EEA', '#26A17B', '#F3BA2F', '#002868'];
  
  const chartData = data.map((s, i) => ({
    name: s.symbol,
    value: s.circulating,
  }));

  return (
    <div className="bg-card border border-border p-6">
      <h2 className="text-xl font-bold font-heading mb-4 text-primary uppercase tracking-widest">Stablecoin Dominance</h2>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default StablecoinAnalytics;
