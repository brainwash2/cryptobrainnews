import React from 'react';
import { DataSidebar } from '@/app/data/_components/DataSidebar';
import MarketsInteractive from './components/MarketsInteractive';

export default function MarketsOverviewPage() {
  return (
    <div className="flex max-w-[2000px] mx-auto border-l border-r border-[#1a1a1a]">
      <DataSidebar />
      <main className="flex-1 min-w-0 bg-[#050505] p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black font-heading uppercase tracking-tighter mb-2">
            Market <span className="text-primary">Overview</span>
          </h1>
          <div className="h-px w-20 bg-primary/40 mt-2" />
        </div>
        <MarketsInteractive />
      </main>
    </div>
  );
}
