import React, { Suspense } from 'react';
import { getLivePrices, getRealNews } from '@/lib/api';
import type { PriceTableRow } from '@/lib/types';
import PriceIndexesTerminal from './components/PriceIndexesTerminal';

export const metadata = { title: 'Price Indexes | CBN Terminal' };

export default async function PriceIndexesPage() {
  const [rawCoins, news] = await Promise.all([
    getLivePrices(),
    getRealNews(),
  ]);

  const coins: PriceTableRow[] = rawCoins.map((coin, index) => ({
    id: coin.id,
    rank: coin.market_cap_rank ?? index + 1,
    name: coin.name,
    symbol: coin.symbol,
    image: coin.image,
    price: coin.current_price ?? 0,
    change1h: coin.price_change_percentage_1h_in_currency ?? 0,
    change24h: coin.price_change_percentage_24h ?? 0,
    change7d: coin.price_change_percentage_7d_in_currency ?? 0,
    marketCap: coin.market_cap ?? 0,
    volume24h: coin.total_volume ?? 0,
    sparkline: coin.sparkline_in_7d?.price ?? [],
  }));

  return (
    <main className="min-h-screen bg-[#050505] py-6 px-4 lg:px-6">
      <div className="max-w-[1800px] mx-auto">
        <Suspense fallback={<div className="text-primary font-mono text-xs animate-pulse">LOADING TERMINAL...</div>}>
          <PriceIndexesTerminal initialCoins={coins} initialNews={news} />
        </Suspense>
      </div>
    </main>
  );
}
