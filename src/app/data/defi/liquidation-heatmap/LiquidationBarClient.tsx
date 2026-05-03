"use client";
import React, { useSyncExternalStore } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { ChartSkeleton } from "../../_components/ChartSkeleton";

export interface BarRow {
  name:  string;
  score: number;
  tier:  "Critical" | "High" | "Moderate" | "Low";
}

interface TooltipProps {
  active?:  boolean;
  payload?: Array<{ value: number }>;
  label?:   string;
}

const TIER_COLORS: Record<string, string> = {
  Critical: "#ff4d4f",
  High:     "#f97316",
  Moderate: "#FABF2C",
  Low:      "#00d672",
};

function PressureTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value ?? 0;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3">
      <p className="text-[10px] text-[#555] font-mono mb-1">{label}</p>
      <p className="text-sm font-black tabular-nums text-[#FABF2C]">
        {v.toFixed(4)}%
      </p>
      <p className="text-[9px] font-mono text-[#555] mt-0.5">Pressure Score</p>
    </div>
  );
}

interface Props { data: BarRow[] }

export default function LiquidationBarClient({ data }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return <ChartSkeleton kpis={0} rows={0} charts={1} height={280} />;
  if (!data.length) return null;

  const top10 = data.slice(0, 10);
  const chartHeight = Math.max(280, top10.length * 36 + 20);

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <div className="mb-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#ff4d4f] pl-3 mb-1">
          Top 10 by Liquidation Pressure
        </h3>
        <p className="text-[10px] font-mono text-[#555] pl-3">
          Pressure Score = (24h Fees / TVL) × 100 — higher = more economic stress on locked capital
        </p>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={top10}
          layout="vertical"
          margin={{ top: 0, right: 90, bottom: 0, left: 0 }}
          barCategoryGap="28%"
        >
          <XAxis
            type="number"
            tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1 ? `${v.toFixed(1)}%` : `${v.toFixed(3)}%`
            }
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#ccc", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<PressureTooltip />} cursor={{ fill: "#111" }} />
          <Bar dataKey="score" radius={[0, 2, 2, 0]} isAnimationActive={false}>
            {top10.map((entry) => (
              <Cell
                key={entry.name}
                fill={TIER_COLORS[entry.tier] ?? "#888"}
                fillOpacity={0.8}
              />
            ))}
            <LabelList
              dataKey="score"
              position="right"
              formatter={(v: unknown) => {
                const n = v as number;
                return n >= 1 ? `${n.toFixed(2)}%` : `${n.toFixed(4)}%`;
              }}
              style={{ fill: "#888", fontSize: 9, fontFamily: "monospace" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Tier legend */}
      <div className="flex gap-5 mt-4 flex-wrap border-t border-[#111] pt-4">
        {([
          { tier: "Critical", label: ">10%"  },
          { tier: "High",     label: "5–10%" },
          { tier: "Moderate", label: "2–5%"  },
          { tier: "Low",      label: "<2%"   },
        ] as const).map(({ tier, label }) => (
          <div key={tier} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: TIER_COLORS[tier] }} />
            <span className="text-[9px] font-mono text-[#555]">{tier} — {label}</span>
          </div>
        ))}
      </div>

      <p className="text-[9px] font-mono text-[#333] mt-3">
        Source: DefiLlama fees + TVL APIs · Joined by protocol name · Cached 1 hour
      </p>
    </div>
  );
}
