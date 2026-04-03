import React, { Suspense } from "react";
import { DataHeader }    from "../../_components/DataHeader";
import { ChartSkeleton } from "../../_components/ChartSkeleton";

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
    ft("https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd")
      .then((r) => r?.ok ? r.json() : null),
    ft("https://api.llama.fi/v2/historicalChainTvl/Aptos")
      .then((r) => r?.ok ? r.json() : null),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aptPrice  = priceJ.status === "fulfilled" ? (priceJ.value as any)?.aptos?.usd as number ?? 0 : 0;
  const tvlRaw    = tvlJ.status   === "fulfilled" ? (tvlJ.value as Array<{date:number;tvl:number}>) ?? [] : [];
  const latestTvl = Array.isArray(tvlRaw) && tvlRaw.length ? tvlRaw[tvlRaw.length - 1]?.tvl ?? 0 : 0;
  const tvlChart  = Array.isArray(tvlRaw) ? tvlRaw.slice(-90).map((p) => ({
    date: new Date(p.date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tvl: p.tvl,
  })) : [];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader title="Aptos On-Chain" description="Aptos network DeFi TVL and on-chain activity metrics." />
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live — CoinGecko + DefiLlama
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "APT Price", value: aptPrice > 0 ? `$${aptPrice.toFixed(2)}` : "—", color: "#00bfad" as const, sub: "CoinGecko" },
          { label: "DeFi TVL",  value: latestTvl >= 1e9 ? `$${(latestTvl/1e9).toFixed(2)}B` : latestTvl > 0 ? `$${(latestTvl/1e6).toFixed(0)}M` : "—", color: "#00bfad" as const, sub: "DefiLlama" },
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
      {tvlChart.length > 0 && (() => {
        const max = Math.max(...tvlChart.map((x) => x.tvl));
        return (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#00bfad] pl-3 mb-4">
              Aptos DeFi TVL (90D)
            </h3>
            <p className="text-[10px] text-[#555] font-mono pl-3 mb-4">Source: DefiLlama</p>
            <div className="flex items-end gap-[2px] h-24">
              {tvlChart.map((p, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end"
                  title={`$${latestTvl >= 1e9 ? (p.tvl/1e9).toFixed(2)+"B" : (p.tvl/1e6).toFixed(0)+"M"} — ${p.date}`}>
                  <div className="w-full rounded-sm opacity-80"
                    style={{ height: `${Math.max(max > 0 ? (p.tvl/max)*100 : 0, 2)}%`, backgroundColor: "#00bfad" }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] font-mono text-[#333] mt-2">
              <span>{tvlChart[0]?.date}</span>
              <span className="text-[#00bfad]">{latestTvl >= 1e9 ? `$${(latestTvl/1e9).toFixed(2)}B` : `$${(latestTvl/1e6).toFixed(0)}M`}</span>
              <span>{tvlChart[tvlChart.length-1]?.date}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function AptosPage() {
  return <main><Suspense fallback={<ChartSkeleton />}><AptosData /></Suspense></main>;
}