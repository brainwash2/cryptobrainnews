// src/app/data/defi/protocol-treasury/page.tsx
import React, { Suspense }            from "react";
import { DataHeader }                 from "../../_components/DataHeader";
import { ChartSkeleton }              from "../../_components/ChartSkeleton";
import { DefiTable, fmtUsd }         from "../_components/DefiTable";
import { getTopProtocolsByTvl, getProtocolFees } from "@/lib/defi-data";
import TreasuryBarClient, { type TreasuryBarRow } from "./TreasuryBarClient";

export const metadata = {
  title: "Protocol Treasury Tracker | CryptoBrainNews",
  description: "DeFi protocol treasury buffer tracker — estimated reserves versus TVL, ranked by financial resilience.",
};
export const revalidate = 3600;

// ── Types ─────────────────────────────────────────────────────────────────────
type StrengthTier = "Fortress" | "Strong" | "Moderate" | "Low";

interface TreasuryRow {
  name:        string;
  category:    string;
  tvl:         number;
  estTreasury: number;  // 30d fees × 12 — annualised proxy
  ratio:       number;  // (estTreasury / tvl) × 100
  tier:        StrengthTier;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function strengthTier(ratio: number): StrengthTier {
  if (ratio > 100) return "Fortress";
  if (ratio >= 50) return "Strong";
  if (ratio >= 20) return "Moderate";
  return "Low";
}

function tierColor(tier: StrengthTier): string {
  if (tier === "Fortress") return "#00d672";
  if (tier === "Strong")   return "#4ade80";
  if (tier === "Moderate") return "#FABF2C";
  return "#888";
}

function tierBorder(tier: StrengthTier): string {
  if (tier === "Fortress") return "rgba(0,214,114,0.35)";
  if (tier === "Strong")   return "rgba(74,222,128,0.35)";
  if (tier === "Moderate") return "rgba(250,191,44,0.35)";
  return "rgba(136,136,136,0.25)";
}

function fmtRatio(ratio: number): string {
  return ratio >= 1 ? `${ratio.toFixed(1)}%` : `${ratio.toFixed(3)}%`;
}

// ── Page data ─────────────────────────────────────────────────────────────────
async function ProtocolTreasuryData() {
  const [tvlProtocols, fees] = await Promise.all([
    getTopProtocolsByTvl(300),
    getProtocolFees(100),
  ]);

  // Build 30d-fee lookup (lowercase name → total30d fees)
  const feesMap = new Map<string, number>(
    fees.map((f) => [f.name.toLowerCase(), f.total30d ?? 0]),
  );

  // Build treasury rows
  const treasuryRows: TreasuryRow[] = tvlProtocols
    .map((p) => {
      const fees30d    = feesMap.get(p.name.toLowerCase()) ?? 0;
      const estTreasury = fees30d * 12;            // annualised 30d proxy
      const ratio      = p.tvl > 0 && estTreasury > 0
        ? (estTreasury / p.tvl) * 100
        : 0;
      return {
        name:        p.name,
        category:    p.category,
        tvl:         p.tvl,
        estTreasury,
        ratio,
        tier:        strengthTier(ratio),
      };
    })
    .filter((r) => r.tvl > 0 && r.estTreasury > 0)
    .sort((a, b) => b.ratio - a.ratio);

  // ── KPI derivations ────────────────────────────────────────────────────────
  const topProtocol      = treasuryRows[0] ?? null;
  const avgRatio         = treasuryRows.length
    ? treasuryRows.reduce((s, r) => s + r.ratio, 0) / treasuryRows.length
    : 0;
  const strongBuffer     = treasuryRows.filter((r) => r.ratio >= 50);
  const totalEstTreasury = treasuryRows.reduce((s, r) => s + r.estTreasury, 0);

  const isLive = treasuryRows.length > 0;

  // Chart-serialisable rows (client component)
  const barRows: TreasuryBarRow[] = treasuryRows.slice(0, 10).map((r) => ({
    name:  r.name,
    ratio: r.ratio,
    tier:  r.tier,
  }));

  // DefiTable-compatible rows
  const tableRows = treasuryRows.map((r) => ({ ...r })) as Record<string, unknown>[];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Protocol Treasury Tracker"
        description="Estimated on-chain treasury buffer versus TVL — a financial resilience indicator derived from DefiLlama fee data."
      />

      {/* Live badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          isLive
            ? "border-[#00d672]/40 text-[#00d672]"
            : "border-[#FABF2C]/40 text-[#FABF2C]"
        }`}>
          {isLive ? "● Live — DefiLlama TVL + Fees" : "◌ No data"}
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          Free API — no key required · Cached 1h · Est. Treasury = 30d Fees × 12
        </span>
      </div>

      {/* ── 4-KPI strip ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Strongest Buffer Protocol */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Strongest Buffer
          </p>
          {topProtocol ? (
            <>
              <p
                className="text-2xl font-black tabular-nums"
                style={{ color: tierColor(topProtocol.tier) }}
              >
                {fmtRatio(topProtocol.ratio)}
              </p>
              <p className="text-[10px] font-mono text-[#555] mt-1">
                {topProtocol.name}
              </p>
            </>
          ) : (
            <p className="text-2xl font-black text-[#555]">—</p>
          )}
        </div>

        {/* Average Treasury-to-TVL Ratio */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Avg Buffer Ratio
          </p>
          <p className="text-2xl font-black tabular-nums text-[#FABF2C]">
            {isLive ? fmtRatio(avgRatio) : "—"}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            across {treasuryRows.length} matched protocols
          </p>
        </div>

        {/* Protocols with ≥50% Buffer */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Strong Buffer (≥50%)
          </p>
          <p className="text-2xl font-black tabular-nums text-[#4ade80]">
            {strongBuffer.length}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            Fortress + Strong tier protocols
          </p>
        </div>

        {/* Total Estimated Treasury Value */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Total Est. Treasury
          </p>
          <p className="text-2xl font-black tabular-nums text-[#00d672]">
            {isLive ? fmtUsd(totalEstTreasury) : "—"}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            combined annualised fee proxy
          </p>
        </div>
      </div>

      {/* ── Horizontal bar chart (top 10) ─────────────────────────────────────── */}
      {barRows.length > 0 && <TreasuryBarClient data={barRows} />}

      {/* ── Ranked treasury table ──────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#00d672] rounded-full" />
          Treasury Buffer Leaderboard
          <span className="text-[10px] font-mono text-[#555] normal-case tracking-normal">
            Sorted by Buffer Ratio desc
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
              key: "estTreasury",
              label: "Est. Treasury",
              align: "right" as const,
              render: (v) => (
                <span className="font-mono tabular-nums text-[#FABF2C]">{fmtUsd(v)}</span>
              ),
            },
            {
              key: "ratio",
              label: "Buffer Ratio",
              align: "right" as const,
              render: (v) => {
                const ratio = v as number;
                const tier  = strengthTier(ratio);
                return (
                  <span
                    className="font-mono font-black tabular-nums"
                    style={{ color: tierColor(tier) }}
                  >
                    {fmtRatio(ratio)}
                  </span>
                );
              },
            },
            {
              key: "tier",
              label: "Strength Tier",
              align: "right" as const,
              render: (v) => {
                const tier = v as StrengthTier;
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
          emptyMessage="Awaiting TVL + fee data from DefiLlama."
          source="Source: DefiLlama TVL + Fees APIs · Est. Treasury = 30d Fees × 12 (annualised proxy) · Joined by protocol name · Cached 1 hour"
        />
      </div>

      {/* Strength tier key */}
      <div className="flex gap-5 flex-wrap">
        {([
          { tier: "Fortress" as StrengthTier, label: ">100% — exceptional reserve depth"         },
          { tier: "Strong"   as StrengthTier, label: "50–100% — resilient against drawdowns"     },
          { tier: "Moderate" as StrengthTier, label: "20–50% — adequate but watch TVL closely"   },
          { tier: "Low"      as StrengthTier, label: "<20% — limited treasury buffer"            },
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
        Est. Treasury = 30d Fees × 12 (annualised proxy only) · Not financial advice · DefiLlama data · Cached 1h
      </p>
    </div>
  );
}

export default function ProtocolTreasuryPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <ProtocolTreasuryData />
      </Suspense>
    </main>
  );
}
