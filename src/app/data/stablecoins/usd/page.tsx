import React, { Suspense } from "react";
import { getStablecoinsOverview } from "@/lib/defi-data";
import { DataHeader }    from "../../_components/DataHeader";
import { ChartSkeleton } from "../../_components/ChartSkeleton";
import StablecoinUsdClient from "./_components/StablecoinUsdClient";

export const metadata = {
  title: "USD Stablecoins | CryptoBrainNews",
  description: "Circulating supply, peg health, and 24h change for major USD-pegged stablecoins - live from DefiLlama.",
};
export const revalidate = 3600;

async function StablecoinData() {
  const all = await getStablecoinsOverview().catch(() => []);

  // Filter to USD-pegged only, already sorted by circulatingUsd desc
  const usd = all.filter((s) => s.pegType === "peggedUSD");

  const totalSupply  = usd.reduce((s, c) => s + c.circulatingUsd, 0);
  const usdt         = usd.find((c) => c.symbol === "USDT");
  const usdcEntry    = usd.find((c) => c.symbol === "USDC");
  const usdtDom      = totalSupply > 0 ? ((usdt?.circulatingUsd ?? 0) / totalSupply) * 100 : 0;
  const usdcDom      = totalSupply > 0 ? ((usdcEntry?.circulatingUsd ?? 0) / totalSupply) * 100 : 0;

  return (
    <div className="space-y-8 pb-20">
      <DataHeader
        title="USD Stablecoins"
        description="Circulating supply, dominance, and peg health for USD-pegged stablecoins - Source: DefiLlama."
      />

      {/* Source badge */}
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - DefiLlama
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          {usd.length} USD-pegged assets tracked
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Total USD Supply</p>
          <p className="text-2xl font-black text-[#00d672] tabular-nums">
            ${(totalSupply / 1e9).toFixed(2)}B
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">USDT Dominance</p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">{usdtDom.toFixed(1)}%</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            ${((usdt?.circulatingUsd ?? 0) / 1e9).toFixed(1)}B circulating
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">USDC Dominance</p>
          <p className="text-2xl font-black text-white tabular-nums">{usdcDom.toFixed(1)}%</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            ${((usdcEntry?.circulatingUsd ?? 0) / 1e9).toFixed(1)}B circulating
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Assets Tracked</p>
          <p className="text-2xl font-black text-[#888] tabular-nums">{usd.length}</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">USD-pegged only</p>
        </div>
      </div>

      {/* Client charts + table */}
      <StablecoinUsdClient stablecoins={usd} totalSupply={totalSupply} />
    </div>
  );
}

export default function StablecoinsUsdPage() {
  return (
    <main className="pb-20">
      <Suspense fallback={<ChartSkeleton />}>
        <StablecoinData />
      </Suspense>
    </main>
  );
}