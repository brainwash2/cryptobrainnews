import React, { Suspense } from "react";
import { DataHeader }    from "../../_components/DataHeader";
import { ChartSkeleton } from "../../_components/ChartSkeleton";
import { DataTable }     from "../../_components/DataTable";
import { getCoinCategories } from "@/lib/market-data";

export const metadata = {
  title: "Crypto Sector Overview | CryptoBrainNews",
  description: "Market cap and performance by sector - DeFi, Layer 2, AI, Memecoins, Gaming, and more.",
};
export const revalidate = 3600;

function toRow(c: {
  name: string;
  market_cap: number | null;
  market_cap_change_24h: number | null;
  volume_24h: number | null;
  top_3_coins: string[];
}): Record<string, unknown> {
  return {
    name:              c.name,
    market_cap:        c.market_cap,
    market_cap_change: c.market_cap_change_24h,
    volume_24h:        c.volume_24h,
    top_coins:         c.top_3_coins?.slice(0, 3) ?? [],
  };
}

async function IndicesData() {
  const categories = await getCoinCategories(40).catch(() => []);
  const rows = categories.map(toRow);

  const fmtUsd = (v: unknown): string => {
    const n = Number(v ?? 0);
    if (!n) return "-";
    if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9)  return "$" + (n / 1e9).toFixed(2)  + "B";
    if (n >= 1e6)  return "$" + (n / 1e6).toFixed(2)  + "M";
    return "$" + n.toLocaleString();
  };

  const fmtPct = (v: unknown) => {
    const n = Number(v ?? null);
    if (isNaN(n)) return <span className="text-[#555]">-</span>;
    const pos = n >= 0;
    return (
      <span className={"font-mono font-bold tabular-nums " + (pos ? "text-[#00d672]" : "text-[#ff4757]")}>
        {pos ? "+" : ""}{n.toFixed(2)}%
      </span>
    );
  };

  // Real market cap: use CoinGecko /global data point instead of summing categories
  // (category sum is double-counted since coins can be in multiple categories)
  const categorySumMcap = categories.reduce((s, c) => s + (c.market_cap ?? 0), 0);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Crypto Sector Overview"
        description="Market cap and 24h performance by sector - DeFi, Layer 2, AI, Memecoins, Gaming, and more."
      />

      {/* Source + disclaimer badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - CoinGecko Categories
        </span>
        <span className="border border-[#FABF2C]/30 text-[#FABF2C] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Note: categories overlap - total exceeds real market cap
        </span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Sectors Tracked</p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">{categories.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Sum of Category MCaps
          </p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">{fmtUsd(categorySumMcap)}</p>
          <p className="text-[9px] font-mono text-[#555] mt-1">Double-counted - coins appear in multiple sectors</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Source</p>
          <p className="text-sm font-black text-[#00d672]">CoinGecko Categories</p>
          <p className="text-[9px] font-mono text-[#555] mt-1">Free API - Refreshed hourly</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-4 flex items-start gap-3">
        <span className="text-[#FABF2C] font-mono text-[10px] shrink-0 mt-0.5">NOTE</span>
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          CoinGecko sector categories are not mutually exclusive. A coin like ETH appears in Smart Contract Platform,
          Layer 1, Proof of Stake, and other categories simultaneously. The category market caps shown are the sum
          of all coins in each category - they overlap significantly and the total exceeds the real crypto market cap.
          This data is best used for relative sector comparison (DeFi vs AI vs Memecoins) and 24h directional
          performance, not for absolute market cap analysis.
        </p>
      </div>

      {/* Categories Table */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            {
              key: "name",
              label: "Sector / Index",
              format: (v) => <span className="font-bold text-white">{String(v)}</span>,
            },
            {
              key: "top_coins",
              label: "Top 3",
              format: (v) => {
                const arr = v as string[];
                return (
                  <div className="flex gap-1">
                    {arr.map((url, i) => (
                      <img key={i} src={url} alt="" width={18} height={18} className="rounded-full" />
                    ))}
                  </div>
                );
              },
            },
            { key: "market_cap",        label: "Sector MCap",  format: fmtUsd, align: "right" },
            { key: "market_cap_change", label: "24h Change",   format: fmtPct, align: "right" },
            { key: "volume_24h",        label: "24h Volume",   format: fmtUsd, align: "right" },
          ]}
          data={rows}
          emptyMessage="Syncing sector data..."
        />
      </div>

      {/* GMCI Note */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          <span className="text-[#FABF2C] font-black">About GMCI indices: </span>
          GMCI (GM30, GML1, GML2, GMMEME, etc.) are proprietary indices by Grayscale-backed GMCI.
          Integration with their official index feed is planned for a future phase.
          Current data uses CoinGecko&apos;s sector categories as a free-tier proxy.
        </p>
      </div>
    </div>
  );
}

export default function IndicesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <IndicesData />
      </Suspense>
    </main>
  );
}
