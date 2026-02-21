import React from 'react';
import { cached } from '@/lib/cache';
import OnChainClient from './_components/OnChainClient';

export const metadata = {
  title: 'On-Chain Data | CryptoBrainNews',
  description: 'Active addresses, transactions, whale movements, and on-chain metrics.',
};

export const revalidate = 300;

async function getOnChainMetrics() {
  return cached(
    'onchain:metrics',
    async () => {
      try {
        // Fetch from blockchain.com API (free tier)
        const [btc, eth] = await Promise.all([
          fetch('https://blockchain.info/q/getblockcount').then((r) => r.text()),
          fetch('https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=demo').then((r) =>
            r.json()
          ),
        ]);
        return { btcBlocks: btc, eth };
      } catch {
        return null;
      }
    },
    600
  );
}

export default async function OnChainPage() {
  const metrics = await getOnChainMetrics();

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">On-Chain Metrics</h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          Active Addresses, Transactions & Whale Movements
        </p>
        <OnChainClient metrics={metrics} />
      </div>
    </main>
  );
}
