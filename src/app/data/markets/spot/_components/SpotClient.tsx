"use client";

import React, { useState, useEffect } from "react";
import { TimeframeSelector }  from "../../../_components/TimeframeSelector";
import type { Timeframe }     from "../../../_components/TimeframeSelector";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import type {
  GlobalMarketData,
  FearAndGreedData,
  ExtendedCoinData,
  CoinGeckoExchange,
} from "@/lib/market-data";

interface Props {
  globalData:   GlobalMarketData | null;
  fearAndGreed: FearAndGreedData | null;
  coins:        ExtendedCoinData[];
  exchanges:    CoinGeckoExchange[];
}

/* ── Formatters ─────────────────────────────────────────────────────────── */

function fmtUsd(n: number | null | undefined, decimals = 2): string {
  if (n === null || n === undefined || isNaN(n)) return "-";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(decimals)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(decimals)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number | null | undefined): React.ReactNode {
  if (n === null || n === undefined || isNaN(n)) {
    return <span className="text-[#555]">-</span>;
  }
  const pos = n >= 0;
  return (
    <span className={`font-mono font-bold tabular-nums ${pos ? "text-[#00d672]" : "text-[#ff4757]"}`}>
      {pos ? "+" : ""}{n.toFixed(2)}%
    </span>
  );
}

function pctKey(tf: Timeframe): keyof ExtendedCoinData {
  if (tf === "1D")  return "price_change_percentage_24h_in_currency";
  if (tf === "7D")  return "price_change_percentage_7d_in_currency";
  if (tf === "30D") return "price_change_percentage_30d_in_currency";
  return "price_change_percentage_24h_in_currency";
}

function fngColor(val: string): string {
  const v = parseInt(val, 10);
  if (v >= 75) return "text-[#00d672]";
  if (v >= 55) return "text-[#22c55e]";
  if (v >= 45) return "text-[#FABF2C]";
  if (v >= 25) return "text-[#f97316]";
  return "text-[#ff4757]";
}

/* ── Shared chart tooltip ─────────────────────────────────────────────────
   Use plain `any` for Recharts tooltip props — Recharts types payload as
   `readonly Payload<V,N>[]` which conflicts with mutable array types.
   This is the idiomatic workaround used across the codebase (see BlockChartCard).
──────────────────────────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PctTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const v: number = payload[0].value;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-mono font-black ${v >= 0 ? "text-[#00d672]" : "text-[#ff4757]"}`}>
        {v >= 0 ? "+" : ""}{v.toFixed(2)}%
      </p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BtcTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-xs">
      <p className="text-[#888] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono font-black text-[#FABF2C]">
        {Number(payload[0].value).toLocaleString()} BTC
      </p>
    </div>
  );
}

/* ── Chart 1: Top 12 Movers (timeframe-controlled) ──────────────────────── */

function PerformanceChart({
  coins,
  tf,
  mounted,
}: {
  coins:   ExtendedCoinData[];
  tf:      Timeframe;
  mounted: boolean;
}) {
  const data = [...coins]
    .map((c) => ({
      name:   c.symbol.toUpperCase(),
      change: Number(c[pctKey(tf)] ?? 0),
    }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 12);

  if (!mounted) return (
    <div className="h-[200px] flex items-center justify-center text-[#333] font-mono text-xs uppercase animate-pulse">
      Rendering...
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
        <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} width={40} />
        <ReferenceLine y={0} stroke="#2a2a2a" strokeWidth={1} />
        <Tooltip content={<PctTooltip />} cursor={{ fill: "#ffffff08" }} />
        <Bar dataKey="change" maxBarSize={32} radius={[2, 2, 0, 0]} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell key={`perf-${i}`} fill={entry.change >= 0 ? "#00d672" : "#ff4757"} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Chart 2: Top 10 Exchanges by 24h Volume ─────────────────────────────── */

function ExchangeVolumeChart({
  exchanges,
  mounted,
}: {
  exchanges: CoinGeckoExchange[];
  mounted:   boolean;
}) {
  const data = [...exchanges]
    .slice(0, 10)
    .map((ex) => ({
      name:   ex.name.length > 10 ? ex.name.slice(0, 10) + "..." : ex.name,
      volume: Math.round(ex.trade_volume_24h_btc),
    }))
    .sort((a, b) => b.volume - a.volume);

  if (!mounted) return (
    <div className="h-[200px] flex items-center justify-center text-[#333] font-mono text-xs uppercase animate-pulse">
      Rendering...
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -4, bottom: 0 }}>
        <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#555" fontSize={9} tickLine={false} axisLine={false} fontFamily="monospace" />
        <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} width={40} />
        <Tooltip content={<BtcTooltip />} cursor={{ fill: "#ffffff08" }} />
        <Bar dataKey="volume" fill="#FABF2C" fillOpacity={0.8} maxBarSize={36} radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Chart 3: Market Cap Dominance ───────────────────────────────────────── */

const DOM_COLORS: Record<string, string> = {
  BTC:    "#F7931A",
  ETH:    "#627EEA",
  USDT:   "#26A17B",
  BNB:    "#F3BA2F",
  SOL:    "#9945FF",
  USDC:   "#2775CA",
  XRP:    "#00AAE4",
  OTHERS: "#555555",
};

function DominanceChart({
  globalData,
  mounted,
}: {
  globalData: GlobalMarketData | null;
  mounted:    boolean;
}) {
  const pct   = globalData?.market_cap_percentage ?? {};
  const SHOW  = ["btc", "eth", "usdt", "bnb", "sol", "usdc", "xrp"];
  const known = SHOW
    .map((k) => ({ name: k.toUpperCase(), pct: Number(pct[k] ?? 0) }))
    .filter((d) => d.pct > 0);
  const knownSum = known.reduce((s, d) => s + d.pct, 0);
  const data = [...known, { name: "OTHERS", pct: Math.max(0, 100 - knownSum) }];

  if (!mounted) return (
    <div className="h-[200px] flex items-center justify-center text-[#333] font-mono text-xs uppercase animate-pulse">
      Rendering...
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
        <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v.toFixed(0)}%`} width={36} />
        <Tooltip content={<PctTooltip />} cursor={{ fill: "#ffffff08" }} />
        <Bar dataKey="pct" maxBarSize={44} radius={[2, 2, 0, 0]} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell key={`dom-${i}`} fill={DOM_COLORS[entry.name] ?? "#888"} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */

export default function SpotClient({ globalData, fearAndGreed, coins, exchanges }: Props) {
  const [tf, setTf]           = useState<Timeframe>("1D");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalMcap     = globalData?.total_market_cap?.usd ?? 0;
  const total24hVol   = globalData?.total_volume?.usd ?? 0;
  const btcDom        = globalData?.market_cap_percentage?.btc ?? 0;
  const ethDom        = globalData?.market_cap_percentage?.eth ?? 0;
  const mcapChange24h = globalData?.market_cap_change_percentage_24h_usd ?? 0;
  const fng           = fearAndGreed;

  const sortedCoins = [...coins].sort((a, b) => {
    const aVal = Number(a[pctKey(tf)] ?? -999);
    const bVal = Number(b[pctKey(tf)] ?? -999);
    return bVal - aVal;
  });

  return (
    <div className="space-y-10">

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Total Market Cap",
            value: fmtUsd(totalMcap),
            sub: `${mcapChange24h >= 0 ? "+" : ""}${mcapChange24h.toFixed(2)}% (24h)`,
            subColor: mcapChange24h >= 0 ? "text-[#00d672]" : "text-[#ff4757]",
          },
          {
            label: "24h Volume",
            value: fmtUsd(total24hVol),
            sub: "Global spot",
            subColor: "text-[#888]",
          },
          {
            label: "BTC Dominance",
            value: `${btcDom.toFixed(1)}%`,
            sub: "of total market cap",
            subColor: "text-[#888]",
          },
          {
            label: "ETH Dominance",
            value: `${ethDom.toFixed(1)}%`,
            sub: "of total market cap",
            subColor: "text-[#888]",
          },
          {
            label: "Fear & Greed",
            value: fng ? fng.value : "-",
            sub: fng?.value_classification ?? "N/A",
            subColor: fng ? fngColor(fng.value) : "text-[#888]",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-[#FABF2C] tabular-nums leading-none">
              {stat.value}
            </p>
            <p className={`text-[10px] font-mono mt-2 ${stat.subColor}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart row 1: Movers + Dominance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-[10px] font-black text-[#555] uppercase tracking-widest">
                Top Movers
              </h3>
              <p className="text-[9px] text-[#333] font-mono mt-0.5 uppercase">
                Top 12 by absolute {tf} change
              </p>
            </div>
            <TimeframeSelector value={tf} onChange={setTf} available={["1D", "7D", "30D"]} />
          </div>
          <PerformanceChart coins={coins} tf={tf} mounted={mounted} />
        </div>

        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <div className="mb-4">
            <h3 className="text-[10px] font-black text-[#555] uppercase tracking-widest">
              Market Cap Dominance
            </h3>
            <p className="text-[9px] text-[#333] font-mono mt-0.5 uppercase">
              % share of total market cap - Source: CoinGecko
            </p>
          </div>
          <DominanceChart globalData={globalData} mounted={mounted} />
        </div>
      </div>

      {/* Chart row 2: Exchange Volume */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
        <div className="mb-4">
          <h3 className="text-[10px] font-black text-[#555] uppercase tracking-widest">
            Top 10 CEX - 24h Volume (BTC)
          </h3>
          <p className="text-[9px] text-[#333] font-mono mt-0.5 uppercase">
            Source: CoinGecko exchanges API - Cached 1 hr
          </p>
        </div>
        <ExchangeVolumeChart exchanges={exchanges} mounted={mounted} />
      </div>

      {/* Top 50 Coins Table */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
            Top 50 Assets
          </h3>
          <TimeframeSelector value={tf} onChange={setTf} available={["1D", "7D", "30D"]} />
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {["#", "Asset", "Price", "1h%", `${tf} Perf`, "Market Cap", "24h Volume"].map((h) => (
                  <th
                    key={h}
                    className={[
                      "px-4 py-3 font-black text-[#555] uppercase tracking-widest whitespace-nowrap",
                      h === "Asset" || h === "#" ? "text-left" : "text-right",
                      h === `${tf} Perf` ? "text-[#FABF2C]" : "",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCoins.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[#555] font-mono text-xs uppercase tracking-widest">
                    Syncing market data...
                  </td>
                </tr>
              )}
              {sortedCoins.map((coin, i) => {
                const tfPct = coin[pctKey(tf)] as number | null;
                const h1Pct = coin.price_change_percentage_1h_in_currency;
                const price = coin.current_price;
                return (
                  <tr
                    key={coin.id}
                    className={[
                      "border-b border-[#111] hover:bg-[#0f0f0f] transition-colors",
                      i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3 text-[#555] tabular-nums w-10">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {coin.image && (
                          <img src={coin.image} alt={coin.symbol} width={20} height={20} className="rounded-full shrink-0" />
                        )}
                        <span className="font-bold text-white">{coin.name}</span>
                        <span className="text-[#555] uppercase text-[10px]">{coin.symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-white">
                      {price >= 1
                        ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : price > 0
                          ? `$${price.toFixed(price < 0.001 ? 8 : price < 0.01 ? 6 : 4)}`
                          : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">{fmtPct(h1Pct)}</td>
                    <td className="px-4 py-3 text-right">{fmtPct(tfPct)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">{fmtUsd(coin.market_cap)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">{fmtUsd(coin.total_volume)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">Source: CoinGecko - Cached 5 min</p>
      </div>

      {/* CEX Rankings Table */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#00d672] rounded-full" />
          CEX Rankings by 24h Volume
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {["#", "Exchange", "Country", "Trust Score", "24h Volume (BTC)", "24h Vol Norm"].map((h) => (
                  <th
                    key={h}
                    className={[
                      "px-4 py-3 font-black text-[#555] uppercase tracking-widest",
                      h === "Exchange" || h === "#" ? "text-left" : "text-right",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exchanges.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#555] font-mono text-xs uppercase">
                    Syncing exchange data...
                  </td>
                </tr>
              )}
              {exchanges.map((ex, i) => (
                <tr
                  key={ex.id}
                  className={[
                    "border-b border-[#111] hover:bg-[#0f0f0f] transition-colors",
                    i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]",
                  ].join(" ")}
                >
                  <td className="px-4 py-3 text-[#555] tabular-nums w-10">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-white">{ex.name}</td>
                  <td className="px-4 py-3 text-right text-[#888]">{ex.country ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    {ex.trust_score !== null ? (
                      <span className={`font-mono font-bold ${
                        (ex.trust_score ?? 0) >= 8 ? "text-[#00d672]" :
                        (ex.trust_score ?? 0) >= 5 ? "text-[#FABF2C]" : "text-[#ff4757]"
                      }`}>
                        {ex.trust_score}/10
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#FABF2C]">
                    {ex.trade_volume_24h_btc?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "-"} BTC
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {ex.trade_volume_24h_btc_normalized?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "-"} BTC
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">Source: CoinGecko - Cached 1 hr</p>
      </div>

    </div>
  );
}