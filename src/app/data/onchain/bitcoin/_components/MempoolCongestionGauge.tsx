"use client";

import React, { useMemo, useSyncExternalStore } from "react";
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

interface RawPoint { date: string; value: number }

interface Props {
  mempoolData: RawPoint[]; // bytes from blockchain.info
  feeData:     RawPoint[]; // total daily fees in USD from blockchain.info
}

// ── Zone logic ───────────────────────────────────────────────────────────────
// Thresholds in MB (mempool-size values are in bytes; divide by 1e6 for MB)
const ZONE_LOW_MB  = 50;
const ZONE_MOD_MB  = 150;
const ZONE_HIGH_MB = 300;
const GAUGE_MAX_MB = 400;

type Zone = "Low" | "Moderate" | "High" | "Critical";

function zoneFromMb(mb: number): Zone {
  if (mb < ZONE_LOW_MB)  return "Low";
  if (mb < ZONE_MOD_MB)  return "Moderate";
  if (mb < ZONE_HIGH_MB) return "High";
  return "Critical";
}

function zoneColor(zone: Zone): string {
  switch (zone) {
    case "Low":      return "#00d672";
    case "Moderate": return "#FABF2C";
    case "High":     return "#f97316";
    case "Critical": return "#ff4d4f";
  }
}

function zoneSub(zone: Zone): string {
  switch (zone) {
    case "Low":      return "Network clear — fees minimal";
    case "Moderate": return "Moderate backlog — rising fees";
    case "High":     return "Significant backlog — high fees";
    case "Critical": return "Severe congestion — fees spiking";
  }
}

// ── Formatting ───────────────────────────────────────────────────────────────
function fmtMb(bytes: number): string {
  const mb = bytes / 1_000_000;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1_000).toFixed(0)} KB`;
}

function fmtUsd(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000)     return `$${(usd / 1_000).toFixed(1)}K`;
  return `$${usd.toFixed(0)}`;
}

// ── Gauge zone labels ────────────────────────────────────────────────────────
// Positioned to match the 4-zone semicircle (left = Low, right = Critical)
const GAUGE_LABELS: Array<{ label: string; color: string; style: React.CSSProperties }> = [
  { label: "L",  color: "#00d672", style: { left: "2px",  bottom: "2px"  } },
  { label: "M",  color: "#FABF2C", style: { left: "14px", bottom: "22px" } },
  { label: "H",  color: "#f97316", style: { right: "14px", bottom: "22px" } },
  { label: "Cr", color: "#ff4d4f", style: { right: "2px", bottom: "2px"  } },
];

const LEGEND = [
  { range: "< 50 MB",    label: "Low",      color: "#00d672" },
  { range: "50–150 MB",  label: "Moderate", color: "#FABF2C" },
  { range: "150–300 MB", label: "High",     color: "#f97316" },
  { range: "> 300 MB",   label: "Critical", color: "#ff4d4f" },
];

// ── Tooltip ───────────────────────────────────────────────────────────────────
function MempoolTooltip({
  active,
  payload,
  label,
}: {
  active?:  boolean;
  payload?: Array<{ value: number }>;
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  const bytes = payload[0].value;
  const mb    = bytes / 1_000_000;
  const zone  = zoneFromMb(mb);
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#555] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black" style={{ color: zoneColor(zone) }}>
        {mb.toFixed(1)} MB — {zone}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MempoolCongestionGauge({ mempoolData, feeData }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { currentMb, latestFeeUsd, zone, needleDeg, chartPoints, feeChange30d } =
    useMemo(() => {
      const sortedMem = [...mempoolData].sort((a, b) => a.date.localeCompare(b.date));
      const sortedFee = [...feeData].sort((a, b) => a.date.localeCompare(b.date));

      const lastMem = sortedMem[sortedMem.length - 1]?.value ?? 0;
      const lastFee = sortedFee[sortedFee.length - 1]?.value ?? 0;

      const mb        = lastMem / 1_000_000;
      const z         = zoneFromMb(mb);
      const clamped   = Math.min(Math.max(mb, 0), GAUGE_MAX_MB);
      const needle    = (clamped / GAUGE_MAX_MB) * 180 - 90;

      const pts = sortedMem.map((p) => ({ date: p.date, value: p.value }));

      const fee30dAgo  = sortedFee[Math.max(0, sortedFee.length - 31)]?.value ?? lastFee;
      const feeChg     = fee30dAgo > 0 ? ((lastFee - fee30dAgo) / fee30dAgo) * 100 : 0;

      return {
        currentMb:    mb,
        latestFeeUsd: lastFee,
        zone:         z,
        needleDeg:    needle,
        chartPoints:  pts,
        feeChange30d: feeChg,
      };
    }, [mempoolData, feeData]);

  const color = zoneColor(zone);
  const sub   = zoneSub(zone);

  // Y-axis domain in bytes; pad above 300 MB threshold so reference lines show
  const rawVals = chartPoints.map((p) => p.value);
  const yMax    = rawVals.length
    ? Math.max(Math.max(...rawVals) * 1.1, ZONE_HIGH_MB * 1_000_000 * 1.05)
    : GAUGE_MAX_MB * 1_000_000;
  const yMin    = 0;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            Mempool Congestion
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            Unconfirmed transaction backlog · Low &lt;50 MB · Moderate 50–150 MB · High 150–300 MB · Critical &gt;300 MB · Cached 5 min
          </p>
        </div>
        <span className="border font-mono text-[10px] px-3 py-1 uppercase tracking-widest border-[#00d672]/40 text-[#00d672]">
          Live · blockchain.info
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* ── Semi-circular gauge ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center shrink-0 md:w-44 pt-2">
          <div className="relative w-36 h-[72px] overflow-hidden mb-3">
            {/* Background ring */}
            <div className="absolute inset-0 rounded-t-full border-[12px] border-[#1a1a1a]" />
            {/* Zone labels */}
            {GAUGE_LABELS.map((z) => (
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
          <p className="text-2xl font-black tabular-nums leading-none" style={{ color }}>
            {currentMb.toFixed(1)} MB
          </p>
          <p className="text-[10px] font-mono mt-1.5 font-black uppercase tracking-widest" style={{ color }}>
            {zone}
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-1 text-center">{sub}</p>
        </div>

        {/* ── 90-day area chart + KPIs ────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-0.5">Level</p>
              <p className="text-base font-black tabular-nums" style={{ color }}>{zone}</p>
              <p className="text-[9px] font-mono text-[#555] mt-0.5">{currentMb.toFixed(1)} MB backlog</p>
            </div>
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-0.5">Mempool Size</p>
              <p className="text-base font-black tabular-nums text-[#FABF2C]">{fmtMb(currentMb * 1_000_000)}</p>
              <p className="text-[9px] font-mono text-[#555] mt-0.5">unconfirmed txs</p>
            </div>
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-0.5">Daily Fees</p>
              <p className="text-base font-black tabular-nums text-white">{fmtUsd(latestFeeUsd)}</p>
              <p
                className="text-[9px] font-mono mt-0.5"
                style={{ color: feeChange30d >= 0 ? "#ff4d4f" : "#00d672" }}
              >
                {feeChange30d >= 0 ? "+" : ""}{feeChange30d.toFixed(1)}% vs 30d ago
              </p>
            </div>
          </div>

          {/* 90-day mempool size chart */}
          {mounted && chartPoints.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={chartPoints} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mempoolAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={color} stopOpacity={0}    />
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
                  width={46}
                  tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}MB`}
                />
                {/* Zone threshold reference lines */}
                <ReferenceLine
                  y={ZONE_LOW_MB  * 1_000_000}
                  stroke="#00d672" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.55}
                  label={{ value: "50", fill: "#00d672", fontSize: 8, position: "insideTopRight" }}
                />
                <ReferenceLine
                  y={ZONE_MOD_MB  * 1_000_000}
                  stroke="#FABF2C" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.55}
                  label={{ value: "150", fill: "#FABF2C", fontSize: 8, position: "insideTopRight" }}
                />
                <ReferenceLine
                  y={ZONE_HIGH_MB * 1_000_000}
                  stroke="#f97316" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.55}
                  label={{ value: "300", fill: "#f97316", fontSize: 8, position: "insideTopRight" }}
                />
                <Tooltip content={<MempoolTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill="url(#mempoolAreaGrad)"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton kpis={0} rows={0} charts={1} height={190} />
          )}

          {/* Zone legend */}
          <div className="flex gap-3 mt-2 flex-wrap">
            {LEGEND.map((z) => (
              <div key={z.label} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: z.color }} />
                <span className="text-[9px] font-mono text-[#555]">{z.range} {z.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interpretation strip ─────────────────────────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-[#1a1a1a]">
        <p className="text-[9px] font-mono text-[#555]">
          <span className="text-[#888] font-black">Note:</span> Daily Fees shown in USD total (blockchain.info). A rising mempool combined with increasing fees signals network saturation; extreme congestion often coincides with bull market peaks.
        </p>
      </div>
    </div>
  );
}
