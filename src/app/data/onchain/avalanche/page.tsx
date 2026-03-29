import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import OnchainAreaChart     from "../_components/OnchainAreaChart";

export const metadata = {
  title: "Avalanche On-Chain | CryptoBrainNews",
  description: "Avalanche C-Chain DeFi TVL and activity metrics.",
};
export const revalidate = 3600;

async function ft(url: string, opts?: RequestInit): Promise<Response> {
  const ac = new AbortController();
  const t  = setTimeout(() => ac.abort(), 6000);
  try { return await fetch(url, { ...opts, signal: ac.signal }); }
  finally { clearTimeout(t); }
}

async function AvalancheData() {
  const [priceRes, tvlRes] = await Promise.all([
    ft("https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd",
       { next: { revalidate: 60 } }).catch(() => null),
    ft("https://api.llama.fi/v2/historicalChainTvl/Avalanche",
       { next: { revalidate: 3600 } }).catch(() => null),
  ]);

  const avaxPrice = priceRes?.ok
    ? ((await priceRes.json()) as Record<string, { usd?: number }>)?.["avalanche-2"]?.usd ?? 0
    : 0;

  let tvlHistory: Array<{ date: string; tvl: number }> = [];
  let latestTvl = 0;
  if (tvlRes?.ok) {
    const d = (await tvlRes.json()) as Array<{ date: number; tvl: number }>;
    if (Array.isArray(d)) {
      tvlHistory = d.slice(-90).map((p) => ({
        date: new Date(p.date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        tvl: p.tvl,
      }));
      latestTvl = d[d.length - 1]?.tvl ?? 0;
    }
  }

  return (
    <div className="space-y-10 pb-20">
      <DataHeader title="Avalanche On-Chain"
        description="Avalanche C-Chain DeFi TVL and activity metrics." />
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - CoinGecko + DefiLlama
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "AVAX Price", value: avaxPrice > 0 ? `$${avaxPrice.toFixed(2)}` : "-", color: "#e84142", sub: "CoinGecko" },
          { label: "DeFi TVL",   value: latestTvl > 0 ? `$${(latestTvl / 1e9).toFixed(2)}B` : "-", color: "#e84142", sub: "DefiLlama" },
          { label: "Chain",      value: "Avalanche", color: "#888", sub: "C-Chain (EVM)" },
          { label: "Source",     value: "DefiLlama",  color: "#888", sub: "Free API" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <OnchainAreaChart title="Avalanche DeFi TVL (90D)"
        subtitle="Source: DefiLlama - C-Chain protocols"
        data={tvlHistory} dataKey="tvl" color="#e84142"
        yFormatter={(v) => `$${(v / 1e9).toFixed(2)}B`} height={250} />
    </div>
  );
}

export default function AvalanchePage() {
  return <main><Suspense fallback={<ChartSkeleton />}><AvalancheData /></Suspense></main>;
}