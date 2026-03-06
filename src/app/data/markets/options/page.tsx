import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import AlphaGate from '@/components/auth/AlphaGate';
import BlockChartCard from '../../_components/charts/BlockChartCard';

export const metadata = { title: 'Options Markets | CryptoBrainNews' };

export default function OptionsPage() {
  // Mock representation of premium data payload
  const premiumData = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    iv: 45 + Math.random() * 15,
    volume: 1200000000 + Math.random() * 500000000,
  }));

  return (
    <div className="space-y-8 pb-20">
      <DataHeader 
        title="Options Markets" 
        description="Implied volatility, options open interest, and Deribit metrics." 
      />
      
      <AlphaGate>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BlockChartCard 
            title="Implied Volatility (IV) - 30D" 
            type="line" 
            yAxisFormat="number"
            data={premiumData} 
            colors={{ iv: '#ef4444' }} 
            description="At-the-money implied volatility for BTC."
          />
          <BlockChartCard 
            title="Options Volume (USD)" 
            type="bar" 
            yAxisFormat="currency"
            data={premiumData} 
            colors={{ volume: '#22c55e' }} 
            description="Aggregated options trading volume across Deribit and CME."
          />
        </div>
      </AlphaGate>
    </div>
  );
}
