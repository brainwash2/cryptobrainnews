import React from 'react';
import DeFiClient from './_components/DeFiClient';

export const metadata = {
  title: 'DeFi Data | CryptoBrainNews',
  description: 'DeFi protocol TVL, yields, and decentralized finance analytics.',
};

export const revalidate = 300;

async function getDeFiData() {
  try {
    const res = await fetch('https://api.llama.fi/protocols', {
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch {
    return [];
  }
}

export default async function DeFiPage() {
  const protocols = await getDeFiData();

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">DeFi Protocols</h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          Total Value Locked & Protocol Analysis
        </p>
        <DeFiClient protocols={protocols} />
      </div>
    </main>
  );
}
