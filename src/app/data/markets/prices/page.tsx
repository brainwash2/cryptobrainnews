import React, { Suspense } from 'react';
import { getLiveMarketPrices } from '@/lib/api';
import { DataHeader } from '../../_components/DataHeader';
import { DataTable } from '../../_components/DataTable';
import { ChartSkeleton } from '../../_components/ChartSkeleton';

export const metadata = { title: 'Live Crypto Prices | CryptoBrainNews' };
export const revalidate = 60; // Refresh every 60 seconds

async function PricesData() {
  const prices = await getLiveMarketPrices('usd');

  const formatUsd = (v: unknown) => `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  const formatCompact = (v: unknown) => {
    const num = Number(v || 0);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const tableData = prices.map(p => ({
    rank: p.market_cap_rank,
    asset: p.name,
    symbol: p.symbol.toUpperCase(),
    price: p.current_price,
    change24h: p.price_change_percentage_24h,
    volume: p.total_volume,
    mcap: p.market_cap
  }));

  return (
    <div className="space-y-8">
      <DataHeader 
        title="Live Crypto Prices" 
        description="Real-time global spot pricing, 24h volume, and market capitalization across the top 100 assets." 
      />

      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            { key: 'rank', label: '#' },
            { key: 'asset', label: 'Asset' },
            { key: 'symbol', label: 'Ticker' },
            { key: 'price', label: 'Price', format: formatUsd, align: 'right' },
            { 
              key: 'change24h', 
              label: '24H %', 
              format: (v) => `${Number(v) > 0 ? '+' : ''}${Number(v).toFixed(2)}%`, 
              align: 'right' 
            },
            { key: 'volume', label: '24H Volume', format: formatCompact, align: 'right' },
            { key: 'mcap', label: 'Market Cap', format: formatCompact, align: 'right' },
          ]}
          data={tableData}
        />
      </div>
    </div>
  );
}

export default function PricesPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <PricesData />
      </Suspense>
    </main>
  );
}
