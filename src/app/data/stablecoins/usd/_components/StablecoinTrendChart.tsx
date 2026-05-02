"use client";

import React, { useState, useSyncExternalStore } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartSkeleton } from "../../../_components/ChartSkeleton";
import { TimeframeSelector } from "../../../_components/TimeframeSelector";
import type { Timeframe } from "../../../_components/TimeframeSelector";
import type { StablecoinHistoryPoint } from "@/lib/defi-data";

interface Props {
  data: StablecoinHistoryPoint[];
}

const TF_DAYS: Partial<Record<Timeframe, number>> = { "7D": 7, "30D": 30, "90D": 90 };

export default function StablecoinTrendChart({ data }: Props) {
  const [tf, setTf] = useState<Timeframe>("30D");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const days = TF_DAYS[tf] ?? 30;
  const sliced = data.slice(-days);

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            USDT vs USDC Supply Trend
          </h3>
          <p className="text-[10px] font-mono text-[#555] mt-1 pl-3">
            DefiLlama · Circulating supply in $B · Cached 1h
          </p>
        </div>
        <TimeframeSelector value={tf} onChange={setTf} available={["7D", "30D", "90D"]} />
      </div>

      {mounted && sliced.length > 0 ? (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={sliced} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => v.slice(5)}
              minTickGap={20}
            />
            <YAxis
              tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v.toFixed(0)}B`}
              width={52}
            />
            <Tooltip
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid #1a1a1a",
                borderRadius: 0,
                fontSize: 11,
              }}
              labelStyle={{ color: "#555", fontFamily: "monospace", fontSize: 10 }}
              formatter={((v: number | undefined, name: string | undefined) => [
                v != null ? `$${v.toFixed(2)}B` : "—",
                name?.toUpperCase() ?? "",
              ]) as never}
              isAnimationActive={false}
            />
            <Legend
              formatter={(v: string) => (
                <span style={{ color: "#888", fontSize: 10, fontFamily: "monospace" }}>
                  {v.toUpperCase()}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="usdt"
              name="usdt"
              stroke="#26A17B"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="usdc"
              name="usdc"
              stroke="#2775CA"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ChartSkeleton kpis={0} rows={0} charts={1} height={260} />
      )}
    </div>
  );
}
