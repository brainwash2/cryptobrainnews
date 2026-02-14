// src/app/de-fi-analytics/page.tsx
import React from 'react';
import { DataSidebar } from '@/app/data/_components/DataSidebar';
import DeFiInteractive from './components/DeFiInteractive';
import {
  getDeFiProtocols,
  getDexVolume,
  getStablecoinData,
} from '@/lib/api';

export const metadata = {
  title: 'DeFi Intelligence',
  description: 'Institutional-grade DeFi analytics — TVL, DEX Volume, Stablecoins',
};

export default async function DeFiAnalyticsPage() {
  const [protocols, dexVolume, stableMcap] = await Promise.all([
    getDeFiProtocols(),
    getDexVolume(),
    getStablecoinData(),
  ]);

  return (
    <div className="flex max-w-[2000px] mx-auto border-l border-r border-[#1a1a1a]">
      <DataSidebar />

      <main className="flex-1 min-w-0 bg-[#050505] p-6 md:p-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black font-heading uppercase tracking-tighter mb-2">
            DeFi <span className="text-primary">Terminal</span>
          </h1>
          <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em]">
            Institutional Grade Intelligence Hub • DefiLlama Feed
          </p>
          <div className="h-px w-20 bg-primary/40 mt-3" />
        </div>

        <DeFiInteractive
          initialProtocols={protocols}
          dexVolume={dexVolume}
          stableMcap={stableMcap}
        />
      </main>
    </div>
  );
}
