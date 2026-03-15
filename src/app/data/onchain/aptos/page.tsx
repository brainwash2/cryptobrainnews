import React, { Suspense }              from 'react';
import { DataHeader }                   from '../../_components/DataHeader';
import { ChartSkeleton }                from '../../_components/ChartSkeleton';
import { getChainTvlHistory }           from '@/lib/onchain-data';
import OnchainAreaChart                 from '../_components/OnchainAreaChart';
import { getCoinPrice }                 from '@/lib/api';

export const metadata = {
  title: 'Aptos On-Chain | CryptoBrainNews',
  description: 'Aptos network metrics – TVL, transactions, fees, and active addresses.',
};
export const revalidate = 3600;

async function AptosData() {
  const [aptPrice, tvlHistory] = await Promise.all([
    getCoinPrice('aptos').catch(() => 0),
    getChainTvlHistory('Aptos', 90),
  ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Aptos On-Chain"
        description="Aptos network DeFi TVL and on-chain activity metrics."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'APT Price',   value: aptPrice > 0 ? `$${aptPrice.toFixed(2)}` : '—', color: '#00bfad' },
          { label: 'DeFi TVL',    value: tvlHistory.length > 0 ? `$${((tvlHistory[tvlHistory.length - 1]?.tvl ?? 0) / 1e6).toFixed(0)}M` : '—', color: '#00bfad' },
          { label: 'Consensus',   value: 'AptosBFT', color: '#888', sub: 'Block-STM parallel exec' },
          { label: 'Source',      value: 'DefiLlama', color: '#888', sub: 'Dune queries pending' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <OnchainAreaChart
        title="Aptos DeFi TVL (90D)"
        subtitle="Source: DefiLlama"
        data={tvlHistory}
        dataKey="tvl"
        color="#00bfad"
        yFormatter={(v) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`}
        height={250}
      />

      <div className="border border-dashed border-[#1a1a1a] p-6 text-center">
        <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
          User transactions, active addresses, and APT fee metrics via Dune Analytics — configure query IDs to activate
        </p>
      </div>
    </div>
  );
}

export default function AptosPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <AptosData />
      </Suspense>
    </main>
  );
}
