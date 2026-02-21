import React from 'react';
import StablecoinClient from './_components/StablecoinClient';

export const metadata = {
  title: 'Stablecoin Data | CryptoBrainNews',
  description: 'Stablecoin supply, flows, and distribution across blockchains.',
};

export const revalidate = 300;

async function getStablecoinData() {
  try {
    const res = await fetch('https://stablecoinindex.com/api/v2/stablecoins', {
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch {
    return null;
  }
}

export default async function StablecoinsPage() {
  const stablecoins = await getStablecoinData();

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Stablecoins</h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          Supply, Flows & Distribution
        </p>
        <StablecoinClient stablecoins={stablecoins} />
      </div>
    </main>
  );
}
