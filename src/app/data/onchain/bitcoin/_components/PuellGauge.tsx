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
  puell:  number;
  points: { date: string; value: number }[];
  source: "live" | "seed";
}

// Display range: 0 → 4 (Puell rarely exceeds 4 at cycle tops)
const PUELL_MAX = 4;

function puellColor(v: number): string {
  if (v < 0.5) return "#00d672";
  if (v < 1.0) return "#FABF2C";
  if (v < 2.0) return "#f97316";
  return "#ff4d4f";
}

function puellZoneLabel(v: number): string {
  if (v < 0.5) return "Undervalued";
  if (v < 1.0) return "Fair Value";
  if (v < 2.0) return "Overvalued";
  return "Extreme";
}

// 4-zone labels positioned around the semicircle arc
// Gauge range 0→4: UV=0–0.5, FV=0.5–1.0, OV=1.0–2.0, EX=2.0–4.0
const GAUGE_LABELS = [
  { label: "UV", color: "#00d672", style: { left: "2px",  bottom: "2px"  } as React.CSSProperties },
  { label: "FV", color: "#FABF2C", style: { left: "22px", bottom: "22px" } as React.CSSProperties },
  { label: "OV", color: "#f97316", style: { left: "50%",  bottom: "26px", transform: "translateX(-50%)" } as React.CSSProperties },
  { label: "EX", color: "#ff4d4f", style: { right: "2px", bottom: "2px"  } as React.CSSProperties },
];

const LEGEND = [
  { range: "< 0.5",   label: "Undervalued", color: "#00d672" },
  { range: "0.5–1.0", label: "Fair Value",  color: "#FABF2C" },
  { range: "1.0–2.0", label: "Overvalued",  color: "#f97316" },
  { range: "> 2.0",   label: "Extreme",     color: "#ff4d4f" },
];

function PuellTooltip({
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
      <p className="font-mono font-black" style={{ color: puellColor(v) }}>
        {v.toFixed(3)} — {puellZoneLabel(v)}
      </p>
    </div>
  );
}

export default function PuellGauge({ puell, points, source }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const color     = puellColor(puell);
  const zone      = puellZoneLabel(puell);
  // Needle: 0 → -90°, PUELL_MAX → +90°
  const needleDeg = (Math.min(Math.max(puell, 0), PUELL_MAX) / PUELL_MAX) * 180 - 90;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            Bitcoin Puell Multiple
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            Daily Miner Revenue ÷ 365-Day SMA · blockchain.info{source === "live" ? " · Live" : " · Seed (Apr 2026)"} · Cached 24 h
          </p>
        </div>
        <span
          className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
            source === "live"
              ? "border-[#00d672]/40 text-[#00d672]"
              : "border-[#555]/40 text-[#555]"
          }`}
        >
          {source === "live" ? "Live — blockchain.info" : "Seed — Apr 2026"}
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
            {puell.toFixed(3)}
          </p>
          <p
            className="text-[10px] font-mono mt-1.5 font-black uppercase tracking-widest"
            style={{ color }}
          >
            {zone}
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-1">current Puell</p>
        </div>

        {/* ── Puell history area chart ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {mounted && points.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={points} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="puellAreaGrad" x1="0" y1="0" x2="0" y2="1">
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
                  domain={[0, 3]}
                  width={36}
                  tickFormatter={(v: number) => v.toFixed(1)}
                />
                <ReferenceLine y={0.5} stroke="#00d672" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.6} label={{ value: "0.5", fill: "#00d672", fontSize: 8, position: "insideTopRight" }} />
                <ReferenceLine y={1.0} stroke="#FABF2C" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} label={{ value: "1.0", fill: "#FABF2C", fontSize: 8, position: "insideTopRight" }} />
                <ReferenceLine y={2.0} stroke="#f97316" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} label={{ value: "2.0", fill: "#f97316", fontSize: 8, position: "insideTopRight" }} />
                <Tooltip content={<PuellTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#FABF2C"
                  fill="url(#puellAreaGrad)"
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
