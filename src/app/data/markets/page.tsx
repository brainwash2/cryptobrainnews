import React from 'react';
import MarketsClient from './_components/MarketsClient';

export const metadata = {
  title: 'Markets Data | CryptoBrainNews',
  description: 'Global crypto market capitalization, trading volume, and price indexes.',
};

export const revalidate = 300;

async function getMarketData() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/global', {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    return null;
  }
}

export default async function MarketsPage() {
  const global = await getMarketData();

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
          Markets
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          Global Market Capitalization & Trading Volume
        </p>

        <MarketsClient global={global} />
      </div>
    </main>
  );
}
