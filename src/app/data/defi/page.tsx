import React from 'react';
import { getDeFiProtocols, getDexVolume, getStablecoinData } from '@/lib/api';
import { MetricCard } from '../_components/MetricCard';
import AreaChartCard from '../_components/charts/AreaChartCard';
import BarChartCard from '../_components/charts/BarChartCard';
import DataTable from '../_components/charts/DataTable';

export const metadata = { title: 'DeFi Intelligence | CryptoBrainNews' };

export default async function DeFiOverviewPage() {
  const [protocols, dexVolume, stableMcap] = await Promise.all([
    getDeFiProtocols(),
    getDexVolume(),
    getStablecoinData(),
  ]);

  const totalTVL = protocols.reduce((sum, p) => sum + (p.tvl || 0), 0);
  
  // Format rows on the SERVER
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Global DeFi TVL" value={`$${(totalTVL / 1e9).toFixed(2)}B`} />
        <MetricCard label="Protocols" value={String(protocols.length)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard title="DEX Volume" data={dexVolume as any} xKey="date" yKey="volume" />
        <BarChartCard title="Stablecoin Supply" data={stableMcap as any} xKey="date" yKey="mcap" />
      </div>

      <DataTable
        columns={[
          { key: 'rank', label: '#' },
          { key: 'name', label: 'Protocol' },
          { key: 'category', label: 'Category' },
          { key: 'chain', label: 'Chain' },
          { key: 'tvl', label: 'TVL', align: 'right' },
          { key: 'change_1d', label: '24h', align: 'right' },
        ]}
        rows={formattedRows}
        maxRows={30}
      />
    </div>
  );
}
