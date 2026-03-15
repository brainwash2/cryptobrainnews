import React, { Suspense }          from 'react';
import { DataHeader }                from '../../_components/DataHeader';
import { ChartSkeleton }             from '../../_components/ChartSkeleton';
import ScalingTable                  from '../_components/ScalingTable';
import TvlBars                       from '../_components/TvlBars';
import { getOptimisticRollups }      from '@/lib/scaling-data';
import { getL2ActiveAddresses, getL2GasFees } from '@/lib/dune';
import BlockChartCard                from '../../_components/charts/BlockChartCard';

export const metadata = {
  title: 'Optimistic Rollups | CryptoBrainNews',
  description: 'Arbitrum, Optimism, Base, Blast, Mantle – TVL, active addresses, and gas fees.',
};
export const revalidate = 3600;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return n > 0 ? `$${n.toLocaleString()}` : '—';
}

async function OptimisticData() {
  const [chains, addresses, gasFees] = await Promise.all([
    getOptimisticRollups(),
    getL2ActiveAddresses(30).catch(() => []),
    getL2GasFees(30).catch(() => []),
  ]);

  const totalTvl = chains.reduce((s, c) => s + c.tvl, 0);

  // Pivot Dune address data
  const pivotAddr: Record<string, Record<string, number>> = {};
  addresses.forEach((row) => {
    const d     = String(row.day ?? '').slice(0, 10);
    const chain = String(row.chain ?? '').toLowerCase();
    if (!pivotAddr[d]) pivotAddr[d] = { date: d as unknown as number };
    pivotAddr[d][chain] = Number(row.active_addresses ?? row.tx_count ?? 0);
  });

  const pivotFees: Record<string, Record<string, number>> = {};
  gasFees.forEach((row) => {
    const d     = String(row.day ?? '').slice(0, 10);
    const chain = String(row.chain ?? '').toLowerCase();
    if (!pivotFees[d]) pivotFees[d] = { date: d as unknown as number };
    pivotFees[d][chain] = Number(row.avg_gas_price_gwei ?? 0);
  });

  const addrChartData = Object.values(pivotAddr).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );
  const feeChartData = Object.values(pivotFees).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Optimistic Rollups"
        description="Fraud-proof based rollups – Arbitrum, Optimism, Base, Blast, and Mantle. TVL, addresses, gas fees."
      />

      {/* ── KPI Strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Total Optimistic TVL</p>
          <p className="text-2xl font-black text-[#3b82f6] tabular-nums">{fmtUsd(totalTvl)}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Leading Network</p>
          <p className="text-2xl font-black text-white">{chains[0]?.name ?? '—'}</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">{fmtUsd(chains[0]?.tvl ?? 0)}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Networks Tracked</p>
          <p className="text-2xl font-black text-white">{chains.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Mechanism</p>
          <p className="text-sm font-black text-[#FABF2C]">Fraud Proofs</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">7-day challenge window</p>
        </div>
      </div>

      {/* ── TVL Bars ───────────────────────────────────────────────── */}
      <TvlBars chains={chains} title="Optimistic Rollup TVL Market Share" />

      {/* ── Dune Charts ───────────────────────────────────────────── */}
      {addrChartData.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BlockChartCard
            title="Daily Active Addresses (Dune)"
            type="lineDual"
            yAxisFormat="number"
            data={addrChartData}
            colors={{ arbitrum: '#3b82f6', optimism: '#ef4444', base: '#0052ff' }}
          />
          {feeChartData.length > 0 && (
            <BlockChartCard
              title="Avg Gas Price Gwei (Dune)"
              type="barStack"
              yAxisFormat="number"
              data={feeChartData}
              colors={{ arbitrum: '#3b82f6', optimism: '#ef4444', base: '#0052ff' }}
            />
          )}
        </div>
      ) : (
        <div className="border border-dashed border-[#1a1a1a] p-6 text-center">
          <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
            Active address &amp; gas charts activate once Dune query IDs are set in
            <code className="text-[#3b82f6] ml-1">src/lib/dune.ts</code>
          </p>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#3b82f6] rounded-full" />
          All Optimistic Rollups
        </h3>
        <ScalingTable chains={chains} />
      </div>

      {/* ── Tech explainer ─────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">How Optimistic Rollups Work</h3>
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          Optimistic rollups batch transactions off-chain and post compressed calldata to Ethereum.
          They assume all transactions are valid by default (optimistic) and rely on fraud proofs
          to catch invalid state transitions during a 7-day challenge window. This means withdrawals
          back to L1 take 7 days unless using a liquidity bridge. They are EVM-compatible (Arbitrum Nitro,
          OP Bedrock) making migration of Ethereum dApps straightforward.
        </p>
      </div>
    </div>
  );
}

export default function OptimisticPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <OptimisticData />
      </Suspense>
    </main>
  );
}
