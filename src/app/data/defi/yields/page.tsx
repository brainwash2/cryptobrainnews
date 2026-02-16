import React from 'react';
import { getTopYields, type YieldPool } from '@/lib/api';
import { MetricCard } from '../../_components/MetricCard';
import DataTable from '../../_components/charts/DataTable';

export const metadata = { title: 'DeFi Yields | CryptoBrainNews' };

export default async function YieldsPage() {
  const yields = await getTopYields();

  // Calculate stats
  const avgApy = yields.reduce((sum, p) => sum + p.apy, 0) / yields.length;
  const topPool = yields.reduce((prev, current) => (prev.apy > current.apy) ? prev : current);

  // Format for Table
  const formattedRows = yields.map((row, i) => ({
    rank: i + 1,
    project: row.project,
    chain: row.chain,
    symbol: row.symbol,
    tvl: `$${(row.tvlUsd / 1e6).toFixed(1)}M`,
    apy: `${row.apy.toFixed(2)}%`,
    trend: row.apyPct1D, // For color coding if we added it, simple string for now
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
          DeFi <span className="text-primary">Yields</span>
        </h1>
        <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          Top Opportunities • Risk-Adjusted by TVL
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Opportunities" value={String(yields.length)} />
        <MetricCard label="Avg APY (Top 50)" value={`${avgApy.toFixed(2)}%`} />
        <MetricCard label="Highest APY" value={`${topPool.apy.toFixed(2)}%`} />
        <MetricCard label="Source" value="DefiLlama API" />
      </div>

      <DataTable
        columns={[
          { key: 'rank', label: '#' },
          { key: 'project', label: 'Protocol' },
          { key: 'chain', label: 'Chain' },
          { key: 'symbol', label: 'Token' },
          { key: 'tvl', label: 'TVL', align: 'right' },
          { key: 'apy', label: 'APY', align: 'right' },
        ]}
        rows={formattedRows}
      />
    </div>
  );
}
