import React, { Suspense }                        from 'react';
import { DataHeader }                              from '../../_components/DataHeader';
import { ChartSkeleton }                           from '../../_components/ChartSkeleton';
import { getSolanaStats, getChainTvlHistory }      from '@/lib/onchain-data';
import OnchainAreaChart                            from '../_components/OnchainAreaChart';
import { getSOLDailyTransactions, getSOLDailyFees } from '@/lib/dune';
import { getCoinPrice }                            from '@/lib/api';

export const metadata = {
  title: 'Solana On-Chain | CryptoBrainNews',
  description: 'Solana network metrics – TVL, validators, staking APR, fees, and transaction activity.',
};
export const revalidate = 300;

function StatCard({
  label, value, sub, color = '#9945ff',
}: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

function fmtNum(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

async function SolanaOnChainData() {
  const [solStats, solPrice, tvlHistory, dailyTxns, dailyFees] = await Promise.all([
    getSolanaStats(),
    getCoinPrice('solana').catch(() => 0),
    getChainTvlHistory('Solana', 90),
    getSOLDailyTransactions(90).catch(() => []),
    getSOLDailyFees(90).catch(() => []),
  ]);

  const txChartData = dailyTxns
    .slice(-60)
    .map((r) => ({
      date: String(r.day ?? '').slice(0, 10),
      txns: Number(r.tx_count ?? 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const feeChartData = dailyFees
    .slice(-60)
    .map((r) => ({
      date: String(r.day ?? '').slice(0, 10),
      fees: Number(r.total_fees_sol ?? 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Solana On-Chain"
        description="Solana network metrics – TVL, validators, staking APR, and daily transaction activity."
      />

      {/* ── Live Stats ─────────────────────────────────────────────── */}
      {solStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="SOL Price"       value={solPrice > 0 ? `$${solPrice.toFixed(2)}` : '—'}        color="#9945ff" sub="CoinGecko" />
          <StatCard label="DeFi TVL"        value={`$${(solStats.tvlUsd / 1e9).toFixed(2)}B`}             color="#9945ff" sub="DefiLlama" />
          <StatCard label="Validators"      value={fmtNum(solStats.validatorCount)}                        color="#fff"    sub="Solana RPC" />
          <StatCard label="Staking APR"     value={`${solStats.stakingApr.toFixed(1)}%`}                   color="#00d672" sub="approx. network APY" />
          <StatCard label="TPS (approx.)"   value={`~${solStats.tps.toLocaleString()}`}                    color="#FABF2C" sub="sustainable throughput" />
          <StatCard label="SOL Market Cap"  value={solPrice > 0 ? `$${((solPrice * 580_000_000) / 1e9).toFixed(1)}B` : '—'} color="#888" sub="~580M circulating" />
          <StatCard label="Data Source"     value="DefiLlama"    color="#888" sub="+ Solana RPC" />
          <StatCard label="Fee Model"       value="Priority fees" color="#888" sub="base + priority" />
        </div>
      ) : (
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
          <p className="text-[#555] font-mono text-xs uppercase">Network stats unavailable</p>
        </div>
      )}

      {/* ── TVL History Chart ──────────────────────────────────────── */}
      <OnchainAreaChart
        title="Solana DeFi TVL (90D)"
        subtitle="Source: DefiLlama — Solana ecosystem protocols"
        data={tvlHistory}
        dataKey="tvl"
        color="#9945ff"
        yFormatter={(v) => `$${(v / 1e9).toFixed(2)}B`}
        height={220}
      />

      {/* ── Dune Transaction & Fee Charts ─────────────────────────── */}
      {txChartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OnchainAreaChart
            title="Daily Transactions (Dune)"
            subtitle="Non-vote transactions · Dune Analytics"
            data={txChartData}
            dataKey="txns"
            color="#9945ff"
            yFormatter={(v) => fmtNum(v)}
            height={200}
          />
          {feeChartData.length > 0 && (
            <OnchainAreaChart
              title="Daily Network Fees SOL (Dune)"
              subtitle="Total fees in SOL · Dune Analytics"
              data={feeChartData}
              dataKey="fees"
              color="#14f195"
              yFormatter={(v) => `${v.toFixed(0)} SOL`}
              height={200}
            />
          )}
        </div>
      ) : (
        <div className="border border-dashed border-[#1a1a1a] p-6 text-center">
          <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
            Transaction &amp; fee charts activate once Dune query IDs are set in
            <code className="text-[#9945ff] ml-1">src/lib/dune.ts</code>
          </p>
        </div>
      )}
    </div>
  );
}

export default function SolanaOnChainPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <SolanaOnChainData />
      </Suspense>
    </main>
  );
}
