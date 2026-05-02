import React, { Suspense } from "react";
import { getStablecoinsOverview, getStablecoinsByChain, getStablecoinTrendData, getGlobalDexVolume24h } from "@/lib/defi-data";
import { DataHeader }          from "../../_components/DataHeader";
import { ChartSkeleton }       from "../../_components/ChartSkeleton";
import { FreshnessBadge }      from "@/components/common/FreshnessBadge";
import StablecoinUsdClient     from "./_components/StablecoinUsdClient";
import StablecoinTrendChart    from "./_components/StablecoinTrendChart";

export const metadata = {
  title: "USD Stablecoins | CryptoBrainNews",
  description: "Circulating supply, peg deviation, and 24h change for major USD-pegged stablecoins.",
};
export const revalidate = 3600;

async function StablecoinData() {
  const [all, chainRows, trendData, dexVol24h] = await Promise.all([
    getStablecoinsOverview().catch(() => []),
    getStablecoinsByChain().catch(() => []),
    getStablecoinTrendData().catch(() => []),
    getGlobalDexVolume24h().catch(() => 0),
  ]);
  const usd = all.filter((s) => s.pegType === "peggedUSD");

  const totalSupply  = usd.reduce((s, c) => s + c.circulatingUsd, 0);
  const usdt         = usd.find((c) => c.symbol === "USDT");
  const usdcEntry    = usd.find((c) => c.symbol === "USDC");
  const usdtDom      = totalSupply > 0 ? ((usdt?.circulatingUsd ?? 0) / totalSupply) * 100 : 0;
  const usdcDom      = totalSupply > 0 ? ((usdcEntry?.circulatingUsd ?? 0) / totalSupply) * 100 : 0;

  // Unit 5: Stablecoin velocity = daily DEX on-chain volume / total supply
  const velocity     = totalSupply > 0 && dexVol24h > 0 ? (dexVol24h / totalSupply) * 100 : null;

  return (
    <div className="space-y-8 pb-20">
      <DataHeader
        title="USD Stablecoins"
        description="Circulating supply, peg deviation, dominance, and 24h change for USD-pegged stablecoins."
      />

      <div className="flex items-center gap-3">
        <FreshnessBadge ttlSeconds={3600} />
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          {usd.length} USD-pegged assets tracked
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
        {/* Unit 5 — Stablecoin Velocity */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Velocity (Daily)</p>
          <p className="text-2xl font-black tabular-nums" style={{
            color: velocity === null ? '#888' : velocity > 5 ? '#00d672' : velocity > 2 ? '#FABF2C' : '#888'
          }}>
            {velocity !== null ? `${velocity.toFixed(2)}%` : '—'}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            DEX vol ÷ total supply
          </p>
        </div>
      </div>

      {chainRows.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-4">
            Supply by Blockchain
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {chainRows.map((chain) => {
              const pct = totalSupply > 0 ? (chain.totalCirculatingUsd / totalSupply) * 100 : 0;
              return (
                <div key={chain.name} className="bg-[#0a0a0a] border border-[#1a1a1a] p-4">
                  <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-1">{chain.name}</p>
                  <p className="text-lg font-black text-[#00d672] tabular-nums">
                    ${(chain.totalCirculatingUsd / 1e9).toFixed(1)}B
                  </p>
                  <p className="text-[10px] font-mono text-[#555] mt-1">{pct.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {trendData.length > 0 && <StablecoinTrendChart data={trendData} />}

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
