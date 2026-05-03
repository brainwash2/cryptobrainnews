"use client";
import React, { useSyncExternalStore } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { ChartSkeleton } from "../../_components/ChartSkeleton";

export interface BridgeBarRow {
  name:      string;
  volume24h: number;
  positive:  boolean; // net inflow direction
}

interface TooltipProps {
  active?:  boolean;
  payload?: Array<{ value: number }>;
  label?:   string;
}

function fmtShort(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function BridgeTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3">
      <p className="text-[10px] text-[#555] font-mono mb-1">{label}</p>
      <p className="text-sm font-black tabular-nums text-[#FABF2C]">
        {fmtShort(payload[0]?.value ?? 0)}
      </p>
      <p className="text-[9px] font-mono text-[#555] mt-0.5">24h Volume (TVL proxy)</p>
    </div>
  );
}

interface Props { data: BridgeBarRow[] }

export default function BridgeBarClient({ data }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return <ChartSkeleton kpis={0} rows={0} charts={1} height={280} />;
  if (!data.length) return null;

  const top10       = data.slice(0, 10);
  const chartHeight = Math.max(280, top10.length * 36 + 20);

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <div className="mb-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-1">
          Top 10 Bridges by 24h Volume
        </h3>
        <p className="text-[10px] font-mono text-[#555] pl-3">
          Volume derived from bridge protocol TVL change · Inflow (green) / Outflow (red)
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
            tickFormatter={(v: number) => fmtShort(v)}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#ccc", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<BridgeTooltip />} cursor={{ fill: "#111" }} />
          <Bar dataKey="volume24h" radius={[0, 2, 2, 0]} isAnimationActive={false}>
            {top10.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.positive ? "#00d672" : "#ff4d4f"}
                fillOpacity={0.8}
              />
            ))}
            <LabelList
              dataKey="volume24h"
              position="right"
              formatter={(v: unknown) => fmtShort(v as number)}
              style={{ fill: "#888", fontSize: 9, fontFamily: "monospace" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-5 mt-4 flex-wrap border-t border-[#111] pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-[#00d672]" />
          <span className="text-[9px] font-mono text-[#555]">Net Inflow — TVL increased</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-[#ff4d4f]" />
          <span className="text-[9px] font-mono text-[#555]">Net Outflow — TVL decreased</span>
        </div>
      </div>

      <p className="text-[9px] font-mono text-[#333] mt-3">
        Source: DefiLlama protocols API · Bridge category · Volume = |TVL × daily change| · Cached 1 hour
      </p>
    </div>
  );
}
