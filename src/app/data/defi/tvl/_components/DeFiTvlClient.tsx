"use client";

import React, { useState, useSyncExternalStore, useRef, useEffect } from "react";
import { ChartSkeleton } from "../../../_components/ChartSkeleton";
import {
  createChart, AreaSeries, HistogramSeries, ColorType,
} from "lightweight-charts";
import type { IChartApi, DeepPartial, ChartOptions, AreaStyleOptions, SeriesOptionsCommon, HistogramStyleOptions } from "lightweight-charts";
import { TimeframeSelector } from "../../../_components/TimeframeSelector";
import type { Timeframe } from "../../../_components/TimeframeSelector";

interface Category {
  category: string;
  tvl: number;
  share: number;
}

interface TvlHistoryPoint {
  date: string;
  tvl: number;
}

interface Props {
  categories: Category[];
  totalHistory: TvlHistoryPoint[];
}

function sliceHistory(data: TvlHistoryPoint[], tf: Timeframe): TvlHistoryPoint[] {
  const DAYS_MAP: Record<Timeframe, number> = { "1D": 1, "7D": 7, "30D": 30, "90D": 90, "1Y": 365, "YTD": 365, "ALL": 365 };
  const d = DAYS_MAP[tf] ?? 30;
  return data.slice(-d);
}

const CATEGORY_COLORS = [
  "#22c55e", "#3b82f6", "#ef4444", "#f97316", "#8b5cf6", "#ec4899",
  "#06b6d4", "#84cc16", "#f43f5e", "#14b8a6", "#f59e0b", "#6366f1", "#d946ef",
  "#a855f7", "#2dd4bf", "#fb7185", "#4ade80", "#facc15", "#c084fc", "#60a5fa",
];

const DARK_OPTIONS: DeepPartial<ChartOptions> = {
  layout: { background: { type: ColorType.Solid, color: "#161616" }, textColor: "#a3a3a3", fontFamily: "'Space Mono', monospace", fontSize: 10 },
  grid: { vertLines: { color: "#27272a" }, horzLines: { color: "#27272a" } },
  crosshair: { vertLine: { color: "#22c55e", width: 1, style: 3, labelBackgroundColor: "#22c55e" }, horzLine: { color: "#22c55e", width: 1, style: 3, labelBackgroundColor: "#22c55e" } },
  timeScale: { borderColor: "#27272a", timeVisible: false, fixLeftEdge: true, fixRightEdge: true },
  rightPriceScale: { borderColor: "#27272a", scaleMargins: { top: 0.1, bottom: 0.05 } },
  handleScroll: { mouseWheel: false, pressedMouseMove: false },
  handleScale: { mouseWheel: false, pinch: false, axisPressedMouseMove: false },
};

function TvlAreaChart({ data, height }: { data: TvlHistoryPoint[]; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;
    const chart = createChart(containerRef.current, { ...DARK_OPTIONS, width: containerRef.current.clientWidth, height });
    chartRef.current = chart;

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#22c55e",
      topColor: "#22c55e40",
      bottomColor: "#22c55e00",
      lineWidth: 2,
    } as DeepPartial<AreaStyleOptions & SeriesOptionsCommon>);

    series.setData(data.map((d) => ({ time: d.date, value: d.tvl })));
    chart.timeScale().fitContent();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) chart.applyOptions({ width: w });
      }
    });
    ro.observe(containerRef.current);

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; };
  }, [data, height]);

  return <div ref={containerRef} style={{ height }} />;
}

function CategoryHistogram({ categories, height }: { categories: Category[]; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || categories.length === 0) return;
    const chart = createChart(containerRef.current, { ...DARK_OPTIONS, width: containerRef.current.clientWidth, height });
    const top = categories.slice(0, 12);

    top.forEach((cat, i) => {
      const series = chart.addSeries(HistogramSeries, {
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        priceFormat: { type: 'volume' },
      } as DeepPartial<HistogramStyleOptions & SeriesOptionsCommon>);

      series.setData([{ time: cat.category, value: cat.tvl }]);
    });

    chart.timeScale().fitContent();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) chart.applyOptions({ width: w });
      }
    });
    ro.observe(containerRef.current);

    return () => { ro.disconnect(); chart.remove(); };
  }, [categories, height]);

  return <div ref={containerRef} style={{ height }} />;
}

export default function DeFiTvlClient({ categories, totalHistory }: Props) {
  const [tf, setTf] = useState<Timeframe>("30D");
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const tvlData = sliceHistory(totalHistory, tf);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">Total DeFi TVL</h3>
            <p className="text-sm text-[#a3a3a3] font-mono mt-1">Source: DefiLlama</p>
          </div>
          <TimeframeSelector value={tf} onChange={setTf} available={["30D", "90D", "1Y"]} />
        </div>
        {mounted && tvlData.length > 0 ? (
          <TvlAreaChart data={tvlData} height={240} />
        ) : (
          <ChartSkeleton kpis={0} rows={0} charts={1} height={240} />
        )}
      </div>

      <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">TVL by Category</h3>
          <p className="text-sm text-[#a3a3a3] font-mono mt-1">Share of total DeFi value locked</p>
        </div>
        {mounted && categories.length > 0 ? (
          <CategoryHistogram categories={categories} height={Math.max(40 + categories.length * 32, 260)} />
        ) : (
          <ChartSkeleton kpis={0} rows={0} charts={1} height={260} />
        )}
      </div>
    </div>
  );
}
