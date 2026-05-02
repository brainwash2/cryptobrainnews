import React, { Suspense }              from "react";
import { DataHeader }                   from "../../_components/DataHeader";
import { ChartSkeleton }                from "../../_components/ChartSkeleton";
import { DefiTable, fmtUsd, PctBadge } from "../_components/DefiTable";
import {
  getTopProtocolsByTvl,
  getTvlByCategory,
  getDefiTotalFees24h,
} from "@/lib/defi-data";
import { cached }             from "@/lib/cache";
import type { ProtocolRow } from "@/lib/defi-data";
import DeFiTvlClient           from "./_components/DeFiTvlClient";
import DefiCategoryPieChart    from "./_components/DefiCategoryPieChart";

export const metadata = {
  title: "DeFi TVL Rankings | CryptoBrainNews",
  description: "Total value locked by protocol and category across all DeFi - live from DefiLlama.",
};
export const revalidate = 3600;

// -- Types exported for client component ------------------------------------

export interface TvlHistoryPoint {
  date:  string;  // "YYYY-MM-DD"
  tvl:   number;
}

// -- Unit 5 (Batch 8): DeFi TVL by Chain Leaderboard -------------------------

interface ChainTvlRow {
  name:       string;
  tvl:        number;
  change_1d:  number | null;
  change_7d:  number | null;
  protocols:  number | null;
  tokenSymbol?: string;
}

async function fetchChainTvlLeaderboard(): Promise<ChainTvlRow[]> {
  return cached("defi:chain:tvl:leaderboard:v1", async () => {
    try {
      const res = await fetch("https://api.llama.fi/v2/chains", {
        next: { revalidate: 3600 },
      });
      if (!res.ok) return [];
      const data = await res.json() as Array<{
        name?: string;
        tvl?: number;
        change_1d?: number;
        change_7d?: number;
        protocols?: number;
        tokenSymbol?: string;
      }>;
      return data
        .filter((c) => (c.tvl ?? 0) > 0 && c.name)
        .sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0))
        .slice(0, 10)
        .map((c) => ({
          name:       c.name ?? "",
          tvl:        c.tvl ?? 0,
          change_1d:  c.change_1d ?? null,
          change_7d:  c.change_7d ?? null,
          protocols:  c.protocols ?? null,
          tokenSymbol: c.tokenSymbol,
        }));
    } catch {
      return [];
    }
  }, 3600);
}

// -- Fetch total DeFi TVL history -------------------------------------------
// DefiLlama endpoint with no chain param returns total across all chains.

async function getTotalDefiTvlHistory(): Promise<TvlHistoryPoint[]> {
  try {
    const res = await fetch("https://api.llama.fi/v2/historicalChainTvl", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json() as Array<{ date: number; tvl: number }>;
    if (!Array.isArray(data)) return [];
    return data.slice(-365).map((d) => ({
      date: new Date(d.date * 1000).toISOString().slice(0, 10),
      tvl:  d.tvl,
    }));
  } catch {
    return [];
  }
}

// -- Server data component ---------------------------------------------------

async function TvlData() {
  const [protocols, categories, totalHistory, fees24h, chainLeaderboard] = await Promise.all([
    getTopProtocolsByTvl(60),
    getTvlByCategory(),
    getTotalDefiTvlHistory(),
    getDefiTotalFees24h().catch(() => 0),
    fetchChainTvlLeaderboard(),
  ]);

  const totalTvl       = protocols.reduce((s, p) => s + p.tvl, 0);
  const totalProtocols = protocols.length;
  const top1           = protocols[0] as ProtocolRow | undefined;

  const rows = protocols.map((p) => ({
    name:       p.name,
    category:   p.category,
    tvl:        p.tvl,
    change_1d:  p.change_1d,
    change_7d:  p.change_7d,
    chains_fmt: p.chains.slice(0, 3).join(", "),
  })) as Record<string, unknown>[];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="DeFi Value Locked"
        description="Total value locked (TVL) by protocol and category - all blockchains, live from DefiLlama."
      />
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total DeFi TVL",   value: fmtUsd(totalTvl),      color: "#FABF2C" },
          { label: "Protocols Ranked", value: String(totalProtocols), color: "#FABF2C" },
          { label: "Largest Protocol", value: top1?.name ?? "-",      color: "#fff",   sub: fmtUsd(top1?.tvl ?? 0) },
          { label: "DeFi Fees (24h)",  value: fees24h > 0 ? fmtUsd(fees24h) : "—", color: "#00d672", sub: "All protocols" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {"sub" in s && s.sub && (
              <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Protocol Dominance Breakdown — Recharts donut pie */}
      {categories.length > 0 && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white mb-1 border-l-2 border-[#FABF2C] pl-3">
            Protocol Dominance Breakdown
          </h3>
          <p className="text-[10px] font-mono text-[#555] mb-5 ml-5">
            % of total DeFi TVL by category · Top 9 + Others · Source: DefiLlama · Cached 1 h
          </p>
          <DefiCategoryPieChart categories={categories} />
        </div>
      )}

      {/* Interactive charts - client component */}
      <DeFiTvlClient categories={categories} totalHistory={totalHistory} />

      {/* Unit 5 (Batch 8) — TVL by Chain Leaderboard ─────────────────────────── */}
      {chainLeaderboard.length > 0 && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-1">
            TVL by Chain — Top 10 Leaderboard
          </h3>
          <p className="text-[10px] font-mono text-[#555] mb-5 ml-5">
            Total value locked per blockchain · Source: DefiLlama /v2/chains · Cached 1 h
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-[#555] uppercase tracking-widest text-[9px]">
                  <th className="text-left py-2 pr-4 font-black">Rank</th>
                  <th className="text-left py-2 pr-4 font-black">Chain</th>
                  <th className="text-right py-2 pr-4 font-black">TVL</th>
                  <th className="text-right py-2 pr-4 font-black">7D %</th>
                  <th className="text-right py-2 pr-4 font-black">1D %</th>
                  <th className="text-right py-2 font-black">Protocols</th>
                </tr>
              </thead>
              <tbody>
                {chainLeaderboard.map((chain, i) => {
                  const chg7 = chain.change_7d;
                  const chg1 = chain.change_1d;
                  const pct  = (v: number | null) =>
                    v === null ? <span className="text-[#333]">—</span> :
                    <span className={v >= 0 ? "text-[#00d672]" : "text-[#ff4757]"}>
                      {v >= 0 ? "+" : ""}{v.toFixed(2)}%
                    </span>;
                  return (
                    <tr key={chain.name} className="border-t border-[#111] hover:bg-[#0f0f0f] transition-colors">
                      <td className="py-3 pr-4 text-[#555] font-black">#{i + 1}</td>
                      <td className="py-3 pr-4 font-bold text-white">{chain.name}</td>
                      <td className="py-3 pr-4 text-right text-[#FABF2C] font-black tabular-nums">{fmtUsd(chain.tvl)}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{pct(chg7)}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{pct(chg1)}</td>
                      <td className="py-3 text-right text-[#888]">
                        {chain.protocols !== null ? chain.protocols.toLocaleString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Protocol table */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Top Protocols by TVL
        </h3>
        <DefiTable
          columns={[
            {
              key: "name", label: "Protocol",
              render: (v) => <span className="font-bold text-white">{String(v)}</span>,
            },
            {
              key: "category", label: "Category",
              render: (v) => <span className="text-[#888] font-mono">{String(v)}</span>,
            },
            {
              key: "tvl", label: "TVL", align: "right",
              render: (v) => <span className="font-mono font-black text-[#FABF2C] tabular-nums">{fmtUsd(v)}</span>,
            },
            {
              key: "change_1d", label: "24h %", align: "right",
              render: (v) => <PctBadge v={v as number | null} />,
            },
            {
              key: "change_7d", label: "7d %", align: "right",
              render: (v) => <PctBadge v={v as number | null} />,
            },
            {
              key: "chains_fmt", label: "Chains",
              render: (v) => <span className="text-[#555] font-mono">{String(v)}</span>,
            },
          ]}
          data={rows}
          source="Source: DefiLlama - Cached 1 hour"
        />
      </div>
    </div>
  );
}

export default function TvlPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <TvlData />
      </Suspense>
    </main>
  );
}
