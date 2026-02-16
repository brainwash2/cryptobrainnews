import React from 'react';
import { getEthActiveAddresses, getEthDailyTransactions, getEthGasMetrics } from '@/lib/dune';
import { MetricCard } from '../_components/MetricCard';
import AreaChartCard from '../_components/charts/AreaChartCard';
import BarChartCard from '../_components/charts/BarChartCard';

export const metadata = { title: 'On-Chain Metrics | CryptoBrainNews' };

export default async function OnChainPage() {
  const [addresses, txns, gas] = await Promise.all([
    getEthActiveAddresses(30),
    getEthDailyTransactions(30),
    getEthGasMetrics(30),
  ]);

  const latestGas = gas[gas.length - 1];
  const latestTx = txns[txns.length - 1];
  const latestAddr = addresses[addresses.length - 1];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
          On-Chain <span className="text-primary">Metrics</span>
        </h1>
        <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          Network Activity • Dune Analytics
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="ETH Gas (Avg)"
          value={latestGas ? `${latestGas.avg_gas_price_gwei.toFixed(1)} Gwei` : '—'}
        />
        <MetricCard
          label="Daily Active Addresses"
          value={latestAddr ? `${(latestAddr.active_addresses / 1e3).toFixed(0)}K` : '—'}
        />
        <MetricCard
          label="Daily Transactions"
          value={latestTx ? `${(latestTx.tx_count / 1e6).toFixed(2)}M` : '—'}
        />
        <MetricCard label="Source" value="Dune Analytics" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard
          title="Ethereum Active Addresses (30d)"
          source="Dune"
          data={addresses as Record<string, unknown>[]}
          xKey="day"
          yKey="active_addresses"
          yFormat="number"
          color="#627EEA"
        />
        <BarChartCard
          title="Daily Transactions (30d)"
          source="Dune"
          data={txns as Record<string, unknown>[]}
          xKey="day"
          yKey="tx_count"
          yFormat="number"
          color="#FABF2C"
        />
      </div>

      <AreaChartCard
        title="Average Gas Price (Gwei)"
        source="Dune"
        data={gas as Record<string, unknown>[]}
        xKey="day"
        yKey="avg_gas_price_gwei"
        yFormat="number"
        color="#ff4757"
        height={300}
      />
    </div>
  );
}
