"use client";

import React, { useSyncExternalStore, useRef, useEffect } from "react";
import {
  createChart, HistogramSeries, ColorType,
} from "lightweight-charts";
import type { DeepPartial, ChartOptions, HistogramStyleOptions, SeriesOptionsCommon } from "lightweight-charts";
import type { StablecoinData } from "@/lib/defi-data";

interface Props {
  stablecoins: StablecoinData[];
  totalSupply: number;
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function PctCell({ v }: { v: number | null }) {
  if (v === null || v === undefined) return <span className="text-[#a3a3a3]">—</span>;
  const pos = v >= 0;
  return (
    <span className={`font-mono font-semibold tabular-nums text-sm ${pos ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
      {pos ? "+" : ""}{v.toFixed(2)}%
    </span>
  );
}

const STABLE_COLORS = [
  "#26A17B", "#2775CA", "#F7931A", "#0033AD",
  "#22c55e", "#8b5cf6", "#f97316",
  "#627EEA", "#ef4444", "#14b8a6",
];

const DARK_OPTIONS: DeepPartial<ChartOptions> = {
  layout: { background: { type: ColorType.Solid, color: "#161616" }, textColor: "#a3a3a3", fontFamily: "'Space Mono', monospace", fontSize: 10 },
  grid: { vertLines: { color: "#27272a" }, horzLines: { color: "#27272a" } },
  crosshair: { vertLine: { color: "#22c55e", width: 1, style: 3, labelBackgroundColor: "#22c55e" }, horzLine: { color: "#22c55e", width: 1, style: 3, labelBackgroundColor: "#22c55e" } },
  timeScale: { borderColor: "#27272a", visible: false },
  rightPriceScale: { borderColor: "#27272a", scaleMargins: { top: 0.1, bottom: 0.05 } },
  handleScroll: { mouseWheel: false, pressedMouseMove: false },
  handleScale: { mouseWheel: false, pinch: false, axisPressedMouseMove: false },
};

function SupplyHistogram({ data, height }: { data: Array<{ name: string; value: number; color: string }>; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;
    const chart = createChart(containerRef.current, { ...DARK_OPTIONS, width: containerRef.current.clientWidth, height });

    data.forEach((item) => {
      const series = chart.addSeries(HistogramSeries, {
        color: item.color,
        priceFormat: { type: 'volume' },
      } as DeepPartial<HistogramStyleOptions & SeriesOptionsCommon>);

      series.setData([{ time: item.name, value: item.value }]);
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
  }, [data, height]);

  return <div ref={containerRef} style={{ height }} />;
}

function PegGauge({ symbol, price }: { symbol: string; price: number }) {
  const deviation = (price - 1) * 100;
  const absDev = Math.abs(deviation);
  const isHealthy = absDev < 0.1;
  const isWarning = absDev >= 0.1 && absDev < 1.0;
  const severity = isHealthy ? "#22c55e" : isWarning ? "#f59e0b" : "#ef4444";
  const statusLabel = isHealthy ? "Tight ✓" : isWarning ? "Loose" : "Depegged!";

  const deg = Math.min(absDev * 18, 100) * (deviation >= 0 ? 1 : -1);
  const rotation = Math.max(-90, Math.min(90, deg));

  return (
    <div className="rounded-3xl bg-[#1a1a1a] border border-[#27272a] p-4 flex flex-col items-center">
      <p className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">{symbol}</p>
      <div className="relative w-20 h-10 overflow-hidden mb-2">
        <div className="absolute inset-0 rounded-t-full border-2 border-[#27272a]" />
        <div
          className="absolute bottom-0 left-1/2 w-0.5 h-8 origin-bottom transition-transform duration-700"
          style={{
            background: severity,
            transform: `rotate(${rotation}deg) translateX(-50%)`,
          }}
        />
      </div>
      <p className="text-lg font-semibold tabular-nums" style={{ color: severity }}>
        {deviation >= 0 ? "+" : ""}{deviation.toFixed(2)}%
      </p>
      <p className="text-xs font-mono mt-0.5" style={{ color: severity }}>{statusLabel}</p>
      <p className="text-xs font-mono text-[#a3a3a3] mt-0.5">${price.toFixed(4)}</p>
    </div>
  );
}

export default function StablecoinUsdClient({ stablecoins, totalSupply: _totalSupply }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const supplyData = stablecoins.slice(0, 10).map((s, i) => ({
    name: s.symbol,
    value: s.circulatingUsd,
    color: STABLE_COLORS[i % STABLE_COLORS.length],
  }));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider mb-4">
          Peg Deviation (Price — $1.00)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {stablecoins.slice(0, 6).map((s) => (
            <PegGauge key={s.id} symbol={s.symbol} price={s.price} />
          ))}
        </div>
        <p className="text-xs text-[#52525b] font-mono mt-2">
          Deviation = (price — 1.00) × 100 · Tight: &lt;0.10% · Loose: 0.10–1.00% · Depegged: &gt;1.00%
        </p>
      </div>

      <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">
            Circulating Supply — Top 10 USD Stablecoins
          </h3>
          <p className="text-sm text-[#a3a3a3] font-mono mt-1">Source: DefiLlama stablecoins.llama.fi</p>
        </div>
        {mounted && supplyData.length > 0 ? (
          <SupplyHistogram data={supplyData} height={260} />
        ) : (
          <div className="flex items-center justify-center h-[260px] text-[#52525b] font-mono text-sm">
            {mounted ? "No data available" : "Rendering..."}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-[#161616] border border-[#27272a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sticky top-0 z-10 bg-[#161616] border-b border-[#27272a]">
              <th className="px-4 py-3 text-left font-semibold text-[#a3a3a3] uppercase tracking-wider w-8">#</th>
              <th className="px-4 py-3 text-left font-semibold text-[#a3a3a3] uppercase tracking-wider">Asset</th>
              <th className="px-4 py-3 text-left font-semibold text-[#a3a3a3] uppercase tracking-wider">Peg Type</th>
              <th className="px-4 py-3 text-right font-semibold text-[#a3a3a3] uppercase tracking-wider">Circulating</th>
              <th className="px-4 py-3 text-right font-semibold text-[#a3a3a3] uppercase tracking-wider">Deviation</th>
              <th className="px-4 py-3 text-right font-semibold text-[#a3a3a3] uppercase tracking-wider">24h %</th>
              <th className="px-4 py-3 text-right font-semibold text-[#a3a3a3] uppercase tracking-wider">7d %</th>
              <th className="px-4 py-3 text-left font-semibold text-[#a3a3a3] uppercase tracking-wider">Chains</th>
            </tr>
          </thead>
          <tbody>
            {stablecoins.map((s, i) => {
              const dev = s.price ? (s.price - 1) * 100 : 0;
              const devColor = Math.abs(dev) < 0.1 ? "#22c55e" : Math.abs(dev) < 1.0 ? "#f59e0b" : "#ef4444";
              return (
                <tr key={s.id} className={`border-b border-[#27272a] hover:bg-[#27272a] transition-colors duration-200 ${
                  i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#161616]"
                }`}>
                  <td className="px-4 py-3 text-[#52525b] font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#f8fafc]">{s.name}</span>
                      <span className="text-xs font-semibold text-[#22c55e] uppercase tracking-wider px-1.5 py-0.5 bg-[#22c55e]/10 rounded-full">
                        {s.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#a3a3a3] font-mono text-xs">{s.pegType}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-[#22c55e] tabular-nums">
                    {fmtUsd(s.circulatingUsd)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums" style={{ color: devColor }}>
                    {dev >= 0 ? "+" : ""}{dev.toFixed(3)}%
                  </td>
                  <td className="px-4 py-3 text-right"><PctCell v={s.change_1d} /></td>
                  <td className="px-4 py-3 text-right"><PctCell v={s.change_7d} /></td>
                  <td className="px-4 py-3 text-[#a3a3a3] font-mono text-xs">
                    {s.chains.slice(0, 3).join(", ")}
                    {s.chains.length > 3 && <span className="text-[#52525b]"> +{s.chains.length - 3}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#52525b] font-mono text-right">
        Source: DefiLlama stablecoins.llama.fi — USD-pegged only — Cached 1 hour
      </p>
    </div>
  );
}
