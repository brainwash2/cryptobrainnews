import React from 'react';
import { getDeFiProtocols } from '@/lib/api';
import { MetricCard } from '../../_components/MetricCard';
import DataTable from '../../_components/charts/DataTable';

export default async function TVLPage() {
  const protocols = await getDeFiProtocols();
  
  const formattedRows = protocols.map((p, i) => ({
    rank: i + 1,
    name: p.name,
    category: p.category,
    chain: p.chain,
    tvl: p.tvl >= 1e9 ? `$${(p.tvl / 1e9).toFixed(2)}B` : `$${(p.tvl / 1e6).toFixed(1)}M`,
    change_1d: `${p.change_1d! >= 0 ? '+' : ''}${p.change_1d?.toFixed(2)}%`,
  }));

  return (
    <div className="space-y-8">
      <DataTable
        columns={[
          { key: 'rank', label: '#' },
          { key: 'name', label: 'Protocol' },
          { key: 'category', label: 'Category' },
          { key: 'chain', label: 'Chain' },
          { key: 'tvl', label: 'TVL', align: 'right' },
          { key: 'change_1d', label: '24H', align: 'right' },
        ]}
        rows={formattedRows}
      />
    </div>
  );
}
