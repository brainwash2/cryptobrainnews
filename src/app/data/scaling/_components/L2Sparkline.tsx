"use client";

import { useSyncExternalStore } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { TvlPoint } from "@/lib/scaling-data";

interface Props {
  data:  TvlPoint[];
  color: string;
}

const NOOP_SUB = (cb: () => void) => { cb(); return () => {}; };

export default function L2Sparkline({ data, color }: Props) {
  const mounted = useSyncExternalStore(NOOP_SUB, () => true, () => false);

  if (!mounted || data.length < 2) {
    return <div className="h-12 w-full bg-[#0d0d0d] rounded" />;
  }

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <Line
            type="monotone"
            dataKey="tvl"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
