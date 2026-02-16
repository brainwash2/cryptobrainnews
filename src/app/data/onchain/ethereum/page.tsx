import React from 'react';
import { getEthActiveAddresses, getEthDailyTransactions, getEthGasMetrics } from '@/lib/dune';
import { MetricCard } from '../../_components/MetricCard';
import AreaChartCard from '../../_components/charts/AreaChartCard';

export default async function EthereumOnChainPage() {
  const [addresses, txns, gas] = await Promise.all([
    getEthActiveAddresses(60),
    getEthDailyTransactions(60),
    getEthGasMetrics(60),
  ]);

  return (
    <div className="space-y-8">
      <AreaChartCard
        title="Active Addresses"
        data={addresses as any[]}
        xKey="day"
        yKey="active_addresses"
        yFormat="number"
        color="#627EEA"
      />
      <AreaChartCard
        title="Avg Gas Price"
        data={gas as any[]}
        xKey="day"
        yKey="avg_gas_price_gwei"
        yFormat="number"
        color="#ff4757"
      />
    </div>
  );
}
