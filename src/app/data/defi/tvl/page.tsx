import React, { Suspense }              from "react";
import { DataHeader }                   from "../../_components/DataHeader";
import { ChartSkeleton }                from "../../_components/ChartSkeleton";
import { DefiTable, fmtUsd, PctBadge } from "../_components/DefiTable";
import {
  getTopProtocolsByTvl,
  getTvlByCategory,
  getDefiTotalFees24h,
} from "@/lib/defi-data";
import type { ProtocolRow } from "@/lib/defi-data";
import DeFiTvlClient from "./_components/DeFiTvlClient";

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
  const [protocols, categories, totalHistory, fees24h] = await Promise.all([
    getTopProtocolsByTvl(60),
    getTvlByCategory(),
    getTotalDefiTvlHistory(),
    getDefiTotalFees24h().catch(() => 0),
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

      {/* Interactive charts - client component */}
      <DeFiTvlClient categories={categories} totalHistory={totalHistory} />

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
