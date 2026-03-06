export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getLiveMarketPrices } from '@/lib/api';
import { getAllArticles } from '@/lib/articles';
import PriceIndexesTerminal from './_components/PriceIndexesTerminal';

export const metadata: Metadata = {
  title: 'Cryptocurrency Prices | CryptoBrainNews',
  description: 'Real-time cryptocurrency price data, market metrics, and top gainers.',
};

export default async function PriceIndexesPage(props: { searchParams: Promise<{ currency?: string, category?: string }> }) {
  const searchParams = await props.searchParams;
  const currency = searchParams?.currency || 'usd';
  const category = searchParams?.category || 'all';
  
  const [prices, news] = await Promise.all([
    getLiveMarketPrices(currency, category),
    getAllArticles()
  ]);

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <Suspense fallback={<div className="text-[#FABF2C] animate-pulse">Loading Terminal...</div>}>
          <PriceIndexesTerminal prices={prices as any} news={news as any} />
        </Suspense>
      </div>
    </main>
  );
}
