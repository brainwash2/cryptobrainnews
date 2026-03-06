import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import AlphaGate from '@/components/auth/AlphaGate';
import BlockChartCard from '../../_components/charts/BlockChartCard';

export const metadata = { title: 'Futures Markets | CryptoBrainNews' };

export default function FuturesPage() {
  // Mock representation of premium data payload
  const premiumData = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    open_interest: 15000000000 + Math.random() * 2000000000,
    volume: 45000000000 + Math.random() * 10000000000,
  }));

  return (
    <div className="space-y-8 pb-20">
      <DataHeader 
        title="Futures & Derivatives" 
        description="Perpetual swap funding rates, open interest, and liquidations." 
      />
      
      <AlphaGate>
        <div className="grid grid-cols-1 gap-6">
          <BlockChartCard 
            title="Global Futures Open Interest (USD)" 
            type="area" 
            yAxisFormat="currency"
            data={premiumData} 
            colors={{ open_interest: '#FABF2C' }} 
            description="Aggregated Open Interest across major exchanges (Binance, CME, Bybit)."
          />
          <BlockChartCard 
            title="Futures Daily Volume (USD)" 
            type="barStack" 
            yAxisFormat="currency"
            data={premiumData} 
            colors={{ volume: '#3b82f6' }} 
            description="Total traded volume for perpetual swaps and dated futures."
          />
        </div>
      </AlphaGate>
    </div>
  );
}
