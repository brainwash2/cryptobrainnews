"use client";

import React, { useState, useSyncExternalStore } from "react";
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
import { TimeframeSelector } from "../../../_components/TimeframeSelector";
import type { Timeframe } from "../../../_components/TimeframeSelector";
import type { FearGreedPoint } from "@/lib/market-data";

interface Props {
  data: FearGreedPoint[];
}

const TF_DAYS: Partial<Record<Timeframe, number>> = { "30D": 30, "90D": 90 };

function fngColor(v: number): string {
  if (v >= 75) return "#00d672";
  if (v >= 55) return "#22c55e";
  if (v >= 45) return "#FABF2C";
  if (v >= 25) return "#f97316";
  return "#ff4757";
}

function fngLabel(v: number): string {
  if (v >= 75) return "Extreme Greed";
  if (v >= 55) return "Greed";
  if (v >= 45) return "Neutral";
  if (v >= 25) return "Fear";
  return "Extreme Fear";
}

const ZONES = [
  { label: "EF", color: "#ff4757", style: { left: "2px",   bottom: "2px"  } as React.CSSProperties },
  { label: "F",  color: "#f97316", style: { left: "14px",  bottom: "18px" } as React.CSSProperties },
  { label: "N",  color: "#FABF2C", style: { left: "50%",   bottom: "22px", transform: "translateX(-50%)" } as React.CSSProperties },
  { label: "G",  color: "#22c55e", style: { right: "14px", bottom: "18px" } as React.CSSProperties },
  { label: "EG", color: "#00d672", style: { right: "2px",  bottom: "2px"  } as React.CSSProperties },
];

const LEGEND = [
  { range: "75–100", label: "Extreme Greed", color: "#00d672" },
  { range: "55–74",  label: "Greed",          color: "#22c55e" },
  { range: "45–54",  label: "Neutral",         color: "#FABF2C" },
  { range: "25–44",  label: "Fear",            color: "#f97316" },
  { range: "0–24",   label: "Extreme Fear",    color: "#ff4757" },
];

function FngTooltip({
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
      <p className="font-mono font-black" style={{ color: fngColor(v) }}>
        {v} — {fngLabel(v)}
      </p>
    </div>
  );
}

export default function FearGreedWidget({ data }: Props) {
  const [tf, setTf] = useState<Timeframe>("30D");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const days    = TF_DAYS[tf] ?? 30;
  const sliced  = data.slice(-days);
  const latest  = sliced[sliced.length - 1];
  const val     = latest?.value ?? 0;
  const color   = fngColor(val);
  const label   = fngLabel(val);

  // Needle: 0 → -90°, 100 → +90°
  const needleDeg = (val / 100) * 180 - 90;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-[#f8fafc] border-l-2 border-[#FABF2C] pl-3">
            Bitcoin Fear &amp; Greed Index
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            Alternative.me · 0 = Extreme Fear · 100 = Extreme Greed · Cached 5 min
          </p>
        </div>
        <TimeframeSelector value={tf} onChange={setTf} available={["30D", "90D"]} />
      </div>

      {/* Gauge + Chart */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* ── Gauge ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center shrink-0 md:w-44 pt-2">
          <div className="relative w-36 h-[72px] overflow-hidden mb-3">
            {/* Arc background */}
            <div className="absolute inset-0 rounded-t-full border-[12px] border-[#1a1a1a]" />
            {/* Zone labels */}
            {ZONES.map((z) => (
              <span
                key={z.label}
                className="absolute text-[7px] font-black font-mono"
                style={{ color: z.color, ...z.style }}
              >
                {z.label}
              </span>
            ))}
            {/* Needle */}
            <div
              className="absolute bottom-0 left-1/2 w-0.5 origin-bottom"
              style={{
                height: "60px",
                background: color,
                transform: `rotate(${needleDeg}deg) translateX(-50%)`,
                transition: "transform 0.7s ease-out",
              }}
            />
            {/* Pivot dot */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
              style={{ background: color }}
            />
          </div>
          <p className="text-4xl font-black tabular-nums leading-none" style={{ color }}>
            {val}
          </p>
          <p
            className="text-[10px] font-mono mt-1.5 font-black uppercase tracking-widest"
            style={{ color }}
          >
            {label}
          </p>
          {latest && (
            <p className="text-[9px] font-mono text-[#555] mt-1">{latest.date}</p>
          )}
        </div>

        {/* ── Area chart ─────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {mounted && sliced.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={sliced} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fngWidgetGrad" x1="0" y1="0" x2="0" y2="1">
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
                  domain={[0, 100]}
                  width={28}
                />
                <ReferenceLine y={75} stroke="#00d672" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} />
                <ReferenceLine y={50} stroke="#27272a" strokeWidth={1}   strokeDasharray="3 3" />
                <ReferenceLine y={25} stroke="#ff4757" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} />
                <Tooltip content={<FngTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#FABF2C"
                  fill="url(#fngWidgetGrad)"
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
