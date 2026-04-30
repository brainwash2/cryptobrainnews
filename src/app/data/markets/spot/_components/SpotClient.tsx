"use client";

import React, { useState, useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import { TimeframeSelector } from "../../../_components/TimeframeSelector";
import type { Timeframe } from "../../../_components/TimeframeSelector";
import TvLightweightChart from "../../../_components/charts/TvLightweightChart";
import type { TvDataPoint, TvHistogramDataPoint } from "../../../_components/charts/TvLightweightChart";
import type {
  GlobalMarketData, FearAndGreedData,
  ExtendedCoinData, CoinGeckoExchange,
} from "@/lib/market-data";

interface Props {
  globalData: GlobalMarketData | null;
  fearAndGreed: FearAndGreedData | null;
  coins: ExtendedCoinData[];
  exchanges: CoinGeckoExchange[];
}

function fmtUsd(n: number | null | undefined, decimals = 2): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(decimals)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(decimals)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number | null | undefined): React.ReactNode {
  if (n === null || n === undefined || isNaN(n)) {
    return <span className="text-[#a3a3a3]">—</span>;
  }
  const pos = n >= 0;
  return (
    <span className={`font-mono font-semibold tabular-nums ${pos ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
      {pos ? "+" : ""}{n.toFixed(2)}%
    </span>
  );
}

function pctKey(tf: Timeframe): keyof ExtendedCoinData {
  if (tf === "1D") return "price_change_percentage_24h_in_currency";
  if (tf === "7D") return "price_change_percentage_7d_in_currency";
  if (tf === "30D") return "price_change_percentage_30d_in_currency";
  return "price_change_percentage_24h_in_currency";
}

const DOM_COLORS: Record<string, string> = {
  BTC: "#F7931A", ETH: "#627EEA", USDT: "#26A17B", BNB: "#F3BA2F",
  SOL: "#9945FF", USDC: "#2775CA", XRP: "#00AAE4", OTHERS: "#555555",
};

interface PriceHistoryState { btc: TvDataPoint[]; eth: TvDataPoint[]; loading: boolean; }

function usePriceHistory(): PriceHistoryState {
  const [state, setState] = useState<PriceHistoryState>({ btc: [], eth: [], loading: true });
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [btcRes, ethRes] = await Promise.all([
          fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily"),
          fetch("https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily"),
        ]);
        const toPoints = async (res: Response): Promise<TvDataPoint[]> => {
          if (!res.ok) return [];
          const json = await res.json() as { prices?: [number, number][] };
          const raw = (json.prices ?? []).map(([ts, price]) => ({
            time: new Date(ts).toISOString().slice(0, 10),
            value: price,
          }));
          return Array.from(new Map(raw.map((d) => [d.time, d])).values())
            .sort((a, b) => a.time.localeCompare(b.time));
        };
        if (cancelled) return;
        setState({ btc: await toPoints(btcRes), eth: await toPoints(ethRes), loading: false });
      } catch { if (!cancelled) setState((s) => ({ ...s, loading: false })); }
    }
    load();
    return () => { cancelled = true; };
  }, []);
  return state;
}

export default function SpotClient({ globalData, fearAndGreed, coins, exchanges }: Props) {
  const [tf, setTf] = useState<Timeframe>("1D");
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const priceHistory = usePriceHistory();

  const slicePriceData = useCallback(
    (data: TvDataPoint[]): TvDataPoint[] => {
      if (tf === "7D") return data.slice(-7);
      return data;
    }, [tf]);

  const totalMcap = globalData?.total_market_cap?.usd ?? 0;
  const total24hVol = globalData?.total_volume?.usd ?? 0;
  const btcDom = globalData?.market_cap_percentage?.btc ?? 0;
  const ethDom = globalData?.market_cap_percentage?.eth ?? 0;
  const mcapChange24h = globalData?.market_cap_change_percentage_24h_usd ?? 0;
  const fng = fearAndGreed;

  const sortedCoins = [...coins].sort((a, b) => {
    const aVal = Number(a[pctKey(tf)] ?? -999);
    const bVal = Number(b[pctKey(tf)] ?? -999);
    return bVal - aVal;
  });

  const topMoversData: TvHistogramDataPoint[] = [...coins]
    .map((c) => {
      const change = Number(c[pctKey(tf)] ?? 0);
      return {
        time: c.symbol.toUpperCase(),
        value: change,
        color: change >= 0 ? "#22c55e" : "#ef4444",
      };
    })
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 12);

  const pct = globalData?.market_cap_percentage ?? {};
  const SHOW = ["btc", "eth", "usdt", "bnb", "sol", "usdc", "xrp"];
  const known = SHOW.map((k) => ({
    name: k.toUpperCase(),
    pct: Number(pct[k] ?? 0),
    color: DOM_COLORS[k.toUpperCase()] ?? "#555555",
  })).filter((d) => d.pct > 0);
  const knownSum = known.reduce((s, d) => s + d.pct, 0);
  const dominanceData: TvHistogramDataPoint[] = [
    ...known.map((d) => ({ time: d.name, value: d.pct, color: d.color })),
    { time: "OTHERS", value: Math.max(0, 100 - knownSum), color: DOM_COLORS.OTHERS },
  ];

  const totalBtcVol = exchanges.reduce((s, e) => s + e.trade_volume_24h_btc, 0);
  const exchangeVolData: TvHistogramDataPoint[] = exchanges.slice(0, 10).map((e, i) => ({
    time: e.name.length > 12 ? e.name.slice(0, 12) + "..." : e.name,
    value: totalBtcVol > 0 ? (e.trade_volume_24h_btc / totalBtcVol) * 100 : 0,
    color: `rgba(34, 197, 94, ${0.5 + i * 0.05})`,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Market Cap", value: fmtUsd(totalMcap),
            sub: `${mcapChange24h >= 0 ? "+" : ""}${mcapChange24h.toFixed(2)}% (24h)`,
            subColor: mcapChange24h >= 0 ? "text-[#22c55e]" : "text-[#ef4444]" },
          { label: "24h Volume", value: fmtUsd(total24hVol), sub: "Global spot", subColor: "text-[#a3a3a3]" },
          { label: "BTC Dominance", value: `${btcDom.toFixed(1)}%`, sub: "of total market cap", subColor: "text-[#a3a3a3]" },
          { label: "ETH Dominance", value: `${ethDom.toFixed(1)}%`, sub: "of total market cap", subColor: "text-[#a3a3a3]" },
          { label: "Fear & Greed", value: fng ? fng.value : "—",
            sub: fng?.value_classification ?? "N/A", subColor: fng ? (Number(fng.value) >= 50 ? "text-[#22c55e]" : "text-[#ef4444]") : "text-[#a3a3a3]" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl bg-[#161616] border border-[#27272a] p-5">
            <p className="text-sm text-[#a3a3a3] uppercase tracking-wider font-mono mb-2">{stat.label}</p>
            <p className="text-[28px] font-semibold text-[#f8fafc] font-mono tabular-nums leading-tight">{stat.value}</p>
            <p className={`text-sm font-mono mt-2 ${stat.subColor}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider">Top Movers</h3>
              <p className="text-xs text-[#52525b] font-mono mt-0.5">Top 12 by absolute {tf} change</p>
            </div>
            <TimeframeSelector value={tf} onChange={setTf} available={["1D", "7D", "30D"]} />
          </div>
          {mounted && topMoversData.length > 0 ? (
            <TvLightweightChart data={topMoversData as TvDataPoint[]} kind="histogram" lineColor="#22c55e" height={200} title="Top Movers" />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[#52525b] font-mono text-sm">Rendering...</div>
          )}
        </div>
        <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider">Market Cap Dominance</h3>
            <p className="text-xs text-[#52525b] font-mono mt-0.5">% share of total market cap</p>
          </div>
          {mounted && dominanceData.length > 0 ? (
            <TvLightweightChart data={dominanceData as TvDataPoint[]} kind="histogram" lineColor="#22c55e" height={200} title="Dominance" />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[#52525b] font-mono text-sm">Rendering...</div>
          )}
        </div>
      </div>

      {tf !== "1D" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider">Bitcoin Price ({tf})</h3>
              <p className="text-xs text-[#52525b] font-mono mt-0.5">CoinGecko market_chart</p>
            </div>
            {priceHistory.loading ? (
              <div className="flex items-center justify-center h-[220px] text-[#52525b] font-mono text-sm">Loading BTC chart...</div>
            ) : (
              <TvLightweightChart data={slicePriceData(priceHistory.btc)} lineColor="#F7931A" height={220} title="BTC Price" />
            )}
          </div>
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider">Ethereum Price ({tf})</h3>
              <p className="text-xs text-[#52525b] font-mono mt-0.5">CoinGecko market_chart</p>
            </div>
            {priceHistory.loading ? (
              <div className="flex items-center justify-center h-[220px] text-[#52525b] font-mono text-sm">Loading ETH chart...</div>
            ) : (
              <TvLightweightChart data={slicePriceData(priceHistory.eth)} lineColor="#627EEA" height={220} title="ETH Price" />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider">Top 10 CEX — 24h Volume (BTC)</h3>
            <p className="text-xs text-[#52525b] font-mono mt-0.5">Source: CoinGecko exchanges API</p>
          </div>
          {mounted && exchangeVolData.length > 0 ? (
            <TvLightweightChart
              data={exchanges.slice(0, 10).map((e) => ({ time: e.name.length > 12 ? e.name.slice(0, 12) + "..." : e.name, value: Math.round(e.trade_volume_24h_btc) }))}
              kind="histogram" lineColor="#22c55e" height={200} title="CEX Volume"
              priceFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : String(v)}
            />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[#52525b] font-mono text-sm">Rendering...</div>
          )}
        </div>
        <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider">CEX Volume Dominance</h3>
            <p className="text-xs text-[#52525b] font-mono mt-0.5">% of total 24h CEX volume</p>
          </div>
          {mounted && exchangeVolData.length > 0 ? (
            <TvLightweightChart
              data={exchangeVolData as TvDataPoint[]}
              kind="histogram" lineColor="#22c55e" height={200} title="Volume Dominance"
              priceFormatter={(v) => `${v.toFixed(1)}%`}
            />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[#52525b] font-mono text-sm">Rendering...</div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-[#f8fafc] flex items-center gap-3">
            <span className="w-2 h-2 bg-[#22c55e] rounded-full" />Top 50 Assets
          </h3>
          <TimeframeSelector value={tf} onChange={setTf} available={["1D", "7D", "30D"]} />
        </div>
        <div className="rounded-3xl bg-[#161616] border border-[#27272a] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="sticky top-0 z-10 bg-[#161616] border-b border-[#27272a]">
                {["#", "Asset", "Price", "1h%", `${tf} Perf`, "Market Cap", "24h Volume"].map((h) => (
                  <th key={h} className={[
                    "px-4 py-3 font-semibold text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap",
                    h === "Asset" || h === "#" ? "text-left" : "text-right",
                    h === `${tf} Perf` ? "text-[#22c55e]" : "",
                  ].join(" ")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCoins.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#a3a3a3] font-mono text-sm">Syncing market data...</td></tr>
              )}
              {sortedCoins.map((coin, i) => {
                const tfPct = coin[pctKey(tf)] as number | null;
                const h1Pct = coin.price_change_percentage_1h_in_currency;
                const price = coin.current_price;
                return (
                  <tr key={coin.id} className={[
                    "border-b border-[#27272a] hover:bg-[#27272a] transition-colors duration-200",
                    i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#161616]",
                  ].join(" ")}>
                    <td className="px-4 py-3 text-[#a3a3a3] tabular-nums w-10">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {coin.image && <Image src={coin.image} alt={coin.symbol} width={20} height={20} className="rounded-full shrink-0" />}
                        <span className="font-semibold text-[#f8fafc]">{coin.name}</span>
                        <span className="text-[#a3a3a3] uppercase text-xs">{coin.symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#f8fafc]">
                      {price >= 1
                        ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : price > 0 ? `$${price.toFixed(price < 0.001 ? 8 : price < 0.01 ? 6 : 4)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">{fmtPct(h1Pct)}</td>
                    <td className="px-4 py-3 text-right">{fmtPct(tfPct)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#a3a3a3]">{fmtUsd(coin.market_cap)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#a3a3a3]">{fmtUsd(coin.total_volume)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#52525b] font-mono mt-2 text-right">Source: CoinGecko — Cached 5 min</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[#f8fafc] mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#22c55e] rounded-full" />CEX Rankings by 24h Volume
        </h3>
        <div className="rounded-3xl bg-[#161616] border border-[#27272a] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="sticky top-0 z-10 bg-[#161616] border-b border-[#27272a]">
                {["#", "Exchange", "Country", "Trust Score", "24h Volume (BTC)", "24h Vol Norm"].map((h) => (
                  <th key={h} className={["px-4 py-3 font-semibold text-[#a3a3a3] uppercase tracking-wider",
                    h === "Exchange" || h === "#" ? "text-left" : "text-right",
                  ].join(" ")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exchanges.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-[#a3a3a3] font-mono text-sm">Syncing exchange data...</td></tr>
              )}
              {exchanges.map((ex, i) => (
                <tr key={ex.id} className={[
                  "border-b border-[#27272a] hover:bg-[#27272a] transition-colors duration-200",
                  i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#161616]",
                ].join(" ")}>
                  <td className="px-4 py-3 text-[#a3a3a3] tabular-nums w-10">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-[#f8fafc]">{ex.name}</td>
                  <td className="px-4 py-3 text-right text-[#a3a3a3]">{ex.country ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {ex.trust_score !== null ? (
                      <span className={`font-mono font-semibold ${
                        (ex.trust_score ?? 0) >= 8 ? "text-[#22c55e]" :
                        (ex.trust_score ?? 0) >= 5 ? "text-[#f8fafc]" : "text-[#ef4444]"
                      }`}>{ex.trust_score}/10</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#22c55e]">
                    {ex.trade_volume_24h_btc?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "—"} BTC
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#a3a3a3]">
                    {ex.trade_volume_24h_btc_normalized?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "—"} BTC
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#52525b] font-mono mt-2 text-right">Source: CoinGecko — Cached 1 hr</p>
      </div>
    </div>
  );
}
