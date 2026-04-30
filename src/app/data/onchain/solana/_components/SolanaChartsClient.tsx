"use client";

import React, { useSyncExternalStore } from "react";
import TvLightweightChart from "../../../_components/charts/TvLightweightChart";
import type { TvDataPoint } from "../../../_components/charts/TvLightweightChart";

export interface TpsPoint {
  label: string;
  tps: number;
}

interface TvlPoint {
  date: string;
  tvl: number;
}

interface Props {
  tpsData: TpsPoint[];
  tvlChart: TvlPoint[];
  latestTvl: number;
}

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export default function SolanaChartsClient({ tpsData, tvlChart, latestTvl }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const tpsChartData: TvDataPoint[] = tpsData.map((p) => ({ time: p.label, value: p.tps }));
  const tvlChartData: TvDataPoint[] = tvlChart.map((p) => ({ time: p.date, value: p.tvl }));

  return (
    <div className="space-y-8">
      {tpsChartData.length > 0 && (
        <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">TPS History (60 Samples)</h3>
              <p className="text-sm text-[#a3a3a3] font-mono mt-1">Source: Solana RPC getRecentPerformanceSamples</p>
            </div>
            <p className="text-sm font-mono text-[#9945FF] font-semibold">
              Latest: {tpsData[tpsData.length - 1]?.tps.toLocaleString() ?? "—"} TPS
            </p>
          </div>
          {mounted ? (
            <TvLightweightChart
              data={tpsChartData}
              lineColor="#9945FF"
              topColor="#9945FF40"
              bottomColor="#9945FF00"
              height={220}
              title="Solana TPS"
            />
          ) : (
            <div className="flex items-center justify-center h-[220px] text-[#52525b] font-mono text-sm">Rendering...</div>
          )}
        </div>
      )}

      {tvlChartData.length > 0 && (
        <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">Solana DeFi TVL (90D)</h3>
              <p className="text-sm text-[#a3a3a3] font-mono mt-1">Source: DefiLlama</p>
            </div>
            <p className="text-sm font-mono text-[#9945FF] font-semibold">{fmtUsd(latestTvl)}</p>
          </div>
          {mounted ? (
            <TvLightweightChart
              data={tvlChartData}
              lineColor="#9945FF"
              topColor="#9945FF40"
              bottomColor="#9945FF00"
              height={220}
              title="Solana TVL"
            />
          ) : (
            <div className="flex items-center justify-center h-[220px] text-[#52525b] font-mono text-sm">Rendering...</div>
          )}
        </div>
      )}
    </div>
  );
}
