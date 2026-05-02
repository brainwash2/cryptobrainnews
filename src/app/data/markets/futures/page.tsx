import React, { Suspense } from "react";
import { getDerivativesExchanges, getFundingRates } from "@/lib/derivatives";
import { getOIHistory, getFundingRateHistory }      from "@/lib/market-data";
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
  const [exchanges, fundingRates, oiHistory, fundingHistory, liquidations]: [
    DerivativeMarketData[],
    FundingRateData[],
    Awaited<ReturnType<typeof getOIHistory>>,
    Awaited<ReturnType<typeof getFundingRateHistory>>,
    LiquidationRecord[],
  ] = await Promise.all([
    getDerivativesExchanges().catch(() => []),
    getFundingRates().catch(() => []),
    getOIHistory(30).catch(() => []),
    getFundingRateHistory(30).catch(() => []),
    fetchBybitLiquidations(),
  ]);

  const latestOI = oiHistory.length > 0 ? oiHistory[oiHistory.length - 1] : null;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Futures & Perpetuals"
        description="Live derivatives volumes, open interest history, perpetual funding rates, and liquidations."
      />

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
