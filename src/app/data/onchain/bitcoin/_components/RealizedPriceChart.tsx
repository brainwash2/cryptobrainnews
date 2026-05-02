"use client";

import React, { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartSkeleton } from "../../../_components/ChartSkeleton";

interface Props {
  points:           { date: string; price: number; realized: number }[];
  currentPrice:     number;
  currentRealized:  number;
  source:           "live" | "seed";
}

function fmtUsd(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(3)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function RealizedTooltip({
  active,
  payload,
  label,
}: {
  active?:  boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#555] font-black uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-mono font-black" style={{ color: p.color }}>
          {p.name === "price" ? "BTC Price" : "Realized Price"}: {fmtUsd(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function RealizedPriceChart({
  points,
  currentPrice,
  currentRealized,
  source,
}: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isAbove     = currentPrice >= currentRealized;
  const diffPct     = currentRealized > 0
    ? ((currentPrice / currentRealized - 1) * 100)
    : null;
  const statusLabel = isAbove ? "Above Realized Price" : "Below Realized Price";
  const statusColor = isAbove ? "#00d672" : "#ff4d4f";

  // Single Y-axis: cover both price and realized in one domain
  const allValues = points.flatMap((p) => [p.price, p.realized]).filter((v) => v > 0);
  const yMin = allValues.length ? Math.min(...allValues) * 0.93 : 0;
  const yMax = allValues.length ? Math.max(...allValues) * 1.07 : 200_000;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            Bitcoin Realized Price
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            Realized Price = BTC Price ÷ MVRV · derived from Glassnode MVRV + CoinGecko price{source === "live" ? " · Live" : " · Seed (Apr 2026)"}
          </p>
        </div>
        <span
          className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
            source === "live"
              ? "border-[#00d672]/40 text-[#00d672]"
              : "border-[#555]/40 text-[#555]"
          }`}
        >
          {source === "live" ? "Live — Derived" : "Seed — Apr 2026"}
        </span>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">BTC Price</p>
          <p className="text-xl font-black tabular-nums text-[#FABF2C]">{fmtUsd(currentPrice)}</p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">spot</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">Realized Price</p>
          <p className="text-xl font-black tabular-nums" style={{ color: "#888" }}>
            {fmtUsd(currentRealized)}
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">avg on-chain cost basis</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">vs Realized</p>
          <p className="text-xl font-black tabular-nums" style={{ color: statusColor }}>
            {diffPct !== null ? `${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(1)}%` : "—"}
          </p>
          <p className="text-[9px] font-mono mt-0.5" style={{ color: statusColor }}>
            {statusLabel}
          </p>
        </div>
      </div>

      {/* ── Dual-line chart ─────────────────────────────────────────────────── */}
      {mounted && points.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={points} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              minTickGap={25}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis
              tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              domain={[yMin, yMax]}
              width={52}
              tickFormatter={(v: number) => `$${(v / 1_000).toFixed(0)}K`}
            />
            <Tooltip content={<RealizedTooltip />} />
            <Legend
              formatter={(value) =>
                value === "price"
                  ? <span className="text-[9px] font-mono text-[#FABF2C]">BTC Price</span>
                  : <span className="text-[9px] font-mono text-[#888]">Realized Price</span>
              }
              wrapperStyle={{ paddingTop: 8 }}
            />
            {/* Actual BTC price — amber solid */}
            <Line
              type="monotone"
              dataKey="price"
              name="price"
              stroke="#FABF2C"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            {/* Realized price — white/muted dashed */}
            <Line
              type="monotone"
              dataKey="realized"
              name="realized"
              stroke="#888"
              strokeWidth={1}
              strokeDasharray="5 3"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <ChartSkeleton kpis={0} rows={0} charts={1} height={240} />
      )}

      {/* ── Footnote ───────────────────────────────────────────────────────── */}
      <p className="text-[9px] font-mono text-[#555] mt-3">
        Realized Price = average cost basis of all circulating BTC weighted by last movement. BTC trading below Realized Price historically signals deep bear-market accumulation zones.
      </p>
    </div>
  );
}
