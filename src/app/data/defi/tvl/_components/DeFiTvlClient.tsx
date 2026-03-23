"use client";
/**
 * DeFiTvlClient - Phase 45 chart density improvement
 *
 * Adds two Recharts panels:
 *   1. Total DeFi TVL area chart (30D / 90D / 1Y selector)
 *   2. TVL by Category horizontal bar chart (from getTvlByCategory())
 *
 * Both use pre‑fetched server data and slice client‑side.
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
  Cell,
} from "recharts";

type TF = "30D" | "90D" | "1Y";

interface Category {
  category: string;
  tvl: number;
  share: number;
}

interface TvlHistoryPoint {
  date: string;
  tvl: number;
}

interface Props {
  categories: Category[];
  totalHistory: TvlHistoryPoint[];
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function sliceHistory(data: TvlHistoryPoint[], tf: TF): TvlHistoryPoint[] {
  const days = tf === "30D" ? 30 : tf === "90D" ? 90 : 365;
  return data.slice(-days);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TotalTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black text-[#FABF2C]">{fmtUsd(payload[0].value)}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CategoryTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black text-[#FABF2C]">{fmtUsd(payload[0].value)}</p>
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

// Colour ramp for categories
const CATEGORY_COLORS = [
  "#FABF2C", "#3b82f6", "#ef4444", "#10b981", "#f97316", "#8b5cf6", "#ec4899",
  "#06b6d4", "#84cc16", "#f43f5e", "#14b8a6", "#f59e0b", "#6366f1", "#d946ef",
  "#a855f7", "#2dd4bf", "#fb7185", "#4ade80", "#facc15", "#c084fc", "#60a5fa",
];

/* ── Component ───────────────────────────────────────────────────────────── */

export default function DeFiTvlClient({ categories, totalHistory }: Props) {
  const [tf, setTf]           = useState<TF>("30D");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const tvlData = sliceHistory(totalHistory, tf);

  return (
    <div className="space-y-6">

      {/* ── Chart 1: Total DeFi TVL area ────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
              Total DeFi TVL
            </h3>
            <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
              Source: DefiLlama (Ethereum TVL as proxy)
            </p>
          </div>
          <div className="flex gap-1">
            {(["30D", "90D", "1Y"] as TF[]).map((t) => (
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
        <div style={{ height: 240 }}>
          {mounted && tvlData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tvlData} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FABF2C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FABF2C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="date" {...AXIS} dy={6} minTickGap={28} />
                <YAxis {...AXIS} tickFormatter={(v) => fmtUsd(v)} width={60} />
                <Tooltip content={<TotalTooltip />} />
                <Area
                  type="monotone"
                  dataKey="tvl"
                  stroke="#FABF2C"
                  fill="url(#grad-total)"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: "#FABF2C" }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[#333] font-mono text-xs uppercase animate-pulse">
              {mounted ? "No TVL history data" : "Rendering..."}
            </div>
          )}
        </div>
      </div>

      {/* ── Chart 2: TVL by Category (horizontal bars) ───────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
        <div className="mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            TVL by Category
          </h3>
          <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
            Share of total DeFi value locked
          </p>
        </div>
        <div style={{ height: Math.max(40 + categories.length * 32, 260) }}>
          {mounted && categories.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categories}
                margin={{ top: 5, right: 10, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => fmtUsd(v)}
                  {...AXIS}
                  fontSize={9}
                  width={55}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={90}
                  tick={{ fill: "#aaa", fontSize: 9, fontWeight: "bold", fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CategoryTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="tvl" maxBarSize={20} radius={[0, 2, 2, 0]} isAnimationActive={false}>
                  {categories.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[#333] font-mono text-xs uppercase animate-pulse">
              {mounted ? "No category data" : "Rendering..."}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
