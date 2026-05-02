"use client";

import React, { useSyncExternalStore } from "react";
import { ChartSkeleton } from "../../../_components/ChartSkeleton";
import TvLightweightChart from "../../../_components/charts/TvLightweightChart";
import type { TvDataPoint } from "../../../_components/charts/TvLightweightChart";

interface TvlPoint {
  date: string;
  tvl: number;
}

interface Props {
  tvlChart: TvlPoint[];
  latestTvl: number;
}

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export default function EthTvlClient({ tvlChart, latestTvl }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const chartData: TvDataPoint[] = tvlChart.map((p) => ({
    time: p.date,
    value: p.tvl,
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-3xl bg-[#161616] border border-dashed border-[#27272a] p-12 text-center">
        <p className="text-sm text-[#52525b] font-mono">TVL chart data unavailable</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">Ethereum DeFi TVL (90D)</h3>
          <p className="text-sm text-[#a3a3a3] font-mono mt-1">Source: DefiLlama</p>
        </div>
        <p className="text-sm font-mono text-[#3b82f6] font-semibold">{fmtUsd(latestTvl)}</p>
      </div>
      {mounted ? (
        <TvLightweightChart
          data={chartData}
          lineColor="#3b82f6"
          topColor="#3b82f640"
          bottomColor="#3b82f600"
          height={240}
          title="ETH TVL"
        />
      ) : (
        <ChartSkeleton kpis={0} rows={0} charts={1} height={240} />
      )}
    </div>
  );
}