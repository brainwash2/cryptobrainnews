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

function LthTooltip({
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
      <p className="font-mono font-black text-[#FABF2C]">{v.toFixed(2)}% of supply</p>
    </div>
  );
}

export default function LthSupplyChart({ points, source }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const sorted     = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const currentPct = sorted[sorted.length - 1]?.value ?? 0;
  const val30dAgo  = sorted[Math.max(0, sorted.length - 31)]?.value ?? currentPct;
  const change30d  = currentPct - val30dAgo;
  const isRising   = change30d >= 0;

  // Rising = accumulation (strong hands holding) = bullish → green
  // Falling = distribution (LTHs selling) = bearish → red
  const trendColor  = isRising ? "#00d672" : "#ff4d4f";
  const trendLabel  = isRising ? "▲ Accumulation" : "▼ Distribution";
  const trendSub    = isRising
    ? "LTHs holding — supply contracting"
    : "LTHs distributing — supply expanding";

  const values = sorted.map((p) => p.value);
  const yMin   = values.length ? Math.min(...values) - 1.5 : 60;
  const yMax   = values.length ? Math.max(...values) + 1.5 : 80;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            Bitcoin LTH Supply
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            % of circulating supply unmoved for 155+ days · Long‑Term Holder threshold{source === "live" ? " · Live" : " · Seed (Apr 2026)"} · Cached 24 h
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
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">LTH Supply</p>
          <p className="text-xl font-black tabular-nums text-[#FABF2C]">{currentPct.toFixed(2)}%</p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">of circulating supply</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">30-Day Trend</p>
          <p className="text-xl font-black tabular-nums" style={{ color: trendColor }}>
            {trendLabel}
          </p>
          <p className="text-[9px] font-mono mt-0.5" style={{ color: trendColor }}>{trendSub}</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">30-Day Change</p>
          <p className="text-xl font-black tabular-nums" style={{ color: trendColor }}>
            {change30d >= 0 ? "+" : ""}{change30d.toFixed(2)} pp
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">percentage points</p>
        </div>
      </div>

      {/* ── Area chart ─────────────────────────────────────────────────────── */}
      {mounted && sorted.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={sorted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={trendColor} stopOpacity={0.22} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0}    />
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
              width={38}
              tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            />
            {/* 30-day-ago reference line */}
            <ReferenceLine
              y={val30dAgo}
              stroke="#555"
              strokeWidth={0.5}
              strokeDasharray="3 3"
              opacity={0.5}
              label={{ value: "30d ago", fill: "#555", fontSize: 8, position: "insideTopLeft" }}
            />
            <Tooltip content={<LthTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={trendColor}
              fill="url(#lthAreaGrad)"
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
          <span className="text-[9px] font-mono text-[#555]">Rising LTH % → strong hands accumulating (supply contraction)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f]" />
          <span className="text-[9px] font-mono text-[#555]">Falling LTH % → long-term holders distributing (late-cycle signal)</span>
        </div>
      </div>
    </div>
  );
}
