import React, { Suspense }  from "react";
import { DataHeader }        from "../../_components/DataHeader";
import { ChartSkeleton }     from "../../_components/ChartSkeleton";
import PricesClient          from "./_components/PricesClient";
import {
  getGlobalMarketData,
  getFearAndGreedIndex,
  getTopCoinsExtended,
} from "@/lib/market-data";

export const metadata = {
  title: "Crypto Prices & Market Health | CryptoBrainNews",
  description: "Total market cap, BTC/ETH dominance, Fear & Greed 90D history, trending coins, and multi-timeframe price performance.",
};
export const revalidate = 300;

export interface TrendingCoin {
  id:              string;
  symbol:          string;
  name:            string;
  market_cap_rank: number | null;
  thumb:           string;
  score:           number;
}

async function fetchTrendingCoins(): Promise<TrendingCoin[]> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/search/trending",
      { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json() as {
      coins?: Array<{
        item: {
          id: string; symbol: string; name: string;
          market_cap_rank: number | null; thumb: string; score: number;
        };
      }>;
    };
    return (json.coins ?? []).map((c) => c.item).slice(0, 15);
  } catch {
    return [];
  }
}

export interface FngHistoryPoint {
  date:  string;
  value: number;
  classification: string;
}

async function fetchFngHistory(): Promise<FngHistoryPoint[]> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=90",
      { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json() as {
      data?: Array<{ value: string; value_classification: string; timestamp: string }>;
    };
    return (json.data ?? []).map((d) => ({
      date:           new Date(parseInt(d.timestamp) * 1000).toISOString().slice(0, 10),
      value:          parseInt(d.value, 10),
      classification: d.value_classification,
    })).reverse();
  } catch {
    return [];
  }
}

async function PricesData() {
  const [globalData, fearAndGreed, coins, trending, fngHistory] = await Promise.all([
    getGlobalMarketData(),
    getFearAndGreedIndex(),
    getTopCoinsExtended(100),
    fetchTrendingCoins(),
    fetchFngHistory(),
  ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Prices & Market Health"
        description="Total market cap, dominance, Fear & Greed 90D trend, trending coins, and cross-timeframe performance."
      />
      <PricesClient
        globalData={globalData}
        fearAndGreed={fearAndGreed}
        coins={coins}
        trending={trending}
        fngHistory={fngHistory}
      />
    </div>
  );
}

export default function PricesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <PricesData />
      </Suspense>
    </main>
  );
}
