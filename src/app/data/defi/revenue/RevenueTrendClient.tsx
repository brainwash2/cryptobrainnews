"use client";
import React, { useState, useSyncExternalStore, useRef, useEffect } from "react";
import { ChartSkeleton } from "../../_components/ChartSkeleton";
import {
  createChart, AreaSeries, ColorType,
} from "lightweight-charts";
import type { DeepPartial, ChartOptions, AreaStyleOptions, SeriesOptionsCommon } from "lightweight-charts";
import type { RevenueTrendPoint } from "./page";

interface Props { trend: RevenueTrendPoint[]; }

type TrendDays = 30 | 90;

const DARK_OPTIONS: DeepPartial<ChartOptions> = {
  layout: { background: { type: ColorType.Solid, color: "#161616" }, textColor: "#a3a3a3", fontFamily: "'Space Mono', monospace", fontSize: 10 },
  grid: { vertLines: { color: "#27272a" }, horzLines: { color: "#27272a" } },
  crosshair: { vertLine: { color: "#22c55e", width: 1, style: 3, labelBackgroundColor: "#22c55e" }, horzLine: { color: "#22c55e", width: 1, style: 3, labelBackgroundColor: "#22c55e" } },
  timeScale: { borderColor: "#27272a", timeVisible: false, fixLeftEdge: true, fixRightEdge: true },
  rightPriceScale: { borderColor: "#27272a", scaleMargins: { top: 0.1, bottom: 0.05 } },
  handleScroll: { mouseWheel: false, pressedMouseMove: false },
  handleScale: { mouseWheel: false, pinch: false, axisPressedMouseMove: false },
};

function DualAreaChart({ data, height }: { data: RevenueTrendPoint[]; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;
    const chart = createChart(containerRef.current, { ...DARK_OPTIONS, width: containerRef.current.clientWidth, height });

    const feesSeries = chart.addSeries(AreaSeries, {
      lineColor: "#F7931A",
      topColor: "#F7931A40",
      bottomColor: "#F7931A00",
      lineWidth: 2,
    } as DeepPartial<AreaStyleOptions & SeriesOptionsCommon>);

    const revenueSeries = chart.addSeries(AreaSeries, {
      lineColor: "#22c55e",
      topColor: "#22c55e40",
      bottomColor: "#22c55e00",
      lineWidth: 2,
    } as DeepPartial<AreaStyleOptions & SeriesOptionsCommon>);

    feesSeries.setData(data.map((d) => ({ time: d.date, value: d.feesUsd })));
    revenueSeries.setData(data.map((d) => ({ time: d.date, value: d.revenueUsd })));
    chart.timeScale().fitContent();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) chart.applyOptions({ width: w });
      }
    });
    ro.observe(containerRef.current);

    return () => { ro.disconnect(); chart.remove(); };
  }, [data, height]);

  return <div ref={containerRef} style={{ height }} />;
}

export default function RevenueTrendClient({ trend }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [days, setDays] = useState<TrendDays>(30);

  const sliced = trend.slice(-days);

  return (
    <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">
            DeFi Revenue &amp; Fees Trend
          </h3>
          <p className="text-sm text-[#a3a3a3] font-mono mt-1">
            Source: DefiLlama · Revenue ≈ 15% of fees
          </p>
        </div>
        <div className="inline-flex items-center gap-1">
          {([30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-2xl px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                days === d ? 'bg-[#27272a] text-white' : 'text-[#a3a3a3] hover:text-[#f8fafc]'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>
      {mounted && sliced.length > 0 ? (
        <DualAreaChart data={sliced} height={280} />
      ) : (
        <ChartSkeleton kpis={0} rows={0} charts={1} height={280} />
      )}
    </div>
  );
}
