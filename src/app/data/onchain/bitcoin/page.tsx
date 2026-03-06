import React, { Suspense } from 'react';
import { getBTCActiveAddresses, getBTCDailyTransactions } from '@/lib/dune';
import BlockChartCard from '../../_components/charts/BlockChartCard';
import { DataHeader } from '../../_components/DataHeader';
import { ChartSkeleton } from '../../_components/ChartSkeleton';

export const metadata = { title: 'Bitcoin On-Chain | CryptoBrainNews' };
export const revalidate = 300;

async function BitcoinData() {
  const [addresses, txns] = await Promise.all([
    getBTCActiveAddresses(30).catch(() => []),
    getBTCDailyTransactions(30).catch(() =>[])
  ]);

  // Map Dune rows to Recharts compatible format
  const activeData = addresses.map((d: any) => ({
    date: String(d.day).slice(0, 10),
    active_addresses: Number(d.tx_count || 0)
  }));

  const txnData = txns.map((d: any) => ({
    date: String(d.day).slice(0, 10),
    transactions: Number(d.tx_count || 0)
  }));

  return (
    <div className="space-y-8">
      <DataHeader 
        title="Bitcoin On-Chain" 
        description="Daily network activity and transactions on the Bitcoin blockchain." 
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BlockChartCard 
          title="Bitcoin Daily Transactions" 
          type="barStack" 
          yAxisFormat="number"
          data={txnData} 
          colors={{ transactions: '#FABF2C' }} 
        />
        <BlockChartCard 
          title="Bitcoin Active Network Usage" 
          type="area" 
          yAxisFormat="number"
          data={activeData} 
          colors={{ active_addresses: '#f97316' }} 
        />
      </div>
    </div>
  );
}

export default function BitcoinPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <BitcoinData />
      </Suspense>
    </main>
  );
}
