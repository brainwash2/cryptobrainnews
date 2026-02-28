import React, { Suspense } from 'react';
import { getCoinPrice } from '@/lib/api';
import { DataHeader } from '../../_components/DataHeader';
import { DataTable } from '../../_components/DataTable';

export const metadata = { title: 'Ethereum ETFs | CryptoBrainNews' };
export const revalidate = 3600;

const ETH_ETFS =[
  { ticker: 'ETHA', issuer: 'BlackRock', aum: 1100000000, fee: '0.12%' },
  { ticker: 'ETHE', issuer: 'Grayscale', aum: 4200000000, fee: '2.50%' },
  { ticker: 'FETH', issuer: 'Fidelity', aum: 450000000, fee: '0.25%' },
  { ticker: 'ETHW', issuer: 'Bitwise', aum: 310000000, fee: '0.20%' },
];

async function EthereumEtfData() {
  const ethPrice = await getCoinPrice('ethereum') || 3000;
  const totalAum = ETH_ETFS.reduce((sum, etf) => sum + etf.aum, 0);

  return (
    <div className="space-y-8">
      <DataHeader 
        title="Ethereum Spot ETFs" 
        description="Assets Under Management (AUM) across US Spot ETH ETFs." 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-[#555] text-[10px] font-black tracking-widest uppercase">Total ETH ETF AUM</div>
          <div className="text-3xl font-black text-[#FABF2C] mt-2 tabular-nums">${(totalAum / 1e9).toFixed(2)}B</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-[#555] text-[10px] font-black tracking-widest uppercase">Underlying ETH Price</div>
          <div className="text-3xl font-black text-[#3b82f6] mt-2 tabular-nums">${ethPrice.toLocaleString()}</div>
        </div>
      </div>

      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            { key: 'ticker', label: 'Ticker' },
            { key: 'issuer', label: 'Issuer' },
            { key: 'aum', label: 'AUM (USD)', format: (v) => `$${(Number(v) / 1e6).toFixed(0)}M`, align: 'right' },
            { key: 'fee', label: 'Sponsor Fee', align: 'right' },
          ]}
          data={ETH_ETFS}
        />
      </div>
    </div>
  );
}

export default function EthereumEtfsPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<div className="animate-pulse h-64 bg-[#0a0a0a] border border-[#1a1a1a]" />}>
        <EthereumEtfData />
      </Suspense>
    </main>
  );
}
