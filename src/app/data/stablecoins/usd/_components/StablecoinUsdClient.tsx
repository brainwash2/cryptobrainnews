"use client";
/**
 * StablecoinUsdClient - Phase 45 Priority 1 Fix 2/3
 *
 * Renders two panels from getStablecoinsOverview() data (pre-fetched server-side):
 *   1. Supply share horizontal bar chart - top 10 USD stablecoins
 *   2. Full ranked table - name, symbol, supply, 24h%, 7d%, chains
 *
 * Replaces the broken BlockChartCard pair that used Dune getStablecoinSupply()
 * (always returned [] since Dune account disabled).
 * Tooltip props typed as `any` - idiomatic Recharts TS workaround.
 */
import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import type { StablecoinData } from "@/lib/defi-data";

interface Props {
  stablecoins:  StablecoinData[];
  totalSupply:  number;
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function PctCell({ v }: { v: number | null }) {
  if (v === null || v === undefined) return <span className="text-[#555]">-</span>;
  const pos = v >= 0;
  return (
    <span className={`font-mono font-bold tabular-nums text-xs ${pos ? "text-[#00d672]" : "text-[#ff4757]"}`}>
      {pos ? "+" : ""}{v.toFixed(2)}%
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SupplyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black text-[#00d672]">
        {fmtUsd(Number(payload[0].value))}
      </p>
      <p className="font-mono text-[#555] text-[10px]">
        {((Number(payload[0].value) / (payload[0].payload.total ?? 1)) * 100).toFixed(1)}% of total
      </p>
    </div>
  );
}

const STABLE_COLORS = [
  "#26A17B", "#2775CA", "#F7931A", "#0033AD",
  "#FABF2C", "#00d672", "#9945FF", "#f97316",
  "#627EEA", "#E24B4A",
];

const AXIS_STYLE = {
  stroke: "#555", fontSize: 10, tickLine: false, axisLine: false, fontFamily: "monospace",
} as const;

export default function StablecoinUsdClient({ stablecoins, totalSupply }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const top10 = stablecoins.slice(0, 10).map((s) => ({
    name:  s.symbol,
    value: s.circulatingUsd,
    total: totalSupply,
  }));

  return (
    <div className="space-y-8">

      {/* Supply bar chart */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
        <div className="mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#00d672] pl-3">
            Circulating Supply - Top 10 USD Stablecoins
          </h3>
          <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
            Source: DefiLlama stablecoins.llama.fi - snapshot
          </p>
        </div>
        <div style={{ height: 260 }}>
          {mounted && top10.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10}
                layout="vertical"
                margin={{ top: 0, right: 80, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                <XAxis
                  type="number"
                  {...AXIS_STYLE}
                  tickFormatter={(v: number) => fmtUsd(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  {...AXIS_STYLE}
                  width={52}
                  tick={{ fontSize: 11, fontFamily: "monospace", fill: "#aaa", fontWeight: 700 }}
                />
                <Tooltip content={<SupplyTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar
                  dataKey="value"
                  maxBarSize={24}
                  radius={[0, 2, 2, 0]}
                  isAnimationActive={false}
                  label={{
                    position: "right",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter: (v: any) =>
                      `${((Number(v) / totalSupply) * 100).toFixed(1)}%`,
                    fontSize: 10,
                    fontFamily: "monospace",
                    fill: "#555",
                  } as any}
                >
                  {top10.map((_, i) => (
                    <Cell
                      key={`s-${i}`}
                      fill={STABLE_COLORS[i % STABLE_COLORS.length]}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[#333] font-mono text-xs uppercase animate-pulse">
              {mounted ? "No data available" : "Rendering..."}
            </div>
          )}
        </div>
      </div>

      {/* Ranked table */}
      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#050505]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest w-8">#</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Asset</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Peg Type</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Circulating</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Share</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">24h %</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">7d %</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Chains</th>
            </tr>
          </thead>
          <tbody>
            {stablecoins.map((s, i) => (
              <tr
                key={s.id}
                className={[
                  "border-b border-[#111] hover:bg-[#0f0f0f] transition-colors",
                  i % 2 === 0 ? "bg-[#0a0a0a]" : "bg-[#080808]",
                ].join(" ")}
              >
                <td className="px-4 py-4 text-[#333] font-mono">{i + 1}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{s.name}</span>
                    <span className="text-[9px] font-black text-[#FABF2C] uppercase tracking-widest px-1.5 py-0.5 bg-[#FABF2C]/10">
                      {s.symbol}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-[#555] font-mono text-[10px]">{s.pegType}</td>
                <td className="px-4 py-4 text-right font-mono font-black text-[#00d672] tabular-nums">
                  {fmtUsd(s.circulatingUsd)}
                </td>
                <td className="px-4 py-4 text-right font-mono text-[#888] tabular-nums">
                  {totalSupply > 0 ? ((s.circulatingUsd / totalSupply) * 100).toFixed(1) : "0"}%
                </td>
                <td className="px-4 py-4 text-right"><PctCell v={s.change_1d} /></td>
                <td className="px-4 py-4 text-right"><PctCell v={s.change_7d} /></td>
                <td className="px-4 py-4 text-[#555] font-mono text-[10px]">
                  {s.chains.slice(0, 3).join(", ")}
                  {s.chains.length > 3 && (
                    <span className="text-[#333]"> +{s.chains.length - 3}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stablecoins.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
              Syncing stablecoin data from DefiLlama...
            </p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-[#333] font-mono text-right">
        Source: DefiLlama stablecoins.llama.fi - USD-pegged only - Cached 1 hour
      </p>
    </div>
  );
}