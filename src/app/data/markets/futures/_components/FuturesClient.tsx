"use client";

import React, { useState, useSyncExternalStore } from "react";
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import { TimeframeSelector }      from "../../../_components/TimeframeSelector";
import type { Timeframe }          from "../../../_components/TimeframeSelector";
import type { DerivativeMarketData, FundingRateData } from "@/lib/types";
import type { OIHistoryPoint, FundingHistoryPoint }   from "@/lib/market-data";
import type { LiquidationRecord }  from "../page";

interface Props {
  exchanges:      DerivativeMarketData[];
  fundingRates:   FundingRateData[];
  oiHistory:      OIHistoryPoint[];
  fundingHistory: FundingHistoryPoint[];
  liquidations:   LiquidationRecord[];
}

function fmtUsd(v: unknown): string {
  const n = Number(v ?? 0);
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtNum(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const CHART_STYLE = { grid: "#1a1a1a", axis: "#444", btc: "#FABF2C", eth: "#3b82f6" };

interface TooltipPayloadItem { name: string; value: number }
interface ChartTooltipProps { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }

function OITooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs font-mono">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-white">
          <span style={{ color: p.name.includes("BTC") ? CHART_STYLE.btc : CHART_STYLE.eth }}>{p.name.toUpperCase()}</span>:{" "}
          <span className="font-black">${(p.value / 1e9).toFixed(2)}B</span>
        </p>
      ))}
    </div>
  );
}

function FRTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs font-mono">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-white">
          <span style={{ color: p.name.includes("BTC") ? CHART_STYLE.btc : CHART_STYLE.eth }}>{p.name.toUpperCase()}</span>:{" "}
          <span className="font-black">{p.value.toFixed(4)}%</span>
        </p>
      ))}
    </div>
  );
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function FuturesClient({
  exchanges, fundingRates, oiHistory, fundingHistory, liquidations,
}: Props) {
  const [tf, setTf] = useState<Timeframe>("30D");
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const totalVolume = exchanges.reduce((s, e) => s + (e.volume24h ?? 0), 0);
  const totalOi     = exchanges.reduce((s, e) => s + (e.openInterest ?? 0), 0);
  const avgFunding  = fundingRates.length > 0
    ? fundingRates.reduce((s, f) => s + (f.fundingRate ?? 0), 0) / fundingRates.length
    : 0;

  const totalLiqLong  = liquidations.filter((l) => l.side === "Buy").reduce((s, l) => s + l.qty, 0);
  const totalLiqShort = liquidations.filter((l) => l.side === "Sell").reduce((s, l) => s + l.qty, 0);

  const days        = tf === "7D" ? 7 : 30;
  const oiChartData = oiHistory.slice(-days);
  const frChartData = fundingHistory.slice(-days);

  return (
    <div className="space-y-10">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "24h Global Volume",   value: `${totalVolume.toLocaleString(undefined,{maximumFractionDigits:0})} BTC`, accent: "#FABF2C" },
          { label: "Total Open Interest", value: fmtUsd(totalOi),             accent: "#FABF2C" },
          { label: "Avg Funding Rate",    value: `${avgFunding.toFixed(4)}%`, accent: avgFunding >= 0 ? "#00d672" : "#ff4757" },
          { label: "Exchanges Tracked",   value: String(exchanges.length),    accent: "#888" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.accent }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#ff4757] pl-3">
              Recent Liquidations (Bybit)
            </h3>
            <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
              Long = forced close of long positions, Short = forced close of short positions
            </p>
          </div>
          <span className="text-[9px] text-[#FABF2C] font-mono tracking-widest bg-[#FABF2C]/10 border border-[#FABF2C]/30 px-2 py-1">
            Bybit v5
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="border border-[#1a1a1a] bg-[#080808] p-4">
            <p className="text-[9px] font-mono text-[#555] uppercase mb-2">Long Liq. (Buy)</p>
            <p className="text-xl font-black text-[#ff4757] tabular-nums">{fmtNum(totalLiqLong)}</p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#080808] p-4">
            <p className="text-[9px] font-mono text-[#555] uppercase mb-2">Short Liq. (Sell)</p>
            <p className="text-xl font-black text-[#00d672] tabular-nums">{fmtNum(totalLiqShort)}</p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#080808] p-4">
            <p className="text-[9px] font-mono text-[#555] uppercase mb-2">Record Count</p>
            <p className="text-xl font-black text-white tabular-nums">{liquidations.length}</p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#080808] p-4">
            <p className="text-[9px] font-mono text-[#555] uppercase mb-2">Long/Short Ratio</p>
            <p className={`text-xl font-black tabular-nums ${totalLiqLong > totalLiqShort ? "text-[#ff4757]" : "text-[#00d672]"}`}>
              {totalLiqShort > 0 ? (totalLiqLong / totalLiqShort).toFixed(1) : "—"}
            </p>
          </div>
        </div>

        {liquidations.length > 0 && (
          <div className="border border-[#1a1a1a] overflow-x-auto max-h-[320px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-[#050505]">
                <tr className="border-b border-[#1a1a1a]">
                  <th className="px-4 py-2 text-left font-black text-[#555] uppercase tracking-widest">Symbol</th>
                  <th className="px-4 py-2 text-left font-black text-[#555] uppercase tracking-widest">Side</th>
                  <th className="px-4 py-2 text-right font-black text-[#555] uppercase tracking-widest">Qty (USD)</th>
                  <th className="px-4 py-2 text-right font-black text-[#555] uppercase tracking-widest">Liq. Price</th>
                  <th className="px-4 py-2 text-right font-black text-[#555] uppercase tracking-widest">Time</th>
                </tr>
              </thead>
              <tbody>
                {liquidations.map((l, i) => (
                  <tr key={`${l.symbol}-${l.timestamp}-${i}`}
                    className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                      i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                    }`}>
                    <td className="px-4 py-2 font-bold text-white">{l.symbol}</td>
                    <td className="px-4 py-2">
                      <span className={`font-mono font-black text-xs px-2 py-0.5 border ${
                        l.side === "Buy"
                          ? "text-[#ff4757] border-[#ff4757]/30 bg-[#ff4757]/10"
                          : "text-[#00d672] border-[#00d672]/30 bg-[#00d672]/10"
                      }`}>
                        {l.side === "Buy" ? "Long" : "Short"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-white">
                      {fmtNum(l.qty)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-[#888]">
                      ${l.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-[#555] text-[10px]">
                      {new Date(l.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[9px] text-[#333] font-mono mt-3">
          Source: Bybit v5 /market/liq-records · Cached 5 min
        </p>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
              BTC &amp; ETH Open Interest History
            </h3>
            <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">Source: Bybit Futures</p>
          </div>
          <TimeframeSelector value={tf} onChange={setTf} available={["7D", "30D"]} />
        </div>
        <div className="h-72">
          {mounted && oiChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={oiChartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} vertical={false} />
                <XAxis dataKey="date" stroke={CHART_STYLE.axis} fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke={CHART_STYLE.axis} fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => `$${(v / 1e9).toFixed(0)}B`} />
                <Tooltip content={<OITooltip />} cursor={{ fill: "#ffffff08" }} />
                <Legend iconType="line" wrapperStyle={{ fontSize: 10, fontFamily: "monospace", textTransform: "uppercase" }} />
                <Bar dataKey="btc" name="BTC OI" fill={CHART_STYLE.btc} opacity={0.7} isAnimationActive={false} />
                <Bar dataKey="eth" name="ETH OI" fill={CHART_STYLE.eth} opacity={0.7} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#333] font-mono text-xs uppercase">
              {oiChartData.length === 0 ? "No OI data available" : "Loading chart..."}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#00d672] pl-3">
              Avg Daily Funding Rate (BTC &amp; ETH)
            </h3>
            <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">Source: Bybit Futures</p>
          </div>
        </div>
        <div className="h-52">
          {mounted && frChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={frChartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="frBtc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={CHART_STYLE.btc} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_STYLE.btc} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="frEth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={CHART_STYLE.eth} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_STYLE.eth} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} vertical={false} />
                <XAxis dataKey="date" stroke={CHART_STYLE.axis} fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke={CHART_STYLE.axis} fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => `${v.toFixed(3)}%`} />
                <Tooltip content={<FRTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Legend iconType="line" wrapperStyle={{ fontSize: 10, fontFamily: "monospace", textTransform: "uppercase" }} />
                <Area type="monotone" dataKey="btc" name="BTC" stroke={CHART_STYLE.btc} fill="url(#frBtc)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="eth" name="ETH" stroke={CHART_STYLE.eth} fill="url(#frEth)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#333] font-mono text-xs uppercase">
              {frChartData.length === 0 ? "No funding rate data" : "Loading chart..."}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />Top Exchanges
          </h3>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                  {["Exchange", "24h Volume", "Open Interest"].map((h) => (
                    <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${h === "Exchange" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exchanges.slice(0, 15).map((ex, i) => (
                  <tr key={ex.exchange} className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"}`}>
                    <td className="px-4 py-3 font-bold text-white capitalize">{ex.exchange}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-[#FABF2C] tabular-nums">
                      {ex.volume24h ? `${ex.volume24h.toLocaleString(undefined,{maximumFractionDigits:0})} BTC` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {ex.openInterest ? `${ex.openInterest.toLocaleString(undefined,{maximumFractionDigits:0})} BTC` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3"><span className="w-2 h-2 bg-[#00d672] rounded-full animate-pulse" />Live Funding Rates</div>
            <span className="text-[9px] text-[#00d672] font-mono tracking-widest bg-[#00d672]/10 border border-[#00d672]/30 px-2 py-1">Bybit</span>
          </h3>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                  {["Pair", "Mark Price", "Funding (8h)"].map((h) => (
                    <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${h === "Pair" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fundingRates.slice(0, 15).map((f, i) => {
                  const rate = f.fundingRate ?? 0;
                  const rateColor = rate > 0.01 ? "text-[#00d672]" : rate < -0.01 ? "text-[#ff4757]" : "text-[#888]";
                  return (
                    <tr key={f.symbol} className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"}`}>
                      <td className="px-4 py-3 font-bold text-white">{f.symbol}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                        ${Number(f.markPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold tabular-nums ${rateColor}`}>
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
