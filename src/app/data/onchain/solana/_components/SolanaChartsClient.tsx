"use client";
/**
 * SolanaChartsClient — Recharts AreaChart for Solana TPS history + TVL.
 *
 * Receives pre-computed TPS samples and TVL chart data from the server.
 * Renders purple-themed (#9945FF) area charts with mounted guard.
 */
import React, { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface TpsPoint {
  label: string;   // Sample index or timestamp label
  tps:   number;
}

interface TvlPoint {
  date: string;
  tvl:  number;
}

interface Props {
  tpsData:   TpsPoint[];
  tvlChart:  TvlPoint[];
  latestTvl: number;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TpsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">Sample {label}</p>
      <p className="font-mono font-black text-[#9945FF]">
        {Number(payload[0].value).toLocaleString()} TPS
      </p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TvlTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black text-[#9945FF]">{fmtUsd(payload[0].value)}</p>
    </div>
  );
}

const AXIS = {
  stroke:     "#555",
  fontSize:   10,
  tickLine:   false,
  axisLine:   false,
  fontFamily: "monospace",
} as const;

/* ── Component ──────────────────────────────────────────────────────────── */

export default function SolanaChartsClient({ tpsData, tvlChart, latestTvl }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  return (
    <div className="space-y-6">
      {/* TPS History */}
      {tpsData.length > 0 && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#9945FF] pl-3 mb-1">
            TPS History (60 Samples)
          </h3>
          <div className="flex items-center justify-between mb-4 pl-3">
            <p className="text-[10px] text-[#555] font-mono">Source: Solana RPC getRecentPerformanceSamples</p>
            <p className="text-[10px] font-mono text-[#9945FF] font-black">
              Latest: {tpsData[tpsData.length - 1]?.tps.toLocaleString() ?? "—"} TPS
            </p>
          </div>
          <div style={{ height: 220 }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tpsData} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSolTps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#9945FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9945FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="label" {...AXIS} dy={6} minTickGap={30} />
                  <YAxis {...AXIS} width={50}
                    tickFormatter={(v: number) => v >= 1e3 ? `${(v/1e3).toFixed(1)}K` : v.toFixed(0)} />
                  <Tooltip content={<TpsTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="tps"
                    stroke="#9945FF"
                    fill="url(#gradSolTps)"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: "#9945FF" }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#333] font-mono text-xs uppercase animate-pulse">
                Rendering...
              </div>
            )}
          </div>
        </div>
      )}

      {/* TVL Chart */}
      {tvlChart.length > 0 && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#9945FF] pl-3 mb-1">
            Solana DeFi TVL (90D)
          </h3>
          <div className="flex items-center justify-between mb-4 pl-3">
            <p className="text-[10px] text-[#555] font-mono">Source: DefiLlama</p>
            <p className="text-[10px] font-mono text-[#9945FF] font-black">{fmtUsd(latestTvl)}</p>
          </div>
          <div style={{ height: 220 }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tvlChart} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSolTvl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#9945FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#9945FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="date" {...AXIS} dy={6} minTickGap={28} />
                  <YAxis {...AXIS} tickFormatter={(v) => fmtUsd(v)} width={60} />
                  <Tooltip content={<TvlTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="tvl"
                    stroke="#9945FF"
                    fill="url(#gradSolTvl)"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: "#9945FF" }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#333] font-mono text-xs uppercase animate-pulse">
                Rendering...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
