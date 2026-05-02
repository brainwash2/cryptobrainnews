import React, { Suspense } from "react";
import { getDerivativesExchanges, getFundingRates } from "@/lib/derivatives";
import { getOIHistory, getFundingRateHistory }      from "@/lib/market-data";
import { cached }                                    from "@/lib/cache";
import { ChartSkeleton }                             from "../../_components/ChartSkeleton";
import { DataHeader }                                from "../../_components/DataHeader";
import FuturesClient                                 from "./_components/FuturesClient";
import type { DerivativeMarketData, FundingRateData } from "@/lib/types";

export const metadata = { title: "Futures & Perpetuals | CryptoBrainNews" };
export const revalidate = 300;

export interface LiquidationRecord {
  symbol:    string;
  side:      "Buy" | "Sell";
  qty:       number;
  price:     number;
  timestamp: string;
}

// ── Unit 1: CME BTC Futures Open Interest (CFTC) ──────────────────────────────

interface CmeBtcOI {
  current:    number;
  prev:       number;
  reportDate: string;
  source:     "live" | "reference";
}

const CME_BTC_OI_REFERENCE: CmeBtcOI = {
  current: 26_450, prev: 25_100, reportDate: "2026-03-18", source: "reference",
};

async function fetchCmeBtcOI(): Promise<CmeBtcOI> {
  return cached("cme:btc:oi:v1", async () => {
    try {
      const url =
        `https://publicreporting.cftc.gov/resource/72hh-3qpy.json` +
        `?$where=upper(market_and_exchange_names)%20like%20'%25BITCOIN%25'` +
        `&$order=report_date_as_yyyy_mm_dd%20DESC&$limit=2`;
      const res = await fetch(url, {
        headers: { "Accept": "application/json", "X-App-Token": "cftc-public" },
        next: { revalidate: 86400 },
      });
      if (!res.ok) return CME_BTC_OI_REFERENCE;
      const rows = await res.json() as Record<string, string>[];
      if (rows.length < 1) return CME_BTC_OI_REFERENCE;
      const n = (s: string) => parseInt((s ?? "0").replace(/,/g, ""), 10) || 0;
      const current = n(rows[0].open_interest_all);
      const prev    = rows.length >= 2 ? n(rows[1].open_interest_all) : current;
      const date    = rows[0].report_date_as_yyyy_mm_dd?.slice(0, 10) ?? "";
      if (current === 0) return CME_BTC_OI_REFERENCE;
      return { current, prev, reportDate: date, source: "live" };
    } catch {
      return CME_BTC_OI_REFERENCE;
    }
  }, 86400);
}

async function fetchBybitLiquidations(): Promise<LiquidationRecord[]> {
  try {
    const res = await fetch(
      "https://api.bybit.com/v5/market/liq-records?category=linear&limit=50",
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const json = await res.json() as {
      retCode: number;
      result?: { list?: Array<{ symbol: string; side: string; qty: string; price: string; updatedTime: string }> };
    };
    const list = json.result?.list ?? [];
    return list.map((r) => ({
      symbol:    r.symbol,
      side:      r.side as "Buy" | "Sell",
      qty:       parseFloat(r.qty),
      price:     parseFloat(r.price),
      timestamp: new Date(parseInt(r.updatedTime)).toISOString(),
    }));
  } catch {
    return [];
  }
}

function fmtOI(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

async function FuturesData() {
  const [exchanges, fundingRates, oiHistory, fundingHistory, liquidations, cmeBtcOI]: [
    DerivativeMarketData[],
    FundingRateData[],
    Awaited<ReturnType<typeof getOIHistory>>,
    Awaited<ReturnType<typeof getFundingRateHistory>>,
    LiquidationRecord[],
    CmeBtcOI,
  ] = await Promise.all([
    getDerivativesExchanges().catch(() => []),
    getFundingRates().catch(() => []),
    getOIHistory(30).catch(() => []),
    getFundingRateHistory(30).catch(() => []),
    fetchBybitLiquidations(),
    fetchCmeBtcOI(),
  ]);

  const latestOI    = oiHistory.length > 0 ? oiHistory[oiHistory.length - 1] : null;
  const oiChange    = cmeBtcOI.prev > 0 ? ((cmeBtcOI.current - cmeBtcOI.prev) / cmeBtcOI.prev) * 100 : 0;
  const oiTrend     = oiChange > 0 ? "▲" : oiChange < 0 ? "▼" : "—";
  const oiTrendClr  = oiChange > 0 ? "#00d672" : oiChange < 0 ? "#ff4d4f" : "#555";

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Futures & Perpetuals"
        description="Live derivatives volumes, open interest history, perpetual funding rates, and liquidations."
      />

      {/* Unit 1 — CME BTC Futures OI */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            CME BTC Futures — Open Interest
          </h3>
          <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
            cmeBtcOI.source === "live"
              ? "border-[#00d672]/40 text-[#00d672]"
              : "border-[#FABF2C]/40 text-[#FABF2C]"
          }`}>
            {cmeBtcOI.source === "live" ? "● Live — CFTC" : "◌ Reference — Q1 2026"}
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#080808] border border-[#1a1a1a] p-4">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Current OI</p>
            <p className="text-2xl font-black text-[#FABF2C] tabular-nums">
              {cmeBtcOI.current.toLocaleString()}
            </p>
            <p className="text-[10px] font-mono text-[#555] mt-1">contracts</p>
          </div>
          <div className="bg-[#080808] border border-[#1a1a1a] p-4">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">7-Day Change</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: oiTrendClr }}>
              {oiTrend} {Math.abs(oiChange).toFixed(1)}%
            </p>
            <p className="text-[10px] font-mono text-[#555] mt-1">
              prev: {cmeBtcOI.prev.toLocaleString()}
            </p>
          </div>
          <div className="bg-[#080808] border border-[#1a1a1a] p-4">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Report Date</p>
            <p className="text-xl font-black text-white tabular-nums">{cmeBtcOI.reportDate}</p>
            <p className="text-[10px] font-mono text-[#555] mt-1">weekly CFTC release</p>
          </div>
          <div className="bg-[#080808] border border-[#1a1a1a] p-4">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Sentiment</p>
            <p className="text-xl font-black tabular-nums" style={{ color: oiTrendClr }}>
              {oiChange > 5 ? "Accumulating" : oiChange < -5 ? "Reducing" : "Stable"}
            </p>
            <p className="text-[10px] font-mono text-[#555] mt-1">institutional positioning</p>
          </div>
        </div>
        <p className="text-[9px] text-[#333] font-mono mt-3">
          Source: CFTC Socrata API · Disaggregated futures · Cached 24 h
        </p>
      </div>

      {latestOI && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "BTC Open Interest",   value: fmtOI(latestOI.btc),                    color: "#FABF2C", sub: "Bybit BTCUSDT" },
            { label: "ETH Open Interest",   value: fmtOI(latestOI.eth),                    color: "#3b82f6", sub: "Bybit ETHUSDT" },
            { label: "BTC + ETH Combined",  value: fmtOI(latestOI.btc + latestOI.eth),     color: "#fff",   sub: `As of ${latestOI.date}` },
          ].map((s) => (
            <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      <FuturesClient
        exchanges={exchanges}
        fundingRates={fundingRates}
        oiHistory={oiHistory}
        fundingHistory={fundingHistory}
        liquidations={liquidations}
      />
    </div>
  );
}

export default function FuturesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <FuturesData />
      </Suspense>
    </main>
  );
}
