import React, { Suspense } from 'react';
import { getSOLDailyTransactions, getSOLDailyFees } from '@/lib/dune';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { DataHeader } from '../../_components/DataHeader';
import { ChartSkeleton } from '../../_components/ChartSkeleton';

export const metadata = { title: 'Solana On-Chain | CryptoBrainNews' };
export const revalidate = 300;

async function SolanaData() {
  const[txns, fees] = await Promise.all([
    getSOLDailyTransactions(30).catch(() => []),
    getSOLDailyFees(30).catch(() =>[])
  ]);

  const txnData = txns.map((d: any) => ({
    date: String(d.day).slice(0, 10),
    transactions: Number(d.tx_count || 0),
    signers: Number(d.active_signers || 0)
  }));

  const feeData = fees.map((d: any) => ({
    date: String(d.day).slice(0, 10),
    fees_sol: Number(d.total_fees_sol || 0)
  }));

  return (
    <div className="space-y-8">
      <DataHeader 
        title="Solana On-Chain" 
        description="High-throughput network metrics, active signers, and daily compute fees." 
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BlockChartCard 
          title="Daily Active Signers" 
          type="line" 
          yAxisFormat="number"
          data={txnData} 
          colors={{ signers: '#14b8a6' }} 
        />
        <BlockChartCard 
          title="Total Daily Fees (SOL)" 
          type="area" 
          yAxisFormat="number"
          data={feeData} 
          colors={{ fees_sol: '#8b5cf6' }} 
        />
      </div>
    </div>
  );
}

export default function SolanaPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <SolanaData />
      </Suspense>
    </main>
  );
}
