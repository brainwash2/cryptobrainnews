"use client";
import React, { useSyncExternalStore } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { ChartSkeleton } from "../../../_components/ChartSkeleton";

interface ChainRow {
  name:                string;
  totalCirculatingUsd: number;
}

interface TooltipProps {
  active?:  boolean;
  payload?: Array<{ value: number; name: string }>;
  label?:   string;
}

function ChainTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value ?? 0;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 rounded">
      <p className="text-[10px] text-[#555] font-mono mb-1">{label}</p>
      <p className="text-sm font-black tabular-nums text-[#00d672]">
        ${(v / 1e9).toFixed(2)}B
      </p>
    </div>
  );
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum:  "#627EEA",
  Tron:      "#FF0013",
  BSC:       "#F3BA2F",
  Solana:    "#9945FF",
  Avalanche: "#E84142",
  Polygon:   "#8247E5",
  Arbitrum:  "#28A0F0",
  Optimism:  "#FF0420",
};
const DEFAULT_COLOR = "#FABF2C";

interface Props { data: ChainRow[] }

export default function StablecoinChainChart({ data }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return <ChartSkeleton />;
  if (!data.length) return null;

  const total  = data.reduce((s, c) => s + c.totalCirculatingUsd, 0);
  const chartData = data.map((c) => ({
    name:  c.name,
    value: c.totalCirculatingUsd,
    share: total > 0 ? (c.totalCirculatingUsd / total) * 100 : 0,
  }));

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <div className="mb-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-1">
          Stablecoin Supply by Blockchain
        </h3>
        <p className="text-[10px] font-mono text-[#555] pl-3">
          Total stablecoin circulating supply ranked by chain — all issuers combined
        </p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 80, bottom: 0, left: 0 }}
          barCategoryGap="30%"
        >
          <XAxis
            type="number"
            tick={{ fill: "#555", fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${(v / 1e9).toFixed(0)}B`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#ccc", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip content={<ChainTooltip />} cursor={{ fill: "#1a1a1a" }} />
          <Bar dataKey="value" radius={[0, 2, 2, 0]} isAnimationActive={false}>
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={CHAIN_COLORS[entry.name] ?? DEFAULT_COLOR}
                fillOpacity={0.85}
              />
            ))}
            <LabelList
              dataKey="share"
              position="right"
              formatter={(v: unknown) => `${(v as number).toFixed(1)}%`}
              style={{ fill: "#888", fontSize: 9, fontFamily: "monospace" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-[9px] font-mono text-[#555] mt-3">
        Source: DefiLlama stablecoins API · Cached 1 hour
      </p>
    </div>
  );
}
