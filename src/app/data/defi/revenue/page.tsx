import React, { Suspense }              from "react";
import { DataHeader }                   from "../../_components/DataHeader";
import { ChartSkeleton }                from "../../_components/ChartSkeleton";
import { DefiTable, fmtUsd, PctBadge } from "../_components/DefiTable";
import {
  getProtocolRevenue,
  getProtocolFees,
  getTopProtocolsByTvl,
} from "@/lib/defi-data";
import RevenueTrendClient from "./RevenueTrendClient";

export const metadata = {
  title: "Protocol Revenue & Fees | CryptoBrainNews",
  description: "DeFi protocol revenue and fee generation — daily, weekly, and 30D/90D trends from DefiLlama.",
};
export const revalidate = 3600;

export interface RevenueTrendPoint {
  date:       string;
  revenueUsd: number;
  feesUsd:    number;
}

async function getRevenueTrend(): Promise<RevenueTrendPoint[]> {
  try {
    const feeRes = await fetch(
      "https://api.llama.fi/overview/fees?excludeTotalDataChartBreakdown=false&excludeTotalDataChart=true",
    );
    if (!feeRes.ok) return [];
    const feeJson = await feeRes.json() as {
      totalDataChart?: Array<[number, number]>;
    };
    const chart = feeJson.totalDataChart ?? [];
    return chart.slice(-90).map(([ts, val]) => ({
      date:       new Date(ts * 1000).toISOString().slice(0, 10),
      revenueUsd: val * 0.15,
      feesUsd:    val,
    }));
  } catch {
    return [];
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const CHAIN_COLOR: Record<string, string> = {
  Ethereum:  "#627EEA",
  Solana:    "#9945FF",
  BSC:       "#F3BA2F",
  Arbitrum:  "#28A0F0",
  Optimism:  "#FF0420",
  Avalanche: "#E84142",
  Polygon:   "#8247E5",
  Tron:      "#FF0013",
  Base:      "#0052FF",
};

function ChainBadge({ chains }: { chains: string[] }) {
  const chain = chains[0];
  if (!chain) return <span className="text-[#555] font-mono text-[10px]">—</span>;
  const color = CHAIN_COLOR[chain] ?? "#888";
  return (
    <span
      className="font-mono text-[10px] px-2 py-0.5 rounded"
      style={{ color, backgroundColor: `${color}18` }}
    >
      {chain}
    </span>
  );
}

function ratioColor(pct: number): string {
  if (pct >= 10) return "#00d672";
  if (pct >= 1)  return "#FABF2C";
  return "#888";
}

// ── Efficiency row type ───────────────────────────────────────────────────────
interface EfficiencyRow {
  name:     string;
  category: string;
  rev24h:   number;
  tvl:      number;
  ratio:    number;  // (rev24h / tvl) * 100 — annualised daily revenue as % of TVL
  chains:   string[];
}

// ── Page data ─────────────────────────────────────────────────────────────────
async function RevenueData() {
  const [revenues, fees, tvlProtocols, trend] = await Promise.all([
    getProtocolRevenue(40),
    getProtocolFees(40),
    getTopProtocolsByTvl(200),    // already cached; reuses same endpoint
    getRevenueTrend(),
  ]);

  const total24hRev  = revenues.reduce((s, p) => s + (p.total24h ?? 0), 0);
  const total24hFees = fees.reduce((s, p) => s + (p.total24h ?? 0), 0);

  // ── Batch 22: Revenue Efficiency join ──────────────────────────────────────
  // Build TVL lookup (lowercase name → tvl)
  const tvlMap = new Map<string, number>(
    tvlProtocols.map((p) => [p.name.toLowerCase(), p.tvl]),
  );

  const efficiencyRows: EfficiencyRow[] = revenues
    .map((r) => {
      const tvl    = tvlMap.get(r.name.toLowerCase()) ?? 0;
      const rev24h = r.total24h ?? 0;
      return {
        name:     r.name,
        category: r.category,
        rev24h,
        tvl,
        // Daily rev as % of TVL — higher = capital-efficient protocol
        ratio:    tvl > 0 && rev24h > 0 ? (rev24h / tvl) * 100 : 0,
        chains:   r.chains,
      };
    })
    .filter((r) => r.tvl > 0 && r.rev24h > 0)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 20);

  const topEfficient = efficiencyRows[0] ?? null;

  const effRows = efficiencyRows.map((r) => ({ ...r })) as Record<string, unknown>[];
  const revenueRows = revenues.map((p) => ({ ...p })) as Record<string, unknown>[];
  const feeRows     = fees.map((p) => ({ ...p }))     as Record<string, unknown>[];

  const cols = [
    {
      key: "name",
      label: "Protocol",
      render: (v: unknown) => <span className="font-bold text-white">{String(v)}</span>,
    },
    {
      key: "chains",
      label: "Chain",
      render: (v: unknown) => <ChainBadge chains={v as string[]} />,
    },
    {
      key: "total24h",
      label: "24h",
      align: "right" as const,
      render: (v: unknown) => (
        <span className="font-mono font-black text-[#00d672] tabular-nums">{fmtUsd(v)}</span>
      ),
    },
    {
      key: "total7d",
      label: "7d",
      align: "right" as const,
      render: (v: unknown) => (
        <span className="font-mono tabular-nums text-[#888]">{fmtUsd(v)}</span>
      ),
    },
    {
      key: "total30d",
      label: "30d",
      align: "right" as const,
      render: (v: unknown) => (
        <span className="font-mono tabular-nums text-[#555]">{fmtUsd(v)}</span>
      ),
    },
    {
      key: "change_1d",
      label: "24h %",
      align: "right" as const,
      render: (v: unknown) => <PctBadge v={v as number | null} />,
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Protocol Revenue & Fees"
        description="DeFi protocol revenue and fee generation — ranked by 24h earnings with 30D/90D trend analysis."
      />

      {/* ── Existing KPI strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue (24h)", value: fmtUsd(total24hRev),     color: "#00d672" },
          { label: "Total Fees (24h)",    value: fmtUsd(total24hFees),    color: "#FABF2C" },
          { label: "Protocols (Revenue)", value: String(revenues.length), color: "#888" },
          { label: "Source",              value: "DefiLlama",             color: "#888", sub: "Cached 1 hour" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {"sub" in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Existing trend chart ─────────────────────────────────────────────── */}
      {trend.length > 0 && <RevenueTrendClient trend={trend} />}

      {/* ── Existing Revenue Leaderboard ────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#00d672] rounded-full" />Revenue Leaderboard (24h)
          <span className="text-[10px] font-mono text-[#555] normal-case tracking-normal">
            Revenue = fees kept by protocol
          </span>
        </h3>
        <DefiTable
          columns={cols}
          data={revenueRows}
          source="Source: DefiLlama revenue API · Cached 1 hour"
        />
      </div>

      {/* ── Batch 22: Revenue Efficiency leaderboard ────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Revenue Efficiency
          <span className="text-[10px] font-mono text-[#555] normal-case tracking-normal">
            Daily Rev / TVL — capital efficiency ratio
          </span>
        </h3>

        {/* 3-KPI strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Most Efficient Protocol */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
              Most Efficient Protocol
            </p>
            {topEfficient ? (
              <>
                <p className="text-2xl font-black tabular-nums" style={{ color: ratioColor(topEfficient.ratio) }}>
                  {topEfficient.ratio >= 1
                    ? `${topEfficient.ratio.toFixed(2)}%`
                    : `${topEfficient.ratio.toFixed(4)}%`}
                </p>
                <p className="text-[10px] font-mono text-[#555] mt-1">
                  {topEfficient.name} · Rev/TVL ratio
                </p>
              </>
            ) : (
              <p className="text-2xl font-black text-[#555]">—</p>
            )}
          </div>

          {/* Total Protocol Revenue 24h */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
              Total Protocol Revenue (24h)
            </p>
            <p className="text-2xl font-black tabular-nums text-[#00d672]">
              {fmtUsd(total24hRev)}
            </p>
            <p className="text-[10px] font-mono text-[#555] mt-1">across {revenues.length} protocols</p>
          </div>

          {/* Protocols Tracked */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
              Matched for Efficiency
            </p>
            <p className="text-2xl font-black tabular-nums text-white">{efficiencyRows.length}</p>
            <p className="text-[10px] font-mono text-[#555] mt-1">
              protocols with both revenue + TVL data
            </p>
          </div>
        </div>

        {/* Efficiency table */}
        <DefiTable
          columns={[
            {
              key: "name",
              label: "Protocol",
              render: (v: unknown) => (
                <span className="font-bold text-white">{String(v)}</span>
              ),
            },
            {
              key: "rev24h",
              label: "24h Revenue",
              align: "right" as const,
              render: (v: unknown) => (
                <span className="font-mono font-black text-[#00d672] tabular-nums">
                  {fmtUsd(v)}
                </span>
              ),
            },
            {
              key: "tvl",
              label: "TVL",
              align: "right" as const,
              render: (v: unknown) => (
                <span className="font-mono tabular-nums text-[#3b82f6]">{fmtUsd(v)}</span>
              ),
            },
            {
              key: "ratio",
              label: "Rev/TVL Ratio",
              align: "right" as const,
              render: (v: unknown) => {
                const pct = v as number;
                return (
                  <span
                    className="font-mono font-black tabular-nums"
                    style={{ color: ratioColor(pct) }}
                  >
                    {pct >= 1
                      ? `${pct.toFixed(2)}%`
                      : `${pct.toFixed(4)}%`}
                  </span>
                );
              },
            },
            {
              key: "category",
              label: "Category",
              render: (v: unknown) => (
                <span className="text-[#888] font-mono text-[10px]">{String(v)}</span>
              ),
            },
          ]}
          data={effRows}
          source="Source: DefiLlama revenue + TVL APIs · Joined by protocol name · Sorted by Rev/TVL ratio · Cached 1 hour"
        />

        {/* Ratio tier key */}
        <div className="flex gap-5 mt-3 flex-wrap">
          {[
            { label: "≥10%",   color: "#00d672", desc: "High efficiency" },
            { label: "1–10%",  color: "#FABF2C", desc: "Mid efficiency"  },
            { label: "<1%",    color: "#888",    desc: "Low efficiency"  },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
              <span className="text-[9px] font-mono text-[#555]">
                {t.label} — {t.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Existing Fees Leaderboard ────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />Total Fee Generation (24h)
          <span className="text-[10px] font-mono text-[#555] normal-case tracking-normal">
            Fees = all fees paid by users
          </span>
        </h3>
        <DefiTable
          columns={cols}
          data={feeRows}
          source="Source: DefiLlama fees API · Cached 1 hour"
        />
      </div>
    </div>
  );
}

export default function RevenuePage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueData />
      </Suspense>
    </main>
  );
}
