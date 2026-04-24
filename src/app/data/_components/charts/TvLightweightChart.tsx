"use client";
/**
 * TvLightweightChart — Reusable TradingView Lightweight Charts v5 wrapper
 *
 * Usage:
 *   <TvLightweightChart
 *     data={[{ time: "2025-01-01", value: 42000 }, ...]}
 *     lineColor="#FABF2C"
 *     height={260}
 *   />
 *
 * Handles:
 *   - Auto-resize via ResizeObserver
 *   - Dark terminal theme matching CryptoBrainNews design tokens
 *   - Cleanup on unmount (chart.remove())
 *   - Graceful empty-state when data is missing
 */
import { useRef, useEffect, useCallback } from "react";
import {
  createChart,
  AreaSeries,
  LineSeries,
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
} from "lightweight-charts";

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface TvDataPoint {
  time: string;  // "YYYY-MM-DD" or UTCTimestamp
  value: number;
}

type SeriesKind = "area" | "line";

interface TvLightweightChartProps {
  /** Time-series data (must be sorted ascending by time) */
  data: TvDataPoint[];
  /** Series type. Default: "area" */
  kind?: SeriesKind;
  /** Main line / stroke colour */
  lineColor?: string;
  /** Top gradient colour (area only) */
  topColor?: string;
  /** Bottom gradient colour (area only) */
  bottomColor?: string;
  /** Chart height in px */
  height?: number;
  /** Optional title shown in empty state */
  title?: string;
  /** If true, fit content after data changes */
  autoFit?: boolean;
  /** Format y-axis values (default: compact USD) */
  priceFormatter?: (price: number) => string;
}

/* ── Default dark theme matching CryptoBrainNews tokens ─────────────────── */

const DARK_CHART_OPTIONS: DeepPartial<ChartOptions> = {
  layout: {
    background: { type: ColorType.Solid, color: "#0a0a0a" },
    textColor: "#555",
    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    fontSize: 10,
  },
  grid: {
    vertLines: { color: "#111" },
    horzLines: { color: "#111" },
  },
  crosshair: {
    vertLine: { color: "#FABF2C", width: 1, style: 3, labelBackgroundColor: "#FABF2C" },
    horzLine: { color: "#FABF2C", width: 1, style: 3, labelBackgroundColor: "#FABF2C" },
  },
  timeScale: {
    borderColor: "#1a1a1a",
    timeVisible: false,
    fixLeftEdge: true,
    fixRightEdge: true,
  },
  rightPriceScale: {
    borderColor: "#1a1a1a",
    scaleMargins: { top: 0.1, bottom: 0.05 },
  },
  handleScroll: { mouseWheel: false, pressedMouseMove: false },
  handleScale: { mouseWheel: false, pinch: false, axisPressedMouseMove: false },
};

/* ── Default USD compact formatter ──────────────────────────────────────── */

function defaultPriceFormatter(price: number): string {
  if (price >= 1e12) return `$${(price / 1e12).toFixed(2)}T`;
  if (price >= 1e9)  return `$${(price / 1e9).toFixed(2)}B`;
  if (price >= 1e6)  return `$${(price / 1e6).toFixed(2)}M`;
  if (price >= 1e3)  return `$${(price / 1e3).toFixed(1)}K`;
  if (price >= 1)    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price > 0)     return `$${price.toFixed(price < 0.01 ? 6 : 4)}`;
  return price.toString();
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function TvLightweightChart({
  data,
  kind = "area",
  lineColor = "#FABF2C",
  topColor,
  bottomColor,
  height = 260,
  title,
  autoFit = true,
  priceFormatter,
}: TvLightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef    = useRef<ISeriesApi<SeriesType> | null>(null);

  const formatter = useCallback(
    (price: number) => (priceFormatter ?? defaultPriceFormatter)(price),
    [priceFormatter],
  );

  /* ── Create chart on mount ──────────────────────────────────────────── */

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

    // Determine series colours
    const resolvedTopColor    = topColor    ?? `${lineColor}33`;  // 20% opacity
    const resolvedBottomColor = bottomColor ?? `${lineColor}00`;  // 0% opacity

    if (kind === "area") {
      const series = chart.addSeries(AreaSeries, {
        lineColor,
        topColor:    resolvedTopColor,
        bottomColor: resolvedBottomColor,
        lineWidth:   2,
        crosshairMarkerBackgroundColor: lineColor,
        crosshairMarkerBorderColor:     "#000",
        crosshairMarkerBorderWidth:     1,
        crosshairMarkerRadius:          4,
      } as DeepPartial<AreaStyleOptions & SeriesOptionsCommon>);
      seriesRef.current = series;
    } else {
      const series = chart.addSeries(LineSeries, {
        color:     lineColor,
        lineWidth: 2,
        crosshairMarkerBackgroundColor: lineColor,
        crosshairMarkerBorderColor:     "#000",
        crosshairMarkerBorderWidth:     1,
        crosshairMarkerRadius:          4,
      } as DeepPartial<LineStyleOptions & SeriesOptionsCommon>);
      seriesRef.current = series;
    }

    // Auto-resize
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
      chartRef.current  = null;
      seriesRef.current = null;
    };
    // Re-create chart only when kind / colour / height / formatter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, lineColor, topColor, bottomColor, height, formatter]);

  /* ── Update data reactively ─────────────────────────────────────────── */

  useEffect(() => {
    const series = seriesRef.current;
    const chart  = chartRef.current;
    if (!series || !chart || data.length === 0) return;

    series.setData(
      data.map((d) => ({ time: d.time, value: d.value })),
    );

    if (autoFit) {
      chart.timeScale().fitContent();
    }
  }, [data, autoFit]);

  /* ── Empty state ────────────────────────────────────────────────────── */

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-[#1a1a1a] bg-[#080808]"
        style={{ height }}
      >
        <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
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
