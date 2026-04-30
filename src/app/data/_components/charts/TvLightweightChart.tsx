"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  createChart,
  AreaSeries,
  LineSeries,
  HistogramSeries,
  ColorType,
} from "lightweight-charts";
import type {
  IChartApi,
  ISeriesApi,
  SeriesType,
  DeepPartial,
  ChartOptions,
  AreaStyleOptions,
  SeriesOptionsCommon,
  LineStyleOptions,
  HistogramStyleOptions,
} from "lightweight-charts";

export interface TvDataPoint {
  time: string;
  value: number;
}

export interface TvHistogramDataPoint {
  time: string;
  value: number;
  color?: string;
}

type SeriesKind = "area" | "line" | "histogram";

interface TvLightweightChartProps {
  data: TvDataPoint[];
  kind?: SeriesKind;
  lineColor?: string;
  topColor?: string;
  bottomColor?: string;
  height?: number;
  title?: string;
  autoFit?: boolean;
  priceFormatter?: (price: number) => string;
}

const DARK_CHART_OPTIONS: DeepPartial<ChartOptions> = {
  layout: {
    background: { type: ColorType.Solid, color: "#161616" },
    textColor: "#a3a3a3",
    fontFamily: "'Space Mono', 'SF Mono', 'Fira Code', monospace",
    fontSize: 10,
  },
  grid: {
    vertLines: { color: "#27272a" },
    horzLines: { color: "#27272a" },
  },
  crosshair: {
    vertLine: { color: "#22c55e", width: 1, style: 3, labelBackgroundColor: "#22c55e" },
    horzLine: { color: "#22c55e", width: 1, style: 3, labelBackgroundColor: "#22c55e" },
  },
  timeScale: {
    borderColor: "#27272a",
    timeVisible: false,
    fixLeftEdge: true,
    fixRightEdge: true,
  },
  rightPriceScale: {
    borderColor: "#27272a",
    scaleMargins: { top: 0.1, bottom: 0.05 },
  },
  handleScroll: { mouseWheel: false, pressedMouseMove: false },
  handleScale: { mouseWheel: false, pinch: false, axisPressedMouseMove: false },
};

function defaultPriceFormatter(price: number): string {
  if (price >= 1e12) return `$${(price / 1e12).toFixed(2)}T`;
  if (price >= 1e9) return `$${(price / 1e9).toFixed(2)}B`;
  if (price >= 1e6) return `$${(price / 1e6).toFixed(2)}M`;
  if (price >= 1e3) return `$${(price / 1e3).toFixed(1)}K`;
  if (price >= 1) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price > 0) return `$${price.toFixed(price < 0.01 ? 6 : 4)}`;
  return price.toString();
}

export default function TvLightweightChart({
  data,
  kind = "area",
  lineColor = "#22c55e",
  topColor,
  bottomColor,
  height = 260,
  title,
  autoFit = true,
  priceFormatter,
}: TvLightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);

  const formatter = useCallback(
    (price: number) => (priceFormatter ?? defaultPriceFormatter)(price),
    [priceFormatter],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      ...DARK_CHART_OPTIONS,
      width: container.clientWidth,
      height,
      localization: { priceFormatter: formatter },
    });
    chartRef.current = chart;

    const resolvedTopColor = topColor ?? `${lineColor}33`;
    const resolvedBottomColor = bottomColor ?? `${lineColor}00`;

    if (kind === "histogram") {
      const series = chart.addSeries(HistogramSeries, {
        color: lineColor,
        base: 0,
      } as DeepPartial<HistogramStyleOptions & SeriesOptionsCommon>);
      seriesRef.current = series;
    } else if (kind === "area") {
      const series = chart.addSeries(AreaSeries, {
        lineColor,
        topColor: resolvedTopColor,
        bottomColor: resolvedBottomColor,
        lineWidth: 2,
        crosshairMarkerBackgroundColor: lineColor,
        crosshairMarkerBorderColor: "#0a0a0a",
        crosshairMarkerBorderWidth: 1,
        crosshairMarkerRadius: 4,
      } as DeepPartial<AreaStyleOptions & SeriesOptionsCommon>);
      seriesRef.current = series;
    } else {
      const series = chart.addSeries(LineSeries, {
        color: lineColor,
        lineWidth: 2,
        crosshairMarkerBackgroundColor: lineColor,
        crosshairMarkerBorderColor: "#0a0a0a",
        crosshairMarkerBorderWidth: 1,
        crosshairMarkerRadius: 4,
      } as DeepPartial<LineStyleOptions & SeriesOptionsCommon>);
      seriesRef.current = series;
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) chart.applyOptions({ width });
      }
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [kind, lineColor, topColor, bottomColor, height, formatter]);

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart || data.length === 0) return;

    if (kind === "histogram") {
      series.setData(
        data.map((d) => ({
          time: d.time,
          value: d.value,
          color: (d as TvHistogramDataPoint).color ?? lineColor,
        })),
      );
    } else {
      series.setData(
        data.map((d) => ({ time: d.time, value: d.value })),
      );
    }

    if (autoFit) {
      chart.timeScale().fitContent();
    }
  }, [data, autoFit, kind, lineColor]);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-[#27272a] rounded-3xl bg-[#1a1a1a]"
        style={{ height }}
      >
        <p className="text-sm text-[#52525b] font-mono">
          {title ? `${title} — ` : ""}No chart data available
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height }}
    />
  );
}

export { TvLightweightChart };
