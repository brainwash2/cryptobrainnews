"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import { ChartSkeleton } from "../../../_components/ChartSkeleton";

interface RawPoint {
  date:  string;
  value: number;
}

interface Props {
  data: RawPoint[];
}

// ── EMA helper ──────────────────────────────────────────────────────────────
function computeEma(values: number[], period: number): number[] {
  const k      = 2 / (period + 1);
  const result: number[] = [];
  values.forEach((v, i) => {
    result.push(i === 0 ? v : v * k + result[i - 1] * (1 - k));
  });
  return result;
}

// ── Formatting helpers ───────────────────────────────────────────────────────
// blockchain.info hash-rate values arrive in GH/s; 1 EH/s = 1e6 GH/s
function toEh(ghPerSec: number): number {
  return ghPerSec / 1_000_000;
}
function fmtEh(ghPerSec: number): string {
  return `${toEh(ghPerSec).toFixed(1)} EH/s`;
}

// ── Tooltip ──────────────────────────────────────────────────────────────────
function CapTooltip({
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
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs space-y-1">
      <p className="text-[#555] font-black uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-mono font-black" style={{ color: p.color }}>
          {p.name}: {fmtEh(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function MinerCapitulationChart({ data }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { chartData, ema30Last, ema60Last, signal, crossovers } = useMemo(() => {
    if (!data.length) {
      return { chartData: [], ema30Last: 0, ema60Last: 0, signal: "neutral" as const, crossovers: [] };
    }

    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const values = sorted.map((p) => p.value);
    const ema30  = computeEma(values, 30);
    const ema60  = computeEma(values, 60);

    // Build chart-ready points
    const built = sorted.map((p, i) => ({
      date:  p.date,
      ema30: ema30[i],
      ema60: ema60[i],
    }));

    const last30 = ema30[ema30.length - 1] ?? 0;
    const last60 = ema60[ema60.length - 1] ?? 0;

    // Signal: use 0.2% threshold to avoid noise around parity
    const ratio = last60 > 0 ? last30 / last60 : 1;
    const sig: "capitulation" | "recovery" | "neutral" =
      ratio < 0.998 ? "capitulation" :
      ratio > 1.002 ? "recovery"     : "neutral";

    // Crossover detection: where sign of (ema30 - ema60) flips
    const xovers: string[] = [];
    for (let i = 1; i < built.length; i++) {
      const prevDiff = built[i - 1].ema30 - built[i - 1].ema60;
      const currDiff = built[i].ema30     - built[i].ema60;
      if (prevDiff * currDiff < 0) xovers.push(built[i].date);
    }

    return { chartData: built, ema30Last: last30, ema60Last: last60, signal: sig, crossovers: xovers };
  }, [data]);

  // ── Derived display values ──────────────────────────────────────────────────
  const signalColor =
    signal === "capitulation" ? "#ff4d4f" :
    signal === "recovery"     ? "#00d672" : "#FABF2C";

  const signalLabel =
    signal === "capitulation" ? "⚠ Capitulation" :
    signal === "recovery"     ? "✓ Recovery"     : "Neutral";

  const signalSub =
    signal === "capitulation" ? "30d EMA below 60d EMA — miner stress" :
    signal === "recovery"     ? "30d EMA above 60d EMA — profitability restored" :
    "30d / 60d EMA near parity — transitioning";

  const ema30Eh = toEh(ema30Last);
  const ema60Eh = toEh(ema60Last);
  const spread  = ema30Eh - ema60Eh;

  const allVals = chartData.flatMap((p) => [p.ema30, p.ema60]);
  const yMin    = allVals.length ? Math.min(...allVals) * 0.985 : 0;
  const yMax    = allVals.length ? Math.max(...allVals) * 1.015 : 1;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            Miner Capitulation — Hash Ribbon
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            30-day EMA vs 60-day EMA of Bitcoin hash rate · Cross below = capitulation · Cross above = recovery · Source: blockchain.info
          </p>
        </div>
        <span className="border font-mono text-[10px] px-3 py-1 uppercase tracking-widest border-[#00d672]/40 text-[#00d672]">
          Live · 1.8 h cache
        </span>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">Signal</p>
          <p className="text-xl font-black tabular-nums" style={{ color: signalColor }}>
            {signalLabel}
          </p>
          <p className="text-[9px] font-mono mt-0.5" style={{ color: signalColor }}>{signalSub}</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">30d EMA Hash Rate</p>
          <p className="text-xl font-black tabular-nums text-[#FABF2C]">
            {ema30Eh > 0 ? `${ema30Eh.toFixed(1)} EH/s` : "—"}
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-0.5">short-term average</p>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#555] mb-1">60d EMA Hash Rate</p>
          <p className="text-xl font-black tabular-nums text-white">
            {ema60Eh > 0 ? `${ema60Eh.toFixed(1)} EH/s` : "—"}
          </p>
          <p className="text-[9px] font-mono mt-0.5" style={{ color: spread >= 0 ? "#00d672" : "#ff4d4f" }}>
            Spread {spread >= 0 ? "+" : ""}{spread.toFixed(1)} EH/s
          </p>
        </div>
      </div>

      {/* ── Chart ────────────────────────────────────────────────────────── */}
      {mounted && chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
              tickFormatter={(v: number) => `${toEh(v).toFixed(0)}`}
              label={{ value: "EH/s", angle: -90, position: "insideLeft", fill: "#555", fontSize: 8, dy: 20 }}
            />
            {/* Crossover reference lines */}
            {crossovers.map((date) => (
              <ReferenceLine
                key={date}
                x={date}
                stroke="#888"
                strokeWidth={1}
                strokeDasharray="4 2"
                opacity={0.5}
                label={{ value: "✕", fill: "#888", fontSize: 8, position: "insideTopRight" }}
              />
            ))}
            <Tooltip content={<CapTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "9px", fontFamily: "monospace", color: "#555", paddingTop: "8px" }}
            />
            {/* 60d EMA — white dashed (longer period = slower, reference) */}
            <Line
              type="monotone"
              dataKey="ema60"
              name="60d EMA"
              stroke="#ffffff"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              isAnimationActive={false}
            />
            {/* 30d EMA — amber solid (shorter period = reactive) */}
            <Line
              type="monotone"
              dataKey="ema30"
              name="30d EMA"
              stroke="#FABF2C"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <ChartSkeleton kpis={0} rows={0} charts={1} height={240} />
      )}

      {/* ── Interpretation key ───────────────────────────────────────────── */}
      <div className="flex gap-6 mt-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-4 border-t-2 border-[#FABF2C]" />
          <span className="text-[9px] font-mono text-[#555]">30d EMA (short-term)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 border-t border-dashed border-white" />
          <span className="text-[9px] font-mono text-[#555]">60d EMA (reference)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f]" />
          <span className="text-[9px] font-mono text-[#555]">30d crosses below 60d = capitulation (miner stress, near cycle lows)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d672]" />
          <span className="text-[9px] font-mono text-[#555]">30d crosses above 60d = recovery (profitability restored, historically bullish)</span>
        </div>
      </div>
    </div>
  );
}
