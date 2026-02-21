import React from 'react';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getLiveMarketPrices } from '@/lib/api';
import type { CoinMarketData } from '@/lib/types';
import PriceIndexesTerminal from './_components/PriceIndexesTerminal';

export const metadata: Metadata = {
  title: 'Price Indexes | CryptoBrainNews',
  description: 'Real-time cryptocurrency price data and market metrics.',
};

async function getPrices(): Promise<CoinMarketData[]> {
  try {
    return await getLiveMarketPrices();
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    return [];
  }
}

export default async function PriceIndexesPage() {
  const prices = await getPrices();

  return (
    <main className="min-h-screen bg-[#050505]">
      <Suspense fallback={<div className="p-8 text-[#FABF2C]">Loading prices...</div>}>
        <div className="max-w-[1400px] mx-auto p-8">
          <PriceIndexesTerminal prices={prices} />
        </div>
      </Suspense>
    </main>
  );
}
