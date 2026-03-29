import React, { Suspense } from "react";
import { DataHeader }    from "../../_components/DataHeader";
import { ChartSkeleton } from "../../_components/ChartSkeleton";
import OnchainAreaChart  from "../_components/OnchainAreaChart";

export const metadata = { title: "Aptos On-Chain | CryptoBrainNews" };
export const revalidate = 3600;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ft(url: string, opts?: any): Promise<Response | null> {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), 6_000);
  try { return await fetch(url, { signal: ac.signal, cache: "no-store", ...opts }); }
  catch { return null; }
  finally { clearTimeout(id); }
}

async function AptosData() {
  const [priceJ, tvlJ] = await Promise.allSettled([
    ft("https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd").then((r) => r?.ok ? r.json() : null),
    ft("https://api.llama.fi/v2/historicalChainTvl/Aptos").then((r) => r?.ok ? r.json() : null),
  ]);

  const aptPrice   = priceJ.status === "fulfilled" ? (priceJ.value as any)?.aptos?.usd as number ?? 0 : 0;
  const tvlHistory = tvlJ.status === "fulfilled"   ? (tvlJ.value as Array<{date:number;tvl:number}>) ?? [] : [];

  const latestTvl  = Array.isArray(tvlHistory) && tvlHistory.length ? tvlHistory[tvlHistory.length - 1]?.tvl ?? 0 : 0;
  const tvlChart   = Array.isArray(tvlHistory) ? tvlHistory.slice(-90).map((p) => ({
    date: new Date(p.date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tvl:  p.tvl,
  })) : [];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader title="Aptos On-Chain" description="Aptos network DeFi TVL and on-chain activity metrics." />
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - CoinGecko + DefiLlama
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "APT Price", value: aptPrice > 0 ? `$${aptPrice.toFixed(2)}` : "-", color: "#00bfad" as const, sub: "CoinGecko" },
          { label: "DeFi TVL",  value: latestTvl >= 1e9 ? `$${(latestTvl/1e9).toFixed(2)}B` : latestTvl > 0 ? `$${(latestTvl/1e6).toFixed(0)}M` : "-", color: "#00bfad" as const, sub: "DefiLlama" },
          { label: "Consensus", value: "AptosBFT", color: "#888" as const, sub: "Block-STM parallel exec" },
          { label: "Source",    value: "DefiLlama", color: "#888" as const, sub: "Free API" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      {tvlChart.length > 0 ? (
        <OnchainAreaChart title="Aptos DeFi TVL (90D)" subtitle="Source: DefiLlama"
          data={tvlChart} dataKey="tvl" color="#00bfad"
          yFormatter={(v) => v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : `$${(v/1e6).toFixed(0)}M`}
          height={250} />
      ) : (
        <div className="border border-dashed border-[#1a1a1a] p-6 text-center">
          <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">TVL chart loading...</p>
        </div>
      )}
    </div>
  );
}

export default function AptosPage() {
  return <main><Suspense fallback={<ChartSkeleton />}><AptosData /></Suspense></main>;
}
