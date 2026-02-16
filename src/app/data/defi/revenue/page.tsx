import React from 'react';
import { getProtocolRevenue } from '@/lib/dune';
import { MetricCard } from '../../_components/MetricCard';
import DataTable from '../../_components/charts/DataTable';

export const metadata = { title: 'Protocol Revenue | CryptoBrainNews' };

export default async function ProtocolRevenuePage() {
  const data = await getProtocolRevenue();

  const formatUsd = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toLocaleString()}`;
  };

  const formattedRows = data.map((row) => ({
    protocol: row.protocol,
    revenue_7d: formatUsd(row.revenue_7d),
    revenue_30d: formatUsd(row.revenue_30d),
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="Protocols Tracked" value={String(data.length)} />
        <MetricCard label="Top Protocol" value={data[0]?.protocol || '—'} />
        <MetricCard label="Source" value="Dune Analytics" />
      </div>

      <DataTable
        columns={[
          { key: 'protocol', label: 'Protocol' },
          { key: 'revenue_7d', label: '7d Revenue', align: 'right' },
          { key: 'revenue_30d', label: '30d Revenue', align: 'right' },
        ]}
        rows={formattedRows}
      />
    </div>
  );
}
