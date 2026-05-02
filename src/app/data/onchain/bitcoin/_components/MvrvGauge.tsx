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
  mvrv:   number;
  points: { date: string; value: number }[];
  source: "live" | "seed";
}

const MVRV_MAX = 6;

function mvrvColor(v: number): string {
  if (v < 1.0) return "#00d672";
  if (v < 1.5) return "#22c55e";
  if (v < 3.0) return "#FABF2C";
  if (v < 4.5) return "#f97316";
  return "#ff4d4f";
}

function mvrvZoneLabel(v: number): string {
  if (v < 1.0) return "Extreme Undervalue";
  if (v < 1.5) return "Undervalue";
  if (v < 3.0) return "Fair Value";
  if (v < 4.5) return "Overvalued";
  return "Extreme Overvalue";
}

const GAUGE_LABELS = [
  { label: "EU", color: "#00d672", style: { left: "2px",  bottom: "2px"  } as React.CSSProperties },
  { label: "U",  color: "#22c55e", style: { left: "16px", bottom: "20px" } as React.CSSProperties },
  { label: "FV", color: "#FABF2C", style: { left: "50%",  bottom: "26px", transform: "translateX(-50%)" } as React.CSSProperties },
  { label: "OV", color: "#f97316", style: { right: "16px", bottom: "20px" } as React.CSSProperties },
  { label: "EO", color: "#ff4d4f", style: { right: "2px", bottom: "2px"  } as React.CSSProperties },
];

const LEGEND = [
  { range: "< 1.0",   label: "Extreme Undervalue", color: "#00d672" },
  { range: "1.0–1.5", label: "Undervalue",          color: "#22c55e" },
  { range: "1.5–3.0", label: "Fair Value",           color: "#FABF2C" },
  { range: "3.0–4.5", label: "Overvalued",           color: "#f97316" },
  { range: "> 4.5",   label: "Extreme Overvalue",    color: "#ff4d4f" },
];

function MvrvTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#555] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black" style={{ color: mvrvColor(v) }}>
        {v.toFixed(2)} — {mvrvZoneLabel(v)}
      </p>
    </div>
  );
}

export default function MvrvGauge({ mvrv, points, source }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const color    = mvrvColor(mvrv);
  const zone     = mvrvZoneLabel(mvrv);
  const needleDeg = (Math.min(Math.max(mvrv, 0), MVRV_MAX) / MVRV_MAX) * 180 - 90;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            Bitcoin MVRV Ratio
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            Market Value ÷ Realized Value · Glassnode{source === "live" ? " · Live" : " · Seed (Apr 2026)"} · Cached 24 h
          </p>
        </div>
        <span
          className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
            source === "live"
              ? "border-[#00d672]/40 text-[#00d672]"
              : "border-[#555]/40 text-[#555]"
          }`}
        >
          {source === "live" ? "Live — Glassnode" : "Seed — Apr 2026"}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* ── Semi-circular gauge ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center shrink-0 md:w-44 pt-2">
          <div className="relative w-36 h-[72px] overflow-hidden mb-3">
            <div className="absolute inset-0 rounded-t-full border-[12px] border-[#1a1a1a]" />
            {GAUGE_LABELS.map((z) => (
              <span
                key={z.label}
                className="absolute text-[7px] font-black font-mono"
                style={{ color: z.color, ...z.style }}
              >
                {z.label}
              </span>
            ))}
            <div
              className="absolute bottom-0 left-1/2 w-0.5 origin-bottom"
              style={{
                height: "60px",
                background: color,
                transform: `rotate(${needleDeg}deg) translateX(-50%)`,
                transition: "transform 0.7s ease-out",
              }}
            />
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
              style={{ background: color }}
            />
          </div>
          <p className="text-4xl font-black tabular-nums leading-none" style={{ color }}>
            {mvrv.toFixed(2)}
          </p>
          <p
            className="text-[10px] font-mono mt-1.5 font-black uppercase tracking-widest"
            style={{ color }}
          >
            {zone}
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-1">current ratio</p>
        </div>

        {/* ── MVRV history area chart ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {mounted && points.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={points} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="mvrvAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FABF2C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FABF2C" stopOpacity={0}    />
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
                  domain={[0, 5]}
                  width={32}
                  tickFormatter={(v: number) => v.toFixed(1)}
                />
                <ReferenceLine y={1.0} stroke="#00d672" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.6} label={{ value: "1.0", fill: "#00d672", fontSize: 8, position: "insideTopRight" }} />
                <ReferenceLine y={1.5} stroke="#22c55e" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} label={{ value: "1.5", fill: "#22c55e", fontSize: 8, position: "insideTopRight" }} />
                <ReferenceLine y={3.0} stroke="#FABF2C" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} label={{ value: "3.0", fill: "#FABF2C", fontSize: 8, position: "insideTopRight" }} />
                <ReferenceLine y={4.5} stroke="#f97316" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} label={{ value: "4.5", fill: "#f97316", fontSize: 8, position: "insideTopRight" }} />
                <Tooltip content={<MvrvTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#FABF2C"
                  fill="url(#mvrvAreaGrad)"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton kpis={0} rows={0} charts={1} height={220} />
          )}

          {/* Zone legend */}
          <div className="flex gap-3 mt-2 flex-wrap">
            {LEGEND.map((z) => (
              <div key={z.label} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: z.color }} />
                <span className="text-[9px] font-mono text-[#555]">
                  {z.range} {z.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
