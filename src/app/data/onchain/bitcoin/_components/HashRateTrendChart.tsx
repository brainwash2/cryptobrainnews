"use client";
import React, { useSyncExternalStore } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { ChartSkeleton } from "../../../_components/ChartSkeleton";
import type { BtcChartRow } from "../page";

interface TooltipPayloadItem { value: number }
interface TooltipProps {
  active?:  boolean;
  payload?: TooltipPayloadItem[];
  label?:   string;
}

function HashRateTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded">
      <p className="text-[10px] text-[#555] font-mono mb-1">{label}</p>
      <p className="text-sm font-black tabular-nums" style={{ color: "#FABF2C" }}>
        {(payload[0]?.value ?? 0).toFixed(1)} EH/s
      </p>
    </div>
  );
}

interface Props {
  data:      BtcChartRow[];
  currentEh: number;
  change30d: number;
}

export default function HashRateTrendChart({ data, currentEh, change30d }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return <ChartSkeleton />;

  const chartData = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const changeColor = change30d >= 0 ? "#00d672" : "#ff4d4f";
  const changeSign  = change30d >= 0 ? "+" : "";

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-1">
            Hash Rate Trend (30-Day)
          </h3>
          <p className="text-[10px] font-mono text-[#555] pl-3">
            Total computational power securing the Bitcoin network
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <p className="text-2xl font-black tabular-nums" style={{ color: "#FABF2C" }}>
            {currentEh.toFixed(1)}{" "}
            <span className="text-xs text-[#888]">EH/s</span>
          </p>
          <p className="text-[10px] font-mono mt-1" style={{ color: changeColor }}>
            {changeSign}{change30d.toFixed(1)}% vs 30d ago
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#FABF2C" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#FABF2C" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1a1a1a"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(d: string) => d.slice(5)}
            interval={4}
          />
          <YAxis
            tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            width={42}
            tickFormatter={(v: number) => `${v.toFixed(0)}`}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<HashRateTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FABF2C"
            strokeWidth={1.5}
            fill="url(#hrGrad)"
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-[9px] font-mono text-[#555] mt-3">
        Source: blockchain.info · Cached 30 min
      </p>
    </div>
  );
}
