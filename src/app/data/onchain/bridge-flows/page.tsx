// src/app/data/onchain/bridge-flows/page.tsx
import React, { Suspense }            from "react";
import { DataHeader }                 from "../../_components/DataHeader";
import { ChartSkeleton }              from "../../_components/ChartSkeleton";
import { DefiTable, fmtUsd }         from "../../defi/_components/DefiTable";
import { getBridgeFlows }            from "@/lib/defi-data";
import BridgeBarClient, { type BridgeBarRow } from "./BridgeBarClient";

export const metadata = {
  title: "Bridge Flows | CryptoBrainNews",
  description: "Cross-chain bridge flow tracker — net inflow/outflow by bridge protocol, derived from DefiLlama TVL data.",
};
export const revalidate = 3600;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtFlow(n: number): string {
  const abs = Math.abs(n);
  const sign = n >= 0 ? "+" : "-";
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

// ── Page data ─────────────────────────────────────────────────────────────────
async function BridgeFlowsData() {
  const bridges = await getBridgeFlows();

  const isLive = bridges.length > 0;

  // KPI derivations
  const total24hVol     = bridges.reduce((s, b) => s + b.volume24h, 0);
  const totalNetFlow24h = bridges.reduce((s, b) => s + b.netFlow24h, 0);
  const activeBridges   = bridges.length;

  // Top destination chain: chain with the highest sum of positive netFlow24h
  const chainFlowMap = new Map<string, number>();
  for (const b of bridges) {
    chainFlowMap.set(b.chain, (chainFlowMap.get(b.chain) ?? 0) + b.netFlow24h);
  }
  const topDestChain = [...chainFlowMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .find(([, flow]) => flow > 0)?.[0] ?? "—";

  // Serialisable bar chart rows (top 10 by volume)
  const barRows: BridgeBarRow[] = bridges.slice(0, 10).map((b) => ({
    name:      b.name,
    volume24h: b.volume24h,
    positive:  b.netFlow24h >= 0,
  }));

  // DefiTable-compatible rows
  const tableRows = bridges.map((b) => ({ ...b })) as Record<string, unknown>[];

  const netFlowColor = totalNetFlow24h >= 0 ? "#00d672" : "#ff4d4f";

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Bridge Flows"
        description="Cross-chain bridge net inflow/outflow — ranked by 24h volume, derived from DefiLlama bridge protocol TVL changes."
      />

      {/* Live badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          isLive
            ? "border-[#00d672]/40 text-[#00d672]"
            : "border-[#FABF2C]/40 text-[#FABF2C]"
        }`}>
          {isLive ? "● Live — DefiLlama Bridge Protocols" : "◌ No data"}
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          Free API · Volume = |TVL × daily change| proxy · Cached 1h
        </span>
      </div>

      {/* ── 4-KPI strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bridge Volume 24h */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Total Bridge Volume (24h)
          </p>
          <p className="text-2xl font-black tabular-nums text-[#FABF2C]">
            {isLive ? fmtUsd(total24hVol) : "—"}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            across {activeBridges} bridge protocols
          </p>
        </div>

        {/* Net Inflow 24h */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Net Inflow (24h)
          </p>
          <p className="text-2xl font-black tabular-nums" style={{ color: netFlowColor }}>
            {isLive ? fmtFlow(totalNetFlow24h) : "—"}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            {totalNetFlow24h >= 0 ? "net capital inflow" : "net capital outflow"}
          </p>
        </div>

        {/* Top Destination Chain */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Top Destination Chain
          </p>
          <p className="text-2xl font-black text-white truncate">
            {isLive ? topDestChain : "—"}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            highest net inflow (24h)
          </p>
        </div>

        {/* Active Bridges */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Active Bridges
          </p>
          <p className="text-2xl font-black tabular-nums text-[#888]">
            {activeBridges}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            tracked by DefiLlama
          </p>
        </div>
      </div>

      {/* ── Horizontal bar chart (top 10) ───────────────────────────────────── */}
      {barRows.length > 0 && <BridgeBarClient data={barRows} />}

      {/* ── Ranked bridge table ──────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Bridge Leaderboard
          <span className="text-[10px] font-mono text-[#555] normal-case tracking-normal">
            Sorted by 24h Volume desc
          </span>
        </h3>

        <DefiTable
          columns={[
            {
              key: "name",
              label: "Bridge",
              render: (v) => (
                <span className="font-bold text-white">{String(v)}</span>
              ),
            },
            {
              key: "chain",
              label: "Chain",
              render: (v) => (
                <span className="font-mono text-[10px] text-[#888] px-2 py-0.5 border border-[#1a1a1a]">
                  {String(v)}
                </span>
              ),
            },
            {
              key: "volume24h",
              label: "24h Vol",
              align: "right" as const,
              render: (v) => (
                <span className="font-mono font-black tabular-nums text-[#FABF2C]">
                  {fmtUsd(v)}
                </span>
              ),
            },
            {
              key: "volume7d",
              label: "7d Vol",
              align: "right" as const,
              render: (v) => (
                <span className="font-mono tabular-nums text-[#555]">
                  {fmtUsd(v)}
                </span>
              ),
            },
            {
              key: "netFlow24h",
              label: "Net Flow 24h",
              align: "right" as const,
              render: (v) => {
                const n = v as number;
                return (
                  <span
                    className="font-mono font-black tabular-nums"
                    style={{ color: n >= 0 ? "#00d672" : "#ff4d4f" }}
                  >
                    {fmtFlow(n)}
                  </span>
                );
              },
            },
            {
              key: "netFlow7d",
              label: "Net Flow 7d",
              align: "right" as const,
              render: (v) => {
                const n = v as number;
                return (
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: n >= 0 ? "#00d672" : "#ff4d4f" }}
                  >
                    {fmtFlow(n)}
                  </span>
                );
              },
            },
            {
              key: "netFlow24h",
              label: "Direction",
              align: "right" as const,
              render: (v) => {
                const n = v as number;
                const inflow = n >= 0;
                return (
                  <span
                    className="font-mono font-black text-[10px] px-2 py-0.5 uppercase tracking-widest whitespace-nowrap"
                    style={{
                      color:  inflow ? "#00d672" : "#ff4d4f",
                      border: `1px solid ${inflow ? "rgba(0,214,114,0.35)" : "rgba(255,77,79,0.35)"}`,
                    }}
                  >
                    {inflow ? "▲ Inflow" : "▼ Outflow"}
                  </span>
                );
              },
            },
          ]}
          data={tableRows}
          emptyMessage="No bridge protocol data available from DefiLlama."
          source="Source: DefiLlama protocols API · category = Bridge · Volume = |TVL × daily change| · Net Flow = TVL × daily change · Cached 1 hour"
        />
      </div>

      <p className="text-[10px] text-[#333] font-mono text-right">
        Bridge flow data is a TVL-change proxy — not direct on-chain transfer volume · Not financial advice · Cached 1h
      </p>
    </div>
  );
}

export default function BridgeFlowsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <BridgeFlowsData />
      </Suspense>
    </main>
  );
}
