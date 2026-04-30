"use client";

import React, { useState, useSyncExternalStore, useRef, useEffect } from "react";
import {
  createChart, AreaSeries, HistogramSeries, ColorType,
} from "lightweight-charts";
import type { IChartApi, DeepPartial, ChartOptions, AreaStyleOptions, SeriesOptionsCommon } from "lightweight-charts";
import { TimeframeSelector } from "../../../_components/TimeframeSelector";
import type { Timeframe } from "../../../_components/TimeframeSelector";
import type { DerivativeMarketData, FundingRateData } from "@/lib/types";
import type { OIHistoryPoint, FundingHistoryPoint } from "@/lib/market-data";
import type { LiquidationRecord } from "../page";

interface Props {
  exchanges: DerivativeMarketData[];
  fundingRates: FundingRateData[];
  oiHistory: OIHistoryPoint[];
  fundingHistory: FundingHistoryPoint[];
  liquidations: LiquidationRecord[];
}

function fmtUsd(v: unknown): string {
  const n = Number(v ?? 0);
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtNum(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const DARK_OPTIONS: DeepPartial<ChartOptions> = {
  layout: { background: { type: ColorType.Solid, color: "#161616" }, textColor: "#a3a3a3", fontFamily: "'Space Mono', monospace", fontSize: 10 },
  grid: { vertLines: { color: "#27272a" }, horzLines: { color: "#27272a" } },
  crosshair: { vertLine: { color: "#22c55e", width: 1, style: 3, labelBackgroundColor: "#22c55e" }, horzLine: { color: "#22c55e", width: 1, style: 3, labelBackgroundColor: "#22c55e" } },
  timeScale: { borderColor: "#27272a", timeVisible: false, fixLeftEdge: true, fixRightEdge: true },
  rightPriceScale: { borderColor: "#27272a", scaleMargins: { top: 0.1, bottom: 0.05 } },
  handleScroll: { mouseWheel: false, pressedMouseMove: false },
  handleScale: { mouseWheel: false, pinch: false, axisPressedMouseMove: false },
};

function MultiAxisOIChart({ data, height }: { data: OIHistoryPoint[]; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;
    const chart = createChart(containerRef.current, { ...DARK_OPTIONS, width: containerRef.current.clientWidth, height });
    chartRef.current = chart;

    const btcSeries = chart.addSeries(HistogramSeries, {
      color: "#F7931A",
      priceFormat: { type: 'volume' },
      priceScaleId: 'left',
    }, 0);

    const ethSeries = chart.addSeries(HistogramSeries, {
      color: "#627EEA",
      priceFormat: { type: 'volume' },
      priceScaleId: 'left',
    }, 0);

    btcSeries.setData(data.map((d) => ({ time: d.date, value: d.btc })));
    ethSeries.setData(data.map((d) => ({ time: d.date, value: d.eth })));
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

function MultiAreaChart({ data, height }: { data: FundingHistoryPoint[]; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;
    const chart = createChart(containerRef.current, { ...DARK_OPTIONS, width: containerRef.current.clientWidth, height });

    const btcSeries = chart.addSeries(AreaSeries, {
      lineColor: "#F7931A",
      topColor: "#F7931A33",
      bottomColor: "#F7931A00",
      lineWidth: 2,
    } as DeepPartial<AreaStyleOptions & SeriesOptionsCommon>);

    const ethSeries = chart.addSeries(AreaSeries, {
      lineColor: "#627EEA",
      topColor: "#627EEA33",
      bottomColor: "#627EEA00",
      lineWidth: 2,
    } as DeepPartial<AreaStyleOptions & SeriesOptionsCommon>);

    btcSeries.setData(data.map((d) => ({ time: d.date, value: d.btc })));
    ethSeries.setData(data.map((d) => ({ time: d.date, value: d.eth })));
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

export default function FuturesClient({
  exchanges, fundingRates, oiHistory, fundingHistory, liquidations,
}: Props) {
  const [tf, setTf] = useState<Timeframe>("30D");
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const totalVolume = exchanges.reduce((s, e) => s + (e.volume24h ?? 0), 0);
  const totalOi = exchanges.reduce((s, e) => s + (e.openInterest ?? 0), 0);
  const avgFunding = fundingRates.length > 0
    ? fundingRates.reduce((s, f) => s + (f.fundingRate ?? 0), 0) / fundingRates.length
    : 0;

  const totalLiqLong = liquidations.filter((l) => l.side === "Buy").reduce((s, l) => s + l.qty, 0);
  const totalLiqShort = liquidations.filter((l) => l.side === "Sell").reduce((s, l) => s + l.qty, 0);

  const days = tf === "7D" ? 7 : 30;
  const oiChartData = oiHistory.slice(-days);
  const frChartData = fundingHistory.slice(-days);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "24h Global Volume", value: `${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC`, accent: "#22c55e" },
          { label: "Total Open Interest", value: fmtUsd(totalOi), accent: "#22c55e" },
          { label: "Avg Funding Rate", value: `${avgFunding.toFixed(4)}%`, accent: avgFunding >= 0 ? "#22c55e" : "#ef4444" },
          { label: "Exchanges Tracked", value: String(exchanges.length), accent: "#a3a3a3" },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl bg-[#161616] border border-[#27272a] p-5">
            <p className="text-sm text-[#a3a3a3] uppercase tracking-wider font-mono mb-2">{s.label}</p>
            <p className="text-[28px] font-semibold font-mono tabular-nums" style={{ color: s.accent }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">Recent Liquidations (Bybit)</h3>
            <p className="text-sm text-[#a3a3a3] font-mono mt-1">Long = forced close of long positions, Short = forced close of short positions</p>
          </div>
          <span className="text-xs text-[#22c55e] font-mono tracking-wider bg-[#22c55e]/10 border border-[#22c55e]/30 px-2 py-1 rounded-full">Bybit v5</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="rounded-3xl bg-[#1a1a1a] border border-[#27272a] p-4">
            <p className="text-sm font-mono text-[#a3a3a3] uppercase mb-2">Long Liq. (Buy)</p>
            <p className="text-xl font-semibold text-[#ef4444] tabular-nums">{fmtNum(totalLiqLong)}</p>
          </div>
          <div className="rounded-3xl bg-[#1a1a1a] border border-[#27272a] p-4">
            <p className="text-sm font-mono text-[#a3a3a3] uppercase mb-2">Short Liq. (Sell)</p>
            <p className="text-xl font-semibold text-[#22c55e] tabular-nums">{fmtNum(totalLiqShort)}</p>
          </div>
          <div className="rounded-3xl bg-[#1a1a1a] border border-[#27272a] p-4">
            <p className="text-sm font-mono text-[#a3a3a3] uppercase mb-2">Record Count</p>
            <p className="text-xl font-semibold text-[#f8fafc] tabular-nums">{liquidations.length}</p>
          </div>
          <div className="rounded-3xl bg-[#1a1a1a] border border-[#27272a] p-4">
            <p className="text-sm font-mono text-[#a3a3a3] uppercase mb-2">Long/Short Ratio</p>
            <p className={`text-xl font-semibold tabular-nums ${totalLiqLong > totalLiqShort ? "text-[#ef4444]" : "text-[#22c55e]"}`}>
              {totalLiqShort > 0 ? (totalLiqLong / totalLiqShort).toFixed(1) : "—"}
            </p>
          </div>
        </div>

        {liquidations.length > 0 && (
          <div className="rounded-3xl border border-[#27272a] overflow-x-auto max-h-[320px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#161616] border-b border-[#27272a]">
                  <th className="px-4 py-2 text-left font-semibold text-[#a3a3a3] uppercase tracking-wider">Symbol</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#a3a3a3] uppercase tracking-wider">Side</th>
                  <th className="px-4 py-2 text-right font-semibold text-[#a3a3a3] uppercase tracking-wider">Qty (USD)</th>
                  <th className="px-4 py-2 text-right font-semibold text-[#a3a3a3] uppercase tracking-wider">Liq. Price</th>
                  <th className="px-4 py-2 text-right font-semibold text-[#a3a3a3] uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {liquidations.map((l, i) => (
                  <tr key={`${l.symbol}-${l.timestamp}-${i}`}
                    className={`border-b border-[#27272a] hover:bg-[#27272a] transition-colors duration-200 ${
                      i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#161616]"
                    }`}>
                    <td className="px-4 py-2 font-semibold text-[#f8fafc]">{l.symbol}</td>
                    <td className="px-4 py-2">
                      <span className={`font-mono font-semibold text-xs px-2 py-0.5 rounded-full ${
                        l.side === "Buy"
                          ? "text-[#ef4444] bg-[#ef4444]/15"
                          : "text-[#22c55e] bg-[#22c55e]/15"
                      }`}>
                        {l.side === "Buy" ? "Long" : "Short"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-[#f8fafc]">{fmtNum(l.qty)}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-[#a3a3a3]">
                      ${l.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-[#a3a3a3] text-xs">
                      {new Date(l.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-[#52525b] font-mono mt-3">Source: Bybit v5 /market/liq-records · Cached 5 min</p>
      </div>

      <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">BTC &amp; ETH Open Interest History</h3>
            <p className="text-sm text-[#a3a3a3] font-mono mt-1">Source: Bybit Futures</p>
          </div>
          <TimeframeSelector value={tf} onChange={setTf} available={["7D", "30D"]} />
        </div>
        {mounted && oiChartData.length > 0 ? (
          <MultiAxisOIChart data={oiChartData} height={260} />
        ) : (
          <div className="flex items-center justify-center h-[260px] text-[#52525b] font-mono text-sm">No OI data available</div>
        )}
      </div>

      <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">Avg Daily Funding Rate (BTC &amp; ETH)</h3>
          <p className="text-sm text-[#a3a3a3] font-mono mt-1">Source: Bybit Futures</p>
        </div>
        {mounted && frChartData.length > 0 ? (
          <MultiAreaChart data={frChartData} height={200} />
        ) : (
          <div className="flex items-center justify-center h-[200px] text-[#52525b] font-mono text-sm">No funding rate data</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-[#f8fafc] mb-4 flex items-center gap-3">
            <span className="w-2 h-2 bg-[#22c55e] rounded-full" />Top Exchanges
          </h3>
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#161616] border-b border-[#27272a]">
                  {["Exchange", "24h Volume", "Open Interest"].map((h) => (
                    <th key={h} className={`px-4 py-3 font-semibold text-[#a3a3a3] uppercase tracking-wider ${h === "Exchange" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exchanges.slice(0, 15).map((ex, i) => (
                  <tr key={ex.exchange} className={`border-b border-[#27272a] hover:bg-[#27272a] transition-colors duration-200 ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#161616]"}`}>
                    <td className="px-4 py-3 font-semibold text-[#f8fafc] capitalize">{ex.exchange}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-[#22c55e] tabular-nums">
                      {ex.volume24h ? `${ex.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#a3a3a3]">
                      {ex.openInterest ? `${ex.openInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#f8fafc] mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3"><span className="w-2 h-2 bg-[#22c55e] rounded-full" />Live Funding Rates</div>
            <span className="text-xs text-[#22c55e] font-mono tracking-wider bg-[#22c55e]/10 border border-[#22c55e]/30 px-2 py-1 rounded-full">Bybit</span>
          </h3>
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#161616] border-b border-[#27272a]">
                  {["Pair", "Mark Price", "Funding (8h)"].map((h) => (
                    <th key={h} className={`px-4 py-3 font-semibold text-[#a3a3a3] uppercase tracking-wider ${h === "Pair" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fundingRates.slice(0, 15).map((f, i) => {
                  const rate = f.fundingRate ?? 0;
                  const rateColor = rate > 0.01 ? "text-[#22c55e]" : rate < -0.01 ? "text-[#ef4444]" : "text-[#a3a3a3]";
                  return (
                    <tr key={f.symbol} className={`border-b border-[#27272a] hover:bg-[#27272a] transition-colors duration-200 ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#161616]"}`}>
                      <td className="px-4 py-3 font-semibold text-[#f8fafc]">{f.symbol}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#a3a3a3]">
                        ${Number(f.markPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold tabular-nums ${rateColor}`}>
                        {rate > 0 ? "+" : ""}{rate.toFixed(4)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
