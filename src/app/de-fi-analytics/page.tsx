import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Breadcrumb from '@/components/common/Breadcrumb';
import DeFiInteractive from './components/DeFiInteractive';
import { getDeFiProtocols, getStablecoinData } from '@/lib/api'; 

export const metadata = {
  title: 'DeFi Intelligence - CryptoBrainNews',
};

export default async function DeFiAnalyticsPage() {
  const [protocols, stablecoins] = await Promise.all([
    getDeFiProtocols(),
    getStablecoinData()
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PriceTicker />
      <main className="container mx-auto px-4 lg:px-8 pt-4">
        <Breadcrumb />
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-foreground font-heading mb-2 uppercase tracking-tighter">
            DeFi <span className="text-primary">Intelligence</span>
          </h1>
          <div className="h-1 w-20 bg-primary mb-4"></div>
        </div>

        <DeFiInteractive 
          initialProtocols={protocols} 
          stablecoins={stablecoins}
        />
      </main>
    </div>
  );
}
