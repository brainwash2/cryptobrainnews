"use client";
import React, { useState, useSyncExternalStore } from "react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import type { RevenueTrendPoint } from "./page";

interface Props { trend: RevenueTrendPoint[]; }

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs font-mono">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} className="text-white">
          <span style={{ color: p.color }}>{p.name}: </span>
          <span className="font-black">{fmtUsd(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

const AXIS = {
  stroke: "#555", fontSize: 10, tickLine: false,
  axisLine: false, fontFamily: "monospace",
} as const;

type TrendDays = 30 | 90;

export default function RevenueTrendClient({ trend }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [days, setDays] = useState<TrendDays>(30);

  const sliced = trend.slice(-days);

  return (
    <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#00d672] pl-3">
            DeFi Revenue & Fees Trend
          </h3>
          <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
            Source: DefiLlama total fees chart · Revenue ≈ 15% of fees
          </p>
        </div>
        <div className="flex gap-1">
          {([30, 90] as const).map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={"px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all " +
                (days === d ? "bg-[#FABF2C] text-black border-[#FABF2C]" :
                  "text-[#555] border-[#1a1a1a] hover:border-[#FABF2C]/60")}>
              {d}D
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 280 }}>
        {mounted && sliced.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sliced} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="feesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FABF2C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FABF2C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d672" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d672" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="date" {...AXIS} minTickGap={30} dy={4} />
              <YAxis {...AXIS} tickFormatter={(v: number) => fmtUsd(v)} width={60} />
              <Tooltip content={<TrendTooltip />} />
              <Legend iconType="line"
                wrapperStyle={{ fontSize: 10, fontFamily: "monospace", textTransform: "uppercase" }} />
              <Area type="monotone" dataKey="feesUsd" name="Fees" stroke="#FABF2C"
                fill="url(#feesGrad)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="revenueUsd" name="Revenue" stroke="#00d672"
                fill="url(#revGrad)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#333] font-mono text-xs uppercase animate-pulse">
            {mounted ? "No trend data available" : "Rendering..."}
          </div>
        )}
      </div>
    </div>
  );
}
