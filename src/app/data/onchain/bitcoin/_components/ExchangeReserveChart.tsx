"use client";

import React, { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { ChartSkeleton } from "../../../_components/ChartSkeleton";

interface Props {
  points: { date: string; value: number }[];
  source: "live" | "seed";
}

function fmtBtc(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(3)}M BTC`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}K BTC`;
  return `${v.toFixed(0)} BTC`;
}

function fmtChange(v: number): string {
  const sign = v >= 0 ? "+" : "";
  if (Math.abs(v) >= 1_000_000) return `${sign}${(v / 1_000_000).toFixed(3)}M BTC`;
  if (Math.abs(v) >= 1_000)     return `${sign}${(v / 1_000).toFixed(1)}K BTC`;
  return `${sign}${v.toFixed(0)} BTC`;
}

function ExchangeTooltip({
  active,
  payload,
  label,
}: {
  active?:  boolean;
  payload?: Array<{ value: number }>;
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#555] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black text-[#FABF2C]">{fmtBtc(v)}</p>
    </div>
  );
}

export default function ExchangeReserveChart({ points, source }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const sorted      = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const currentVal  = sorted[sorted.length - 1]?.value ?? 0;
  const val30dAgo   = sorted[Math.max(0, sorted.length - 31)]?.value ?? currentVal;
  const change30d   = currentVal - val30dAgo;
  // Outflow (negative change) = bullish accumulation → green
  // Inflow  (positive change) = sell pressure        → red
  const changeColor = change30d <= 0 ? "#00d672" : "#ff4d4f";
  const changeLabel = change30d <= 0 ? "Outflow — Accumulation" : "Inflow — Sell Pressure";

  // Area chart fill: green tint when declining (accumulation), red tint when rising
  const areaColor   = change30d <= 0 ? "#00d672" : "#ff4d4f";

  // Y-axis domain: pad ±3% around the data range
  const values  = sorted.map((p) => p.value);
  const yMin    = values.length ? Math.min(...values) * 0.97 : 0;
  const yMax    = values.length ? Math.max(...values) * 1.03 : 3_000_000;

  // Reference line at the 30-day-ago level to show context
  const refLine = val30dAgo;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            Bitcoin Exchange Reserve
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            Total BTC held in known exchange wallets · falling = accumulation (bullish) · rising = sell pressure{source === "live" ? " · Live" : " · Seed (Apr 2026)"} · Cached 24 h
          </p>
        </div>
        <span
          className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
            source === "live"
              ? "border-[#00d672]/40 text-[#00d672]"
              : "border-[#555]/40 text-[#555]"
          }`}
        >
          {source === "live" ? "Live" : "Seed — Apr 2026"}
        </span>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">Current Reserve</p>
          <p className="text-xl font-black tabular-nums text-[#FABF2C]">{fmtBtc(currentVal)}</p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">total on exchanges</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">30-Day Change</p>
          <p className="text-xl font-black tabular-nums" style={{ color: changeColor }}>
            {fmtChange(change30d)}
          </p>
          <p className="text-[9px] font-mono mt-0.5" style={{ color: changeColor }}>
            {changeLabel}
          </p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">30-Day % Change</p>
          <p className="text-xl font-black tabular-nums" style={{ color: changeColor }}>
            {val30dAgo > 0
              ? `${change30d >= 0 ? "+" : ""}${((change30d / val30dAgo) * 100).toFixed(2)}%`
              : "—"}
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">vs 30 days ago</p>
        </div>
      </div>

      {/* ── Area chart ─────────────────────────────────────────────────────── */}
      {mounted && sorted.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={sorted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="exchResGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={areaColor} stopOpacity={0.20} />
                <stop offset="95%" stopColor={areaColor} stopOpacity={0}    />
              </linearGradient>
            </defs>
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
              width={56}
              tickFormatter={(v: number) => `${(v / 1_000).toFixed(0)}K`}
            />
            {/* 30-day-ago reference line for change context */}
            <ReferenceLine
              y={refLine}
              stroke="#555"
              strokeWidth={0.5}
              strokeDasharray="3 3"
              opacity={0.5}
              label={{ value: "30d ago", fill: "#555", fontSize: 8, position: "insideTopLeft" }}
            />
            <Tooltip content={<ExchangeTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={areaColor}
              fill="url(#exchResGrad)"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <ChartSkeleton kpis={0} rows={0} charts={1} height={220} />
      )}

      {/* ── Interpretation key ─────────────────────────────────────────────── */}
      <div className="flex gap-6 mt-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d672]" />
          <span className="text-[9px] font-mono text-[#555]">Falling reserve → coins leaving exchanges (accumulation)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f]" />
          <span className="text-[9px] font-mono text-[#555]">Rising reserve → coins entering exchanges (sell pressure)</span>
        </div>
      </div>
    </div>
  );
}
