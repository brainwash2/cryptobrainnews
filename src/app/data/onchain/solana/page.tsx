import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import OnchainAreaChart     from "../_components/OnchainAreaChart";

export const metadata = {
  title: "Solana On-Chain | CryptoBrainNews",
  description: "Solana network health - TVL, validators, live TPS, and staking APR.",
};
export const revalidate = 300;

async function ft(url: string, opts?: RequestInit): Promise<Response> {
  const ac = new AbortController();
  const t  = setTimeout(() => ac.abort(), 6000);
  try { return await fetch(url, { ...opts, signal: ac.signal }); }
  finally { clearTimeout(t); }
}

interface SolStats { solPrice: number; tvlUsd: number; tps: number; validatorCount: number; }

async function getSolStats(): Promise<SolStats | null> {
  try {
    const [priceRes, tvlRes, tpsRes, validRes] = await Promise.all([
      ft("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
         { next: { revalidate: 60 } }),
      ft("https://api.llama.fi/v2/historicalChainTvl/Solana",
         { next: { revalidate: 3600 } }),
      ft("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getRecentPerformanceSamples", params: [1] }),
        next: { revalidate: 60 },
      }),
      ft("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "getVoteAccounts",
          params: [{ commitment: "finalized" }] }),
        next: { revalidate: 300 },
      }),
    ]);

    const solPrice = priceRes.ok
      ? ((await priceRes.json()) as Record<string, { usd?: number }>)?.solana?.usd ?? 0
      : 0;

    let tvlUsd = 0;
    if (tvlRes.ok) {
      const hist = (await tvlRes.json()) as Array<{ tvl: number }>;
      tvlUsd = Array.isArray(hist) ? (hist[hist.length - 1]?.tvl ?? 0) : 0;
    }

    let tps = 2_500;
    if (tpsRes.ok) {
      const tj = (await tpsRes.json()) as { result?: Array<{ numTransactions: number; samplePeriodSecs: number }> };
      const s = tj.result?.[0];
      if (s?.numTransactions && s?.samplePeriodSecs) {
        tps = Math.round(s.numTransactions / s.samplePeriodSecs);
      }
    }

    let validatorCount = 1_500;
    if (validRes.ok) {
      const vj = (await validRes.json()) as { result?: { current?: unknown[]; delinquent?: unknown[] } };
      const c = vj.result?.current?.length ?? 0;
      const d = vj.result?.delinquent?.length ?? 0;
      if (c + d > 0) validatorCount = c + d;
    }

    return { solPrice, tvlUsd, tps, validatorCount };
  } catch { return null; }
}

async function getSolTvlHistory() {
  try {
    const res = await ft("https://api.llama.fi/v2/historicalChainTvl/Solana",
      { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const d = (await res.json()) as Array<{ date: number; tvl: number }>;
    return Array.isArray(d) ? d.slice(-90).map((p) => ({
      date: new Date(p.date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      tvl: p.tvl,
    })) : [];
  } catch { return []; }
}

function fmtNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

function Card({ label, value, sub, color = "#9945ff" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

async function SolData() {
  const [stats, tvlHistory] = await Promise.all([
    getSolStats().catch(() => null),
    getSolTvlHistory().catch(() => []),
  ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader title="Solana On-Chain"
        description="Solana network health - TVL, validators, live TPS, and staking APR." />
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - Solana RPC + DefiLlama + CoinGecko
        </span>
      </div>
      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card label="SOL Price"     value={stats.solPrice > 0 ? `$${stats.solPrice.toFixed(2)}` : "-"} sub="CoinGecko" />
          <Card label="DeFi TVL"      value={stats.tvlUsd > 0 ? `$${(stats.tvlUsd / 1e9).toFixed(2)}B` : "-"} sub="DefiLlama" />
          <Card label="Live TPS"      value={stats.tps > 0 ? stats.tps.toLocaleString() : "-"} sub="getRecentPerformanceSamples" color="#fff" />
          <Card label="Validators"    value={fmtNum(stats.validatorCount)} sub="current + delinquent" color="#fff" />
          <Card label="Staking APR"   value="~6.5%" sub="approximate network APY" color="#00d672" />
          <Card label="Consensus"     value="PoH + PoS" sub="Proof of History" color="#888" />
          <Card label="Block Time"    value="~400ms" sub="average slot time" color="#888" />
          <Card label="Source"        value="Mainnet RPC" sub="api.mainnet-beta.solana.com" color="#888" />
        </div>
      ) : (
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
          <p className="text-[#555] font-mono text-xs uppercase">Network stats temporarily unavailable</p>
        </div>
      )}
      <OnchainAreaChart title="Solana DeFi TVL (90D)"
        subtitle="Source: DefiLlama - total value locked in Solana-native protocols"
        data={tvlHistory} dataKey="tvl" color="#9945ff"
        yFormatter={(v) => `$${(v / 1e9).toFixed(2)}B`} height={220} />
    </div>
  );
}

export default function SolanaOnChainPage() {
  return <main><Suspense fallback={<ChartSkeleton />}><SolData /></Suspense></main>;
}