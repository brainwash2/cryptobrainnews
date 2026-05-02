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
  priceHistory: { date: string; price: number }[];
  currentPrice: number;
  source: "live" | "seed";
}

// ── S2F constants — update CIRCULATING_SUPPLY quarterly ─────────────────────
const CIRCULATING_SUPPLY = 19_700_000;          // BTC in circulation (Apr 2026)
const ANNUAL_ISSUANCE    = 3.125 * 6 * 24 * 365; // 164,250 BTC/year post-2024 halving
const S2F_RATIO          = CIRCULATING_SUPPLY / ANNUAL_ISSUANCE;   // ≈ 119.94
const MODEL_PRICE        = S2F_RATIO ** 3 * 0.40;                  // PlanB: SF³ × $0.40

function fmtUsd(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function PriceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#555] font-black uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-mono font-black" style={{ color: p.color }}>
          {p.name}: {fmtUsd(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function S2fChart({ priceHistory, currentPrice, source }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Attach constant model price to every data point
  const chartData = priceHistory.map((p) => ({
    date:  p.date,
    price: p.price,
    model: Math.round(MODEL_PRICE),
  }));

  const premiumPct = currentPrice > 0
    ? ((currentPrice / MODEL_PRICE - 1) * 100)
    : null;
  const premiumLabel = premiumPct !== null
    ? premiumPct >= 0
      ? `+${premiumPct.toFixed(1)}% above model`
      : `${premiumPct.toFixed(1)}% below model`
    : "—";
  const premiumColor = premiumPct !== null && premiumPct >= 0 ? "#00d672" : "#ff4d4f";

  // Left axis (actual price) — auto-scale to data, add 10% headroom
  const minPrice = priceHistory.length
    ? Math.min(...priceHistory.map((p) => p.price)) * 0.95
    : 0;
  const maxPrice = priceHistory.length
    ? Math.max(...priceHistory.map((p) => p.price)) * 1.05
    : MODEL_PRICE;

  // Right axis: model price ± 5% so the flat line sits mid-axis
  const modelLo = MODEL_PRICE * 0.95;
  const modelHi = MODEL_PRICE * 1.05;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            Bitcoin Stock‑to‑Flow Model
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            S2F = Circulating Supply ÷ Annual Issuance · Model Price = S2F³ × $0.40 (PlanB) · Computed
          </p>
        </div>
        <span
          className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
            source === "live"
              ? "border-[#00d672]/40 text-[#00d672]"
              : "border-[#555]/40 text-[#555]"
          }`}
        >
          {source === "live" ? "Live Price · CoinGecko" : "Seed Price · Apr 2026"}
        </span>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">S2F Ratio</p>
          <p className="text-xl font-black tabular-nums text-[#FABF2C]">{S2F_RATIO.toFixed(2)}</p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">post‑2024 halving</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">S2F Model Price</p>
          <p className="text-xl font-black tabular-nums text-[#888]">{fmtUsd(MODEL_PRICE)}</p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">SF³ × $0.40</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">Current BTC Price</p>
          <p className="text-xl font-black tabular-nums text-[#FABF2C]">{fmtUsd(currentPrice)}</p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">spot</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">vs Model</p>
          <p
            className="text-xl font-black tabular-nums"
            style={{ color: premiumColor }}
          >
            {premiumPct !== null ? `${premiumPct >= 0 ? "+" : ""}${premiumPct.toFixed(1)}%` : "—"}
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">{premiumLabel}</p>
        </div>
      </div>

      {/* ── Dual-line chart ─────────────────────────────────────────────────── */}
      {mounted && chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 60, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              minTickGap={25}
              tickFormatter={(v: string) => v.slice(5)}
            />
            {/* Left axis — actual BTC price */}
            <YAxis
              yAxisId="left"
              tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              domain={[minPrice, maxPrice]}
              width={52}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            {/* Right axis — S2F model price (flat line) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              domain={[modelLo, modelHi]}
              width={56}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<PriceTooltip />} />
            <Legend
              formatter={(value) =>
                value === "price"
                  ? <span className="text-[9px] font-mono text-[#FABF2C]">BTC Price</span>
                  : <span className="text-[9px] font-mono text-[#555]">S2F Model</span>
              }
              wrapperStyle={{ paddingTop: 8 }}
            />
            {/* Actual BTC price — amber solid line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="price"
              name="price"
              stroke="#FABF2C"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            {/* S2F model price — muted dashed flat line on right axis */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="model"
              name="model"
              stroke="#555"
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
        Annual issuance: {ANNUAL_ISSUANCE.toLocaleString()} BTC/yr · Circulating supply: {CIRCULATING_SUPPLY.toLocaleString()} BTC (Apr 2026) · Model price is constant between halvings.
      </p>
    </div>
  );
}
