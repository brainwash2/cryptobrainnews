import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { getDeFiProtocols, getDexVolume, getStablecoinData } from '@/lib/api';
import TheBlockDashboard from './components/TheBlockDashboard';

export default async function DeFiAnalyticsPage() {
  const [protocols, dexVolume, stableMcap] = await Promise.all([
    getDeFiProtocols(), getDexVolume(), getStablecoinData()
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header /><PriceTicker />
      <main className="container mx-auto px-4 lg:px-8 pt-20">
        <h1 className="text-6xl font-black text-white mb-2 tracking-tighter uppercase">DATA <span className="text-primary">TERMINAL</span></h1>
        <p className="text-gray-500 font-mono text-xs mb-12 uppercase tracking-[0.3em]">Institutional Grade Intelligence Hub</p>
        <TheBlockDashboard dexVolume={dexVolume} stableMcap={stableMcap} protocols={protocols} />
      </main>
    </div>
  );
}
