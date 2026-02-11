import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { DataSidebar } from '@/app/data/_components/DataSidebar';
import MarketsInteractive from './components/MarketsInteractive';

export const metadata = {
  title: 'Markets Overview - CryptoBrainNews',
};

export default function MarketsOverviewPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <PriceTicker />
      
      <div className="flex max-w-[2000px] mx-auto border-l border-r border-[#222]">
        <DataSidebar />
        
        <main className="flex-1 min-w-0 bg-[#050505] p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-black font-heading uppercase tracking-tighter mb-2">
              Market <span className="text-primary">Overview</span>
            </h1>
            <div className="h-1 w-20 bg-primary/50"></div>
          </div>
          <MarketsInteractive />
        </main>
      </div>
    </div>
  );
}
