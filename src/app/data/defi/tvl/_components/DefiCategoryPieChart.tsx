"use client";

import { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ChartSkeleton } from "../../../_components/ChartSkeleton";

interface Category {
  category: string;
  tvl:      number;
  share:    number;
}

interface Props {
  categories: Category[];
}

const PALETTE = [
  "#FABF2C", "#3b82f6", "#8b5cf6", "#00d672", "#ef4444",
  "#f97316", "#ec4899", "#06b6d4", "#84cc16", "#14b8a6",
  "#555",
];

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

interface TooltipPayload {
  name:    string;
  value:   number;
  payload: { share: number };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-xs">
      <p className="text-white font-black mb-1">{p.name}</p>
      <p className="text-[#FABF2C] tabular-nums">{fmtUsd(p.value)}</p>
      <p className="text-[#555] mt-0.5">{p.payload.share.toFixed(1)}% of DeFi TVL</p>
    </div>
  );
}

const NOOP_SUB = (cb: () => void) => { cb(); return () => {}; };

interface ChartEntry {
  category: string;
  tvl:      number;
  share:    number;
  fill:     string;
}

export default function DefiCategoryPieChart({ categories }: Props) {
  const mounted = useSyncExternalStore(NOOP_SUB, () => true, () => false);

  if (!mounted || categories.length === 0) {
    return <ChartSkeleton kpis={0} rows={0} charts={1} height={320} />;
  }

  const top9         = categories.slice(0, 9);
  const othersTotal  = categories.slice(9).reduce((s, c) => s + c.tvl, 0);
  const othersShare  = categories.slice(9).reduce((s, c) => s + c.share, 0);

  const chartData: ChartEntry[] = [
    ...top9.map((c, i) => ({ ...c, fill: PALETTE[i] ?? "#555" })),
    ...(othersTotal > 0
      ? [{ category: "Others", tvl: othersTotal, share: othersShare, fill: PALETTE[10] ?? "#555" }]
      : []),
  ];

  return (
    <div>
      {/* Donut chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="tvl"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="78%"
              paddingAngle={1}
              isAnimationActive={false}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend grid — 2 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-5">
        {chartData.map((c, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-[10px] font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.fill }} />
              <span className="text-[#888] truncate">{c.category}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-white font-black tabular-nums">{fmtUsd(c.tvl)}</span>
              <span className="text-[#555] tabular-nums w-10 text-right">{c.share.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
