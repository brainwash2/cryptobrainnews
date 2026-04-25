"use client";
/**
 * EthTvlClient — Recharts AreaChart replacement for the CSS bar TVL chart.
 *
 * Receives pre-fetched DefiLlama TVL data from the server component.
 * Renders a gradient-filled area chart matching the CryptoBrainNews terminal theme.
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

interface TvlPoint {
  date: string;
  tvl:  number;
}

interface Props {
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
function EthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black text-[#3b82f6]">{fmtUsd(payload[0].value)}</p>
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

export default function EthTvlClient({ tvlChart, latestTvl }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  if (tvlChart.length === 0) {
    return (
      <div className="border border-dashed border-[#1a1a1a] bg-[#080808] p-6 text-center">
        <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
          TVL chart data unavailable
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#3b82f6] pl-3 mb-1">
        Ethereum DeFi TVL (90D)
      </h3>
      <div className="flex items-center justify-between mb-4 pl-3">
        <p className="text-[10px] text-[#555] font-mono">Source: DefiLlama</p>
        <p className="text-[10px] font-mono text-[#3b82f6] font-black">{fmtUsd(latestTvl)}</p>
      </div>
      <div style={{ height: 240 }}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tvlChart} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="gradEthTvl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="date" {...AXIS} dy={6} minTickGap={28} />
              <YAxis {...AXIS} tickFormatter={(v) => fmtUsd(v)} width={60} />
              <Tooltip content={<EthTooltip />} />
              <Area
                type="monotone"
                dataKey="tvl"
                stroke="#3b82f6"
                fill="url(#gradEthTvl)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: "#3b82f6" }}
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
  );
}
