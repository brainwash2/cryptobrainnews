import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";

export const metadata = {
  title: "Stablecoins by Chain | CryptoBrainNews",
  description: "Total stablecoin supply by blockchain - USD-pegged assets across Ethereum, Tron, BSC, and more.",
};
export const revalidate = 3600;

// Types
interface ChainSupplyRow {
  chain:      string;
  totalUsd:   number;
  assetCount: number;
  topAssets:  string[];
}

// Fetch + aggregate stablecoin supply by chain from DefiLlama
async function getStablecoinsByChain(): Promise<ChainSupplyRow[]> {
  try {
    const res = await fetch(
      "https://stablecoins.llama.fi/stablecoins?includePrices=true",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];

    const data = await res.json() as {
      peggedAssets?: Array<{
        symbol:           string;
        pegType:          string;
        chainCirculating?: Record<string, { current?: { peggedUSD?: number } }>;
      }>;
    };

    if (!data.peggedAssets) return [];

    // Only USD-pegged assets
    const usdAssets = data.peggedAssets.filter((a) => a.pegType === "peggedUSD");

    // Aggregate per chain
    const chainMap: Record<string, { totalUsd: number; assets: Set<string> }> = {};

    for (const asset of usdAssets) {
      const chains = asset.chainCirculating ?? {};
      for (const [chainName, chainData] of Object.entries(chains)) {
        const amt = chainData?.current?.peggedUSD ?? 0;
        if (amt < 1_000_000) continue; // skip dust
        if (!chainMap[chainName]) {
          chainMap[chainName] = { totalUsd: 0, assets: new Set() };
        }
        chainMap[chainName].totalUsd += amt;
        chainMap[chainName].assets.add(asset.symbol);
      }
    }

    return Object.entries(chainMap)
      .map(([chain, d]) => ({
        chain,
        totalUsd:   d.totalUsd,
        assetCount: d.assets.size,
        topAssets:  [...d.assets].slice(0, 3),
      }))
      .filter((r) => r.totalUsd >= 10_000_000) // show chains with >$10M
      .sort((a, b) => b.totalUsd - a.totalUsd)
      .slice(0, 25);
  } catch {
    return [];
  }
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

// Chain colour hints (best-effort — fallback to gold)
const CHAIN_COLORS: Record<string, string> = {
  Ethereum:  "#627EEA",
  Tron:      "#EF0027",
  BSC:       "#F3BA2F",
  Arbitrum:  "#3b82f6",
  Polygon:   "#8247e5",
  Solana:    "#9945FF",
  Optimism:  "#ef4444",
  Avalanche: "#E84142",
  Base:      "#0052ff",
  Fantom:    "#1969ff",
};

async function ChainsData() {
  const rows = await getStablecoinsByChain().catch(() => []);

  const totalSupply = rows.reduce((s, r) => s + r.totalUsd, 0);
  const topChain    = rows[0];

  return (
    <div className="space-y-8 pb-20">
      <DataHeader
        title="Stablecoins by Chain"
        description="Total USD stablecoin supply by blockchain - aggregated from all USD-pegged assets."
      />

      {/* Source badge */}
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - DefiLlama
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          {rows.length} chains with {">"} $10M supply - refreshed hourly
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Total Cross-Chain
          </p>
          <p className="text-2xl font-black text-[#00d672] tabular-nums">
            {fmtUsd(totalSupply)}
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Largest Chain
          </p>
          <p className="text-2xl font-black text-white">{topChain?.chain ?? "-"}</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            {topChain ? fmtUsd(topChain.totalUsd) : ""}
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Chains Tracked
          </p>
          <p className="text-2xl font-black text-[#888]">{rows.length}</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">with {">"} $10M supply</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Top Chain Share
          </p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">
            {topChain && totalSupply > 0
              ? `${((topChain.totalUsd / totalSupply) * 100).toFixed(1)}%`
              : "-"}
          </p>
        </div>
      </div>

      {/* Supply bar chart */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#00d672] pl-3 mb-6">
          Supply Distribution by Chain
        </h3>
        {rows.length > 0 ? (
          <div className="space-y-2.5">
            {rows.slice(0, 15).map((r) => {
              const pct   = totalSupply > 0 ? (r.totalUsd / totalSupply) * 100 : 0;
              const color = CHAIN_COLORS[r.chain] ?? "#FABF2C";
              return (
                <div key={r.chain} className="flex items-center gap-3">
                  <span className="w-24 text-right text-[10px] font-bold text-white shrink-0 truncate">
                    {r.chain}
                  </span>
                  <div className="flex-1 h-4 bg-[#111]">
                    <div
                      className="h-full"
                      style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.8 }}
                    />
                  </div>
                  <span
                    className="w-20 text-right font-mono text-[10px] tabular-nums shrink-0"
                    style={{ color }}
                  >
                    {fmtUsd(r.totalUsd)}
                  </span>
                  <span className="w-10 text-right font-mono text-[10px] text-[#555] shrink-0">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[#555] font-mono text-xs uppercase text-center py-8">
            Syncing chain supply data from DefiLlama...
          </p>
        )}
      </div>

      {/* Ranked table */}
      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#050505]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest w-8">#</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Chain</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Total Supply</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Share</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Assets</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Top Stablecoins</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const pct   = totalSupply > 0 ? (r.totalUsd / totalSupply) * 100 : 0;
              const color = CHAIN_COLORS[r.chain] ?? "#FABF2C";
              return (
                <tr
                  key={r.chain}
                  className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                    i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                  }`}
                >
                  <td className="px-4 py-4 text-[#333] font-mono">{i + 1}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-bold text-white">{r.chain}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-black text-[#00d672] tabular-nums">
                    {fmtUsd(r.totalUsd)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono tabular-nums text-[#888]">
                    {pct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-4 text-right font-mono tabular-nums text-[#555]">
                    {r.assetCount}
                  </td>
                  <td className="px-4 py-4 text-[#555] font-mono text-[10px]">
                    {r.topAssets.join(", ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
              Syncing chain supply data from DefiLlama...
            </p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-[#333] font-mono text-right">
        Source: DefiLlama stablecoins.llama.fi - USD-pegged only - Chains with {">"} $10M supply - Cached 1 hour
      </p>
    </div>
  );
}

export default function StablecoinsChainsPage() {
  return (
    <main className="pb-20">
      <Suspense
        fallback={<div className="animate-pulse h-64 bg-[#0a0a0a] border border-[#1a1a1a]" />}
      >
        <ChainsData />
      </Suspense>
    </main>
  );
}
