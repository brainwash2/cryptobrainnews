import React, { Suspense } from 'react';
import { getL2ActiveAddresses } from '@/lib/dune';
import { getL2ScalingData } from '@/lib/l2beat';
import BlockChartCard from '../_components/charts/BlockChartCard';
import { DataHeader } from '../_components/DataHeader';
import { ChartSkeleton } from '../_components/ChartSkeleton';
import { DataTable } from '../_components/DataTable';

export const metadata = { title: 'L2 Scaling Overview | CryptoBrainNews' };
export const revalidate = 3600;

async function ScalingData() {
  const[duneData, l2Data] = await Promise.all([
    getL2ActiveAddresses(30).catch(() => []),
    getL2ScalingData()
  ]);
  
  const pivoted: Record<string, any> = {};
  duneData.forEach(row => {
    const d = String(row.day).slice(0, 10);
    const chain = String(row.chain).toLowerCase();
    if (!pivoted[d]) pivoted[d] = { date: d, arbitrum: 0, optimism: 0, base: 0 };
    pivoted[d][chain] = Number(row.active_addresses || 0);
  });
  
  const chartData = Object.values(pivoted).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-12">
      <DataHeader 
        title="Layer 2 Scaling" 
        description="Daily active addresses, network usage, and TVL across rollup solutions." 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BlockChartCard 
            title="Daily Active Addresses by Chain" 
            type="lineDual" 
            yAxisFormat="number"
            data={chartData} 
            colors={{ arbitrum: '#3b82f6', optimism: '#ef4444', base: '#22c55e' }} 
          />
        </div>
        
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 flex flex-col justify-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#555] mb-6">Network Health</h3>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-[#888] font-mono mb-1">Total L2 TVL</p>
              <p className="text-3xl font-black text-[#FABF2C]">
                ${(l2Data.reduce((sum, d) => sum + (d.tvl || 0), 0) / 1e9).toFixed(2)}B
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#888] font-mono mb-1">Top Network</p>
              <p className="text-xl font-black text-white">{l2Data[0]?.name || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#888] font-mono mb-1">Data Source</p>
              <p className="text-sm font-black text-[#00d672]">DefiLlama & Dune</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Rollup Total Value Locked (TVL)
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
          <DataTable
            columns={[
              { key: 'name', label: 'Network' },
              { 
                key: 'tvl', 
                label: 'TVL (USD)', 
                format: (v) => v ? `$${(Number(v) / 1e9).toFixed(2)}B` : <span className="text-[#555]">N/A</span>, 
                align: 'right' 
              }
            ]}
            data={l2Data}
            emptyMessage="Syncing L2 data..."
          />
        </div>
      </div>
    </div>
  );
}

export default function ScalingPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <ScalingData />
      </Suspense>
    </main>
  );
}
