
// src/app/data/markets/liquidations/page.tsx (new sub‑page)
import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import { getCoinGlassLiquidations, getCoinGlassLiquidationStats, getExchangeOI } from "@/lib/coinglass";
import type { LiquidationRecord, ExchangeOI } from "@/lib/coinglass";

export const metadata = {
  title: "Exchange Liquidations | CryptoBrainNews",
  description: "Real‑time crypto futures liquidation data — ranked by exchange with 24h long/short breakdown.",
};
export const revalidate = 300;

interface ExchangeLiqSummary {
  exchange: string;
  longLiq24h: number;
  shortLiq24h: number;
  totalLiq24h: number;
  oiUsd: number;
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

async function LiquidationsData() {
  const [liquidations, stats, oiData] = await Promise.all([
    getCoinGlassLiquidations(100).catch(() => []),
    getCoinGlassLiquidationStats().catch(() => []),
    getExchangeOI().catch(() => []),
  ]);

  // Merge stats + OI
  const oiMap = new Map<string, number>();
  oiData.forEach((e: ExchangeOI) => oiMap.set(e.exchange, e.totalOiUsd));

  const merged: ExchangeLiqSummary[] = stats
    .filter((s) => s.totalLiq24h > 0)
    .map((s) => ({
      exchange: s.exchangeName,
      longLiq24h: s.longLiq24h,
      shortLiq24h: s.shortLiq24h,
      totalLiq24h: s.totalLiq24h,
      oiUsd: oiMap.get(s.exchangeName) ?? 0,
    }))
    .sort((a, b) => b.totalLiq24h - a.totalLiq24h);

  const totalLong  = stats.reduce((s, r) => s + r.longLiq24h, 0);
  const totalShort = stats.reduce((s, r) => s + r.shortLiq24h, 0);
  const isLive     = stats.length > 0;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Exchange Liquidations"
        description="Crypto futures liquidation data — ranked by exchange, 24h long/short breakdown, and live OI from CoinGlass."
      />

      <div className="flex items-center gap-3 flex-wrap">
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          isLive
            ? "border-[#00d672]/40 text-[#00d672]"
            : "border-[#FABF2C]/40 text-[#FABF2C]"
        }`}>
          {isLive ? "● Live — CoinGlass" : "◌ Check COINGLASS_API_KEY"}
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          Cached 5 min · Free tier: 50 data points/day
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Total Long Liq (24h)</p>
          <p className="text-2xl font-black text-[#ff4757] tabular-nums">{fmtUsd(totalLong)}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Total Short Liq (24h)</p>
          <p className="text-2xl font-black text-[#00d672] tabular-nums">{fmtUsd(totalShort)}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Exchanges Tracked</p>
          <p className="text-2xl font-black text-white tabular-nums">{merged.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Source</p>
          <p className="text-sm font-black text-[#FABF2C]">CoinGlass</p>
          <p className="text-[9px] font-mono text-[#555] mt-1">open-api-v2.coinglass.com</p>
        </div>
      </div>

      {merged.length > 0 ? (
        <div className="border border-[#1a1a1a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {["#", "Exchange", "24h Long Liq", "24h Short Liq", "Total 24h", "Open Interest"].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                    h === "#" || h === "Exchange" ? "text-left" : "text-right"
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merged.map((e, i) => (
                <tr key={e.exchange} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${
                  i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                }`}>
                  <td className="px-4 py-3 text-[#555] tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-white">{e.exchange}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-[#ff4757] tabular-nums">
                    {fmtUsd(e.longLiq24h)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black text-[#00d672] tabular-nums">
                    {fmtUsd(e.shortLiq24h)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black text-[#FABF2C] tabular-nums">
                    {fmtUsd(e.totalLiq24h)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {e.oiUsd > 0 ? fmtUsd(e.oiUsd) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-[#1a1a1a] p-12 text-center">
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
            No liquidation data — set COINGLASS_API_KEY to activate
          </p>
        </div>
      )}

      {liquidations.length > 0 && (
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 bg-[#ff4757] rounded-full animate-pulse" />
            Recent Liquidation Events
          </h3>
          <div className="border border-[#1a1a1a] overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-[#050505]">
                <tr className="border-b border-[#1a1a1a]">
                  <th className="px-4 py-2 text-left font-black text-[#555] uppercase">Exchange</th>
                  <th className="px-4 py-2 text-left font-black text-[#555] uppercase">Symbol</th>
                  <th className="px-4 py-2 text-left font-black text-[#555] uppercase">Side</th>
                  <th className="px-4 py-2 text-right font-black text-[#555] uppercase">Qty (USD)</th>
                  <th className="px-4 py-2 text-right font-black text-[#555] uppercase">Price</th>
                </tr>
              </thead>
              <tbody>
                {liquidations.map((l: LiquidationRecord, i: number) => (
                  <tr key={`${l.symbol}-${i}`} className={`border-b border-[#111] ${
                    i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                  }`}>
                    <td className="px-4 py-2 text-[#888]">{l.exchange}</td>
                    <td className="px-4 py-2 font-bold text-white">{l.symbol}</td>
                    <td className="px-4 py-2">
                      <span className={`font-mono font-black text-xs px-2 py-0.5 border ${
                        l.side === "Long"
                          ? "text-[#ff4757] border-[#ff4757]/30 bg-[#ff4757]/10"
                          : "text-[#00d672] border-[#00d672]/30 bg-[#00d672]/10"
                      }`}>{l.side}</span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-white">
                      {fmtUsd(l.qty)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums text-[#888]">
                      ${l.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[10px] text-[#333] font-mono text-right">
        Source: CoinGlass API · Free tier (50 data points/day) · Cached 5 min
      </p>
    </div>
  );
}

export default function LiquidationsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <LiquidationsData />
      </Suspense>
    </main>
  );
}
