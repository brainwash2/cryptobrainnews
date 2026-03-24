import React, { Suspense }              from "react";
import { DataHeader }                   from "../../_components/DataHeader";
import { ChartSkeleton }                from "../../_components/ChartSkeleton";
import { getChainTvlHistory }           from "@/lib/onchain-data";
import OnchainAreaChart                 from "../_components/OnchainAreaChart";
import { getCoinPrice }                 from "@/lib/api";

export const metadata = {
  title: "Avalanche On-Chain | CryptoBrainNews",
  description: "Avalanche C-Chain DeFi TVL and activity metrics.",
};
export const revalidate = 3600;

async function AvalancheData() {
  const [avaxPrice, tvlHistory] = await Promise.all([
    getCoinPrice("avalanche-2").catch(() => 0),
    getChainTvlHistory("Avalanche", 90).catch(() => []),
  ]);
  const latestTvl = tvlHistory[tvlHistory.length - 1]?.tvl ?? 0;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Avalanche On-Chain"
        description="Avalanche C-Chain DeFi TVL and activity metrics."
      />

      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - CoinGecko + DefiLlama
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "AVAX Price",  value: avaxPrice > 0 ? `$${avaxPrice.toFixed(2)}` : "-", color: "#e84142" },
          { label: "DeFi TVL",    value: latestTvl > 0 ? `$${(latestTvl / 1e9).toFixed(2)}B` : "-", color: "#e84142" },
          { label: "Chain",       value: "Avalanche",  color: "#888", sub: "C-Chain (EVM)" },
          { label: "Source",      value: "DefiLlama",  color: "#888", sub: "Free API" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {"sub" in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <OnchainAreaChart
        title="Avalanche DeFi TVL (90D)"
        subtitle="Source: DefiLlama - C-Chain protocols"
        data={tvlHistory}
        dataKey="tvl"
        color="#e84142"
        yFormatter={(v) => `$${(v / 1e9).toFixed(2)}B`}
        height={250}
      />

      <div className="border border-dashed border-[#1a1a1a] p-6 text-center">
        <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
          C-Chain active addresses, TPS, and subnet metrics - no free public API available
        </p>
      </div>
    </div>
  );
}

export default function AvalanchePage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <AvalancheData />
      </Suspense>
    </main>
  );
}
