import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { DataSidebar } from '@/app/data/_components/DataSidebar';
import DeFiInteractive from './components/DeFiInteractive';
import { getDeFiProtocols, getDexVolume, getStablecoinData } from '@/lib/api';

export const metadata = {
  title: 'DeFi Intelligence - CryptoBrainNews',
};

export default async function DeFiAnalyticsPage() {
  const [protocols, dexVolume, stableMcap] = await Promise.all([
    getDeFiProtocols(), 
    getDexVolume(), 
    getStablecoinData()
  ]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <PriceTicker />
      
      <div className="flex max-w-[2000px] mx-auto border-l border-r border-[#222]">
        <DataSidebar />
        
        <main className="flex-1 min-w-0 bg-[#050505] p-6 md:p-8">
          <div className="mb-10">
            <h1 className="text-5xl font-black font-heading uppercase tracking-tighter mb-2">
              DeFi <span className="text-primary">Terminal</span>
            </h1>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em]">
              Institutional Grade Intelligence Hub
            </p>
          </div>
          
          <DeFiInteractive 
            initialProtocols={protocols} 
            dexVolume={dexVolume} 
            stableMcap={stableMcap} 
          />
        </main>
      </div>
    </div>
  );
}
