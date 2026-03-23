"use client";
/**
 * BitcoinChartsClient - Phase 45 chart density improvement
 *
 * Renders two charts driven by blockchain.info data (no Dune required):
 *   1. Active Addresses - area chart (unique sending + receiving addresses/day)
 *   2. Daily Transactions - bar chart (confirmed txns/day)
 *
 * Timeframe selector: 7D / 30D / 90D
 * All data is pre-fetched server-side and passed as props.
 * Tooltip props typed as `any` - idiomatic Recharts TS workaround (see recharts-utils.ts).
 */
import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { BtcChartRow } from "../page";

type TF = "7D" | "30D" | "90D";

interface Props {
  activeAddresses: BtcChartRow[];
  dailyTxns:       BtcChartRow[];
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function fmtK(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

function slice(data: BtcChartRow[], tf: TF): BtcChartRow[] {
  const days = tf === "7D" ? 7 : tf === "30D" ? 30 : 90;
  return data.slice(-days);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AddrTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black text-[#f97316]">
        {fmtK(Number(payload[0].value))} addresses
      </p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TxTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black text-[#FABF2C]">
        {fmtK(Number(payload[0].value))} txns
      </p>
    </div>
  );
}

const AXIS = {
  stroke:    "#555",
  fontSize:  10,
  tickLine:  false,
  axisLine:  false,
  fontFamily:"monospace",
} as const;

/* ── Component ───────────────────────────────────────────────────────────── */

export default function BitcoinChartsClient({ activeAddresses, dailyTxns }: Props) {
  const [tf, setTf]           = useState<TF>("30D");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const addrData = slice(activeAddresses, tf);
  const txData   = slice(dailyTxns, tf);

  const noData = activeAddresses.length === 0 && dailyTxns.length === 0;

  if (noData) {
    return (
      <div className="border border-dashed border-[#1a1a1a] p-8 text-center">
        <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
          On-chain chart data unavailable - blockchain.info may be rate limited
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Source + Timeframe header ────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
            Live - blockchain.info
          </span>
          <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
            Free chart API - no key required
          </span>
        </div>
        {/* Timeframe selector */}
        <div className="flex gap-1">
          {(["7D", "30D", "90D"] as TF[]).map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={[
                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all",
                tf === t
                  ? "bg-[#FABF2C] text-black border-[#FABF2C]"
                  : "text-[#555] border-[#1a1a1a] hover:border-[#FABF2C]/60 hover:text-[#FABF2C]",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Area chart: Active Addresses */}
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <div className="mb-4">
            <h3
              className="text-xs font-black uppercase tracking-widest text-white border-l-2 pl-3"
              style={{ borderColor: "#f97316" }}
            >
              Active Addresses
            </h3>
            <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
              Unique addresses per day - blockchain.info/charts/n-unique-addresses
            </p>
          </div>
          <div style={{ height: 220 }}>
            {mounted && addrData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={addrData} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad-addr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="date" {...AXIS} dy={6} minTickGap={28} />
                  <YAxis {...AXIS} tickFormatter={fmtK} width={48} />
                  <Tooltip content={<AddrTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    fill="url(#grad-addr)"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: "#f97316" }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#333] font-mono text-xs uppercase animate-pulse">
                {mounted ? "No address data" : "Rendering..."}
              </div>
            )}
          </div>
        </div>

        {/* Bar chart: Daily Transactions */}
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <div className="mb-4">
            <h3
              className="text-xs font-black uppercase tracking-widest text-white border-l-2 pl-3"
              style={{ borderColor: "#FABF2C" }}
            >
              Daily Transactions
            </h3>
            <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
              Confirmed txns per day - blockchain.info/charts/n-transactions
            </p>
          </div>
          <div style={{ height: 220 }}>
            {mounted && txData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={txData} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="date" {...AXIS} dy={6} minTickGap={28} />
                  <YAxis {...AXIS} tickFormatter={fmtK} width={48} />
                  <Tooltip content={<TxTooltip />} cursor={{ fill: "#ffffff08" }} />
                  <Bar
                    dataKey="value"
                    fill="#FABF2C"
                    fillOpacity={0.8}
                    maxBarSize={14}
                    radius={[1, 1, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#333] font-mono text-xs uppercase animate-pulse">
                {mounted ? "No transaction data" : "Rendering..."}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
