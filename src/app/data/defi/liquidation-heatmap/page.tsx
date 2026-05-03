// src/app/data/defi/liquidation-heatmap/page.tsx
import React, { Suspense }              from "react";
import { DataHeader }                   from "../../_components/DataHeader";
import { ChartSkeleton }                from "../../_components/ChartSkeleton";
import { DefiTable, fmtUsd }           from "../_components/DefiTable";
import { getProtocolFees, getTopProtocolsByTvl } from "@/lib/defi-data";
import LiquidationBarClient, { type BarRow } from "./LiquidationBarClient";

export const metadata = {
  title: "DeFi Liquidation Heatmap | CryptoBrainNews",
  description: "DeFi liquidation pressure heatmap — protocols ranked by fee-to-TVL drawdown risk score from DefiLlama.",
};
export const revalidate = 3600;

// ── Types ─────────────────────────────────────────────────────────────────────
type RiskTier = "Critical" | "High" | "Moderate" | "Low";

interface PressureRow {
  name:     string;
  category: string;
  tvl:      number;
  fees24h:  number;
  score:    number;   // (fees24h / tvl) × 100
  tier:     RiskTier;
  chains:   string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pressureTier(score: number): RiskTier {
  if (score > 10) return "Critical";
  if (score >= 5) return "High";
  if (score >= 2) return "Moderate";
  return "Low";
}

function tierColor(tier: RiskTier): string {
  if (tier === "Critical") return "#ff4d4f";
  if (tier === "High")     return "#f97316";
  if (tier === "Moderate") return "#FABF2C";
  return "#00d672";
}

function tierBorder(tier: RiskTier): string {
  if (tier === "Critical") return "rgba(255,77,79,0.35)";
  if (tier === "High")     return "rgba(249,115,22,0.35)";
  if (tier === "Moderate") return "rgba(250,191,44,0.35)";
  return "rgba(0,214,114,0.25)";
}

function fmtScore(score: number): string {
  return score >= 1 ? `${score.toFixed(2)}%` : `${score.toFixed(4)}%`;
}

// ── Page data ─────────────────────────────────────────────────────────────────
async function LiquidationHeatmapData() {
  const [fees, tvlProtocols] = await Promise.all([
    getProtocolFees(100),
    getTopProtocolsByTvl(500),
  ]);

  // Case-insensitive TVL lookup
  const tvlMap = new Map<string, number>(
    tvlProtocols.map((p) => [p.name.toLowerCase(), p.tvl]),
  );

  // Build pressure rows — join, filter, compute, sort
  const pressureRows: PressureRow[] = fees
    .map((f) => {
      const tvl    = tvlMap.get(f.name.toLowerCase()) ?? 0;
      const fees24h = f.total24h ?? 0;
      const score  = tvl > 0 && fees24h > 0 ? (fees24h / tvl) * 100 : 0;
      return {
        name:     f.name,
        category: f.category,
        tvl,
        fees24h,
        score,
        tier:     pressureTier(score),
        chains:   f.chains,
      };
    })
    .filter((r) => r.tvl > 0 && r.fees24h > 0)
    .sort((a, b) => b.score - a.score);

  // ── KPI derivations ──────────────────────────────────────────────────────
  const topProtocol     = pressureRows[0] ?? null;
  const underStress     = pressureRows.filter((r) => r.score > 5);
  const totalFeesAtRisk = underStress.reduce((s, r) => s + r.fees24h, 0);
  const avgScore        = pressureRows.length
    ? pressureRows.reduce((s, r) => s + r.score, 0) / pressureRows.length
    : 0;

  // Chart-safe rows (serialisable to client)
  const barRows: BarRow[] = pressureRows.slice(0, 10).map((r) => ({
    name:  r.name,
    score: r.score,
    tier:  r.tier,
  }));

  // DefiTable-compatible rows
  const tableRows = pressureRows.map((r) => ({ ...r })) as Record<string, unknown>[];

  const isLive = pressureRows.length > 0;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="DeFi Liquidation Heatmap"
        description="Protocol liquidation pressure ranked by fee-to-TVL drawdown risk — a composite stress indicator from DefiLlama data."
      />

      {/* Live badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          isLive
            ? "border-[#ff4d4f]/40 text-[#ff4d4f]"
            : "border-[#FABF2C]/40 text-[#FABF2C]"
        }`}>
          {isLive ? "● Live — DefiLlama Fees + TVL" : "◌ No data"}
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          Free API — no key required · Cached 1h
        </span>
      </div>

      {/* ── 4-KPI strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highest Pressure Protocol */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Highest Pressure
          </p>
          {topProtocol ? (
            <>
              <p
                className="text-2xl font-black tabular-nums"
                style={{ color: tierColor(topProtocol.tier) }}
              >
                {fmtScore(topProtocol.score)}
              </p>
              <p className="text-[10px] font-mono text-[#555] mt-1">
                {topProtocol.name}
              </p>
            </>
          ) : (
            <p className="text-2xl font-black text-[#555]">—</p>
          )}
        </div>

        {/* Protocols Under Stress (score > 5%) */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Under Stress (&gt;5%)
          </p>
          <p className="text-2xl font-black tabular-nums text-[#f97316]">
            {underStress.length}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            protocols with score &gt; 5%
          </p>
        </div>

        {/* Total Fees at Risk */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Fees at Risk (24h)
          </p>
          <p className="text-2xl font-black tabular-nums text-[#ff4d4f]">
            {isLive ? fmtUsd(totalFeesAtRisk) : "—"}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            from high-pressure protocols
          </p>
        </div>

        {/* Average Pressure Score */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Avg Pressure Score
          </p>
          <p className="text-2xl font-black tabular-nums text-[#888]">
            {isLive ? fmtScore(avgScore) : "—"}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            across {pressureRows.length} matched protocols
          </p>
        </div>
      </div>

      {/* ── Horizontal bar chart (top 10) ───────────────────────────────────── */}
      {barRows.length > 0 && <LiquidationBarClient data={barRows} />}

      {/* ── Ranked pressure table ───────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#ff4d4f] rounded-full animate-pulse" />
          Liquidation Pressure Leaderboard
          <span className="text-[10px] font-mono text-[#555] normal-case tracking-normal">
            Sorted by Pressure Score desc
          </span>
        </h3>

        <DefiTable
          columns={[
            {
              key: "name",
              label: "Protocol",
              render: (v) => (
                <span className="font-bold text-white">{String(v)}</span>
              ),
            },
            {
              key: "category",
              label: "Category",
              render: (v) => (
                <span className="text-[#888] font-mono text-[10px]">{String(v)}</span>
              ),
            },
            {
              key: "tvl",
              label: "TVL",
              align: "right" as const,
              render: (v) => (
                <span className="font-mono tabular-nums text-[#3b82f6]">{fmtUsd(v)}</span>
              ),
            },
            {
              key: "fees24h",
              label: "24h Fees",
              align: "right" as const,
              render: (v) => (
                <span className="font-mono tabular-nums text-[#FABF2C]">{fmtUsd(v)}</span>
              ),
            },
            {
              key: "score",
              label: "Pressure Score",
              align: "right" as const,
              render: (v) => {
                const score = v as number;
                const tier  = pressureTier(score);
                return (
                  <span
                    className="font-mono font-black tabular-nums"
                    style={{ color: tierColor(tier) }}
                  >
                    {fmtScore(score)}
                  </span>
                );
              },
            },
            {
              key: "tier",
              label: "Risk Tier",
              align: "right" as const,
              render: (v) => {
                const tier = v as RiskTier;
                return (
                  <span
                    className="font-mono font-black text-[10px] px-2 py-0.5 uppercase tracking-widest whitespace-nowrap"
                    style={{
                      color:  tierColor(tier),
                      border: `1px solid ${tierBorder(tier)}`,
                    }}
                  >
                    {tier}
                  </span>
                );
              },
            },
          ]}
          data={tableRows}
          emptyMessage="Awaiting fee + TVL data from DefiLlama."
          source="Source: DefiLlama fees API + TVL API · Joined by protocol name · Cached 1 hour · Pressure Score = (24h Fees / TVL) × 100"
        />
      </div>

      {/* Risk tier key */}
      <div className="flex gap-5 flex-wrap">
        {([
          { tier: "Critical" as RiskTier, label: ">10% — extreme economic stress"     },
          { tier: "High"     as RiskTier, label: "5–10% — elevated drawdown risk"     },
          { tier: "Moderate" as RiskTier, label: "2–5% — watch closely"               },
          { tier: "Low"      as RiskTier, label: "<2% — normal operating range"       },
        ]).map(({ tier, label }) => (
          <div key={tier} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: tierColor(tier) }} />
            <span className="text-[9px] font-mono text-[#555]">
              {tier} — {label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#333] font-mono text-right">
        Pressure Score = (24h Fees / TVL) × 100 · Not financial advice · DefiLlama data · Cached 1h
      </p>
    </div>
  );
}

export default function LiquidationHeatmapPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <LiquidationHeatmapData />
      </Suspense>
    </main>
  );
}
