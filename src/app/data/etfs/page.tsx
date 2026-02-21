import React from 'react';
import ETFsClient from './_components/ETFsClient';

export const metadata = {
  title: 'ETF Data | CryptoBrainNews',
  description: 'Bitcoin and Ethereum spot ETF flows and holdings data.',
};

export const revalidate = 300;

async function getETFData() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 600 } }
    );
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ETFsPage() {
  const etfData = await getETFData();

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Spot ETFs</h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          BTC & ETH Spot ETF Flows & Holdings
        </p>
        <ETFsClient etfData={etfData} />
      </div>
    </main>
  );
}
