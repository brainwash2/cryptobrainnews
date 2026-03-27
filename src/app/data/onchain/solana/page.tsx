import React, { Suspense }                   from "react";
import { DataHeader }                          from "../../_components/DataHeader";
import { ChartSkeleton }                       from "../../_components/ChartSkeleton";
import { getSolanaStats, getChainTvlHistory }  from "@/lib/onchain-data";
import { getCoinPrice }                        from "@/lib/api";
import OnchainAreaChart                        from "../_components/OnchainAreaChart";

export const metadata = {
  title: "Solana On-Chain | CryptoBrainNews",
  description: "Solana network metrics - TVL, validators, staking APR, and transaction activity.",
};
export const revalidate = 300;

function StatCard({ label, value, sub, color = "#9945ff" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

function fmtNum(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

async function SolData() {
  const [solStats, solPrice, tvlHistory] = await Promise.all([
    getSolanaStats().catch(() => null),
    getCoinPrice("solana").catch(() => 0),
    getChainTvlHistory("Solana", 90).catch(() => []),
  ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Solana On-Chain"
        description="Solana network health - TVL, validators, live TPS, and staking APR."
      />

      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - Solana RPC + DefiLlama
        </span>
      </div>

      {solStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="SOL Price"     value={solPrice > 0 ? `$${solPrice.toFixed(2)}` : "-"} sub="CoinGecko" />
          <StatCard label="DeFi TVL"      value={solStats.tvlUsd > 0 ? `$${(solStats.tvlUsd / 1e9).toFixed(2)}B` : "-"} sub="DefiLlama" />
          <StatCard label="Live TPS"      value={solStats.tps > 0 ? `${solStats.tps.toLocaleString()}` : "-"} sub="getRecentPerformanceSamples" color="#fff" />
          <StatCard label="Validators"    value={fmtNum(solStats.validatorCount)} sub="current + delinquent" color="#fff" />
          <StatCard label="Staking APR"   value={`${solStats.stakingApr.toFixed(1)}%`} sub="approximate network APY" color="#00d672" />
          <StatCard label="Consensus"     value="PoH + PoS" sub="Proof of History" color="#888" />
          <StatCard label="Block Time"    value="~400ms" sub="average slot time" color="#888" />
          <StatCard label="Data Source"   value="Public RPC" sub="mainnet-beta.solana.com" color="#888" />
        </div>
      ) : (
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
          <p className="text-[#555] font-mono text-xs uppercase">Network stats temporarily unavailable</p>
        </div>
      )}

      <OnchainAreaChart
        title="Solana DeFi TVL (90D)"
        subtitle="Source: DefiLlama - total value locked in Solana-native protocols"
        data={tvlHistory}
        dataKey="tvl"
        color="#9945ff"
        yFormatter={(v) => `$${(v / 1e9).toFixed(2)}B`}
        height={220}
      />

      <div className="border border-dashed border-[#1a1a1a] p-6 text-center">
        <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
          Daily transaction history charts - Solana RPC getRecentPerformanceSamples
          returns live TPS but not historical daily totals. No free daily tx history API available.
        </p>
      </div>
    </div>
  );
}

export default function SolanaOnChainPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <SolData />
      </Suspense>
    </main>
  );
}