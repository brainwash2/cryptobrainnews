import React from 'react';
import NFTsClient from './_components/NFTsClient';

export const metadata = {
  title: 'NFT Data | CryptoBrainNews',
  description: 'NFT collection volumes, floor prices, and market metrics.',
};

export const revalidate = 300;

async function getNFTData() {
  try {
    const res = await fetch('https://api.reservoir.tools/collections/v5?limit=50', {
      headers: { 'X-API-Key': process.env.RESERVOIR_API_KEY || '' },
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch {
    return null;
  }
}

export default async function NFTsPage() {
  const nftData = await getNFTData();

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">NFTs</h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          Top Collections & Market Metrics
        </p>
        <NFTsClient nftData={nftData} />
      </div>
    </main>
  );
}
