import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import OnchainAreaChart     from "../_components/OnchainAreaChart";

export const metadata = {
  title: "Ethereum On-Chain | CryptoBrainNews",
  description: "Ethereum network health - staking, gas, TVL, and on-chain activity.",
};
export const revalidate = 1800;

// 6-second AbortController — well within Vercel 10s limit
async function ft(url: string, opts?: RequestInit): Promise<Response> {
  const ac = new AbortController();
  const t  = setTimeout(() => ac.abort(), 6000);
  try { return await fetch(url, { ...opts, signal: ac.signal }); }
  finally { clearTimeout(t); }
}

interface EthStats {
  totalStaked: number; validatorCount: number; stakingApr: number;
  avgGasGwei: number; tvlUsd: number; ethPrice: number;
}

async function getEthStats(): Promise<EthStats | null> {
  try {
    const [priceRes, beaconRes, tvlRes] = await Promise.all([
      ft("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
         { next: { revalidate: 60 } }),
      ft("https://beaconcha.in/api/v1/epoch/latest",
         { headers: { Accept: "application/json" }, next: { revalidate: 300 } }),
      ft("https://api.llama.fi/v2/historicalChainTvl/Ethereum",
         { next: { revalidate: 3600 } }),
    ]);

    const ethPrice = priceRes.ok
      ? ((await priceRes.json()) as Record<string, { usd?: number }>)?.ethereum?.usd ?? 0
      : 0;

    let totalStaked = 0, validatorCount = 0, stakingApr = 3.5;
    if (beaconRes.ok) {
      const bj = (await beaconRes.json()) as { data?: { eligibleether?: number; validatorscount?: number; stakingapr?: number } };
      const d = bj.data;
      totalStaked    = d?.eligibleether   ? d.eligibleether / 1e9 : 0;
      validatorCount = d?.validatorscount ?? 0;
      stakingApr     = d?.stakingapr      ? +(d.stakingapr * 100).toFixed(2) : 3.5;
    }

    let tvlUsd = 0;
    if (tvlRes.ok) {
      const hist = (await tvlRes.json()) as Array<{ tvl: number }>;
      tvlUsd = Array.isArray(hist) ? (hist[hist.length - 1]?.tvl ?? 0) : 0;
    }

    // Gas: public Ethereum node via eth_gasPrice (fallback 20 gwei)
    let avgGasGwei = 20;
    try {
      const gasRes = await ft("https://cloudflare-eth.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
      });
      if (gasRes.ok) {
        const gj = (await gasRes.json()) as { result?: string };
        if (gj.result) avgGasGwei = Math.round(parseInt(gj.result, 16) / 1e9);
      }
    } catch { /* use fallback */ }

    return { totalStaked: +totalStaked.toFixed(0), validatorCount, stakingApr, avgGasGwei, tvlUsd, ethPrice };
  } catch { return null; }
}

async function getEthTvlHistory() {
  try {
    const res = await ft("https://api.llama.fi/v2/historicalChainTvl/Ethereum",
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
  return n.toFixed(0);
}

function Card({ label, value, sub, color = "#3b82f6" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

async function EthData() {
  const [stats, tvlHistory] = await Promise.all([
    getEthStats().catch(() => null),
    getEthTvlHistory().catch(() => []),
  ]);
  const stakedUsd = stats ? stats.totalStaked * stats.ethPrice : 0;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader title="Ethereum On-Chain"
        description="Ethereum network health - staking statistics, gas, TVL, and on-chain activity." />
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - beaconcha.in + DefiLlama + cloudflare-eth.com
        </span>
      </div>
      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card label="ETH Price"        value={stats.ethPrice > 0 ? `$${stats.ethPrice.toLocaleString()}` : "-"} sub="CoinGecko" />
          <Card label="Total ETH Staked" value={`${fmtNum(stats.totalStaked)} ETH`}
            sub={stakedUsd > 0 ? `$${(stakedUsd / 1e9).toFixed(1)}B` : "beaconcha.in"} />
          <Card label="Validators"       value={fmtNum(stats.validatorCount)} sub="active + pending" color="#fff" />
          <Card label="Staking APR"      value={`${stats.stakingApr.toFixed(2)}%`} sub="beaconcha.in" color="#00d672" />
          <Card label="Avg Gas (Gwei)"   value={`${stats.avgGasGwei} Gwei`}
            color={stats.avgGasGwei > 50 ? "#ff4757" : "#FABF2C"}
            sub={stats.avgGasGwei <= 5 ? "Low congestion" : stats.avgGasGwei > 50 ? "High congestion" : "Moderate"} />
          <Card label="DeFi TVL"         value={stats.tvlUsd > 0 ? `$${(stats.tvlUsd / 1e9).toFixed(1)}B` : "-"} sub="DefiLlama" color="#FABF2C" />
          <Card label="% ETH Staked"     value={`${((stats.totalStaked / 120_000_000) * 100).toFixed(1)}%`} sub="of ~120M supply" color="#888" />
          <Card label="ETH Burned"       value="4.4M+ ETH" sub="since EIP-1559" color="#ff4757" />
        </div>
      ) : (
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
          <p className="text-[#555] font-mono text-xs uppercase">Network stats temporarily unavailable - API rate limited</p>
        </div>
      )}
      <OnchainAreaChart title="Ethereum DeFi TVL (90D)"
        subtitle="Source: DefiLlama - total value locked in Ethereum-native protocols"
        data={tvlHistory} dataKey="tvl" color="#3b82f6"
        yFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} height={220} />
    </div>
  );
}

export default function EthereumOnChainPage() {
  return <main><Suspense fallback={<ChartSkeleton />}><EthData /></Suspense></main>;
}