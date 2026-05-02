import React, { Suspense } from "react";
import { getDerivativesExchanges, getFundingRates } from "@/lib/derivatives";
import { getOIHistory, getFundingRateHistory }      from "@/lib/market-data";
import { ChartSkeleton }                             from "../../_components/ChartSkeleton";
import { DataHeader }                                from "../../_components/DataHeader";
import { FreshnessBadge }                            from "@/components/common/FreshnessBadge";
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

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Futures & Perpetuals"
        description="Live derivatives volumes, open interest history, perpetual funding rates, and liquidations."
      />
      <div className="flex items-center gap-3">
        <FreshnessBadge ttlSeconds={300} />
      </div>
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
