import React, { Suspense } from 'react';
import { getCoinPrice } from '@/lib/api';
import { DataHeader } from '../../_components/DataHeader';
import { DataTable } from '../../_components/DataTable';

export const metadata = { title: 'Bitcoin ETFs | CryptoBrainNews' };
export const revalidate = 3600;

const BTC_ETFS =[
  { ticker: 'IBIT', issuer: 'BlackRock', aum: 17240000000, fee: '0.12%' },
  { ticker: 'GBTC', issuer: 'Grayscale', aum: 14100000000, fee: '1.50%' },
  { ticker: 'FBTC', issuer: 'Fidelity', aum: 9800000000, fee: '0.25%' },
  { ticker: 'ARKB', issuer: 'ARK Invest', aum: 2800000000, fee: '0.21%' },
  { ticker: 'BITB', issuer: 'Bitwise', aum: 2100000000, fee: '0.20%' },
];

async function BitcoinEtfData() {
  let btcPrice = await getCoinPrice('bitcoin');
  if (!btcPrice || btcPrice === 0) btcPrice = 65000;
  
  const totalAum = BTC_ETFS.reduce((sum, etf) => sum + etf.aum, 0);

  return (
    <div className="space-y-8">
      <DataHeader title="Bitcoin Spot ETFs" description="Assets Under Management (AUM) and holdings." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-[#555] text-[10px] font-black tracking-widest uppercase">Total BTC ETF AUM</div>
          <div className="text-3xl font-black text-[#FABF2C] mt-2 tabular-nums">${(totalAum / 1e9).toFixed(2)}B</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-[#555] text-[10px] font-black tracking-widest uppercase">Underlying BTC Price</div>
          <div className="text-3xl font-black text-white mt-2 tabular-nums">${btcPrice.toLocaleString()}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-[#555] text-[10px] font-black tracking-widest uppercase">Products Tracked</div>
          <div className="text-3xl font-black text-white mt-2 tabular-nums">{BTC_ETFS.length}</div>
        </div>
      </div>
      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            { key: 'ticker', label: 'Ticker' }, { key: 'issuer', label: 'Issuer' },
            { key: 'aum', label: 'AUM (USD)', format: (v) => `$${(Number(v) / 1e9).toFixed(2)}B`, align: 'right' },
            { key: 'fee', label: 'Sponsor Fee', align: 'right' },
          ]}
          data={BTC_ETFS}
        />
      </div>
    </div>
  );
}

export default function BitcoinEtfsPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<div className="animate-pulse h-64 bg-[#0a0a0a] border border-[#1a1a1a]" />}><BitcoinEtfData /></Suspense>
    </main>
  );
}
