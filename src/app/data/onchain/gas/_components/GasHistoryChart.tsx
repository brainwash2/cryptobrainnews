"use client";

import React, { useState, useSyncExternalStore } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

export interface GasHistoryPoint {
  date:  string;
  gwei:  number;
}

interface Props {
  data: GasHistoryPoint[];
}

function subscribe() { return () => {}; }
function getSnapshot() { return false; }
function getServerSnapshot() { return true; }

export default function GasHistoryChart({ data }: Props) {
  const isServer = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [range, setRange] = useState<7 | 30>(30);

  const sliced = data.slice(range === 7 ? -7 : -30);
  const avg    = sliced.length > 0
    ? sliced.reduce((s, p) => s + p.gwei, 0) / sliced.length
    : 0;
  const latest = sliced[sliced.length - 1]?.gwei ?? 0;
  const pct    = avg > 0 ? ((latest - avg) / avg) * 100 : 0;

  if (isServer || data.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <p className="text-[10px] text-[#555] font-mono uppercase tracking-widest">
          Gas history loading…
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#3b82f6] pl-3">
            ETH Gas Price — Historical Trend
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            Daily avg base fee · Gwei
          </p>
        </div>

        <div className="flex items-center gap-2">
          {([7, 30] as const).map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border transition-colors ${
                range === d
                  ? "border-[#3b82f6] text-[#3b82f6] bg-[#3b82f6]/10"
                  : "border-[#1a1a1a] text-[#555] hover:border-[#333]"
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-[9px] font-mono text-[#555] uppercase mb-1">Latest</p>
          <p className="text-xl font-black tabular-nums text-white">{latest.toFixed(1)} Gwei</p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-[#555] uppercase mb-1">{range}D Avg</p>
          <p className="text-xl font-black tabular-nums text-[#3b82f6]">{avg.toFixed(1)} Gwei</p>
        </div>
        <div>
          <p className="text-[9px] font-mono text-[#555] uppercase mb-1">vs Avg</p>
          <p className={`text-xl font-black tabular-nums ${pct >= 0 ? "text-[#ff4d4f]" : "text-[#00d672]"}`}>
            {pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={sliced} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#111" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            interval={range === 7 ? 0 : 5}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v.toFixed(0)}`}
            width={36}
          />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 0 }}
            labelStyle={{ color: "#888", fontSize: 10, fontFamily: "monospace" }}
            itemStyle={{ color: "#3b82f6", fontSize: 10, fontFamily: "monospace" }}
            formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(2)} Gwei`, "Avg Gas"]}
          />
          <Area
            type="monotone"
            dataKey="gwei"
            stroke="#3b82f6"
            strokeWidth={1.5}
            fill="url(#gasGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-[9px] text-[#333] font-mono mt-3">
        Source: Etherscan Stats API · Cached 1 h
      </p>
    </div>
  );
}
