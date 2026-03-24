import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import { getCoinPrice }     from "@/lib/api";

export const metadata = {
  title: "Sports & Fan Tokens | CryptoBrainNews",
  description: "Fan token market caps, prices, 24h and 7d performance - PSG, BAR, JUV, CITY, and more.",
};
export const revalidate = 300;

interface FanToken {
  id: string; symbol: string; name: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency: number | null;
  market_cap: number | null;
  total_volume: number | null;
  image: string | null;
  market_cap_rank: number | null;
  ath: number | null;
  ath_change_percentage: number | null;
}

function fmtUsd(n: number | null): string {
  if (!n) return "-";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(4)}`;
}

function PctCell({ v }: { v: number | null }) {
  if (v === null || v === undefined) return <span className="text-[#555]">-</span>;
  const pos = v >= 0;
  return (
    <span className={`font-mono font-bold tabular-nums ${pos ? "text-[#00d672]" : "text-[#ff4757]"}`}>
      {pos ? "+" : ""}{v.toFixed(2)}%
    </span>
  );
}

async function SportsTokensData() {
  let tokens: FanToken[] = [];
  let isLive = false;

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets" +
      "?vs_currency=usd&category=fan-token&order=market_cap_desc" +
      "&per_page=50&page=1&sparkline=false" +
      "&price_change_percentage=7d",
      { next: { revalidate: 300 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        tokens = data as FanToken[];
        isLive = true;
      }
    }
  } catch { /* use empty */ }

  const totalMcap = tokens.reduce((s, t) => s + (t.market_cap ?? 0), 0);
  const best7d = tokens.reduce((b, t) =>
    (t.price_change_percentage_7d_in_currency ?? -Infinity) > (b?.price_change_percentage_7d_in_currency ?? -Infinity) ? t : b
  , tokens[0]);
  const worst7d = tokens.reduce((b, t) =>
    (t.price_change_percentage_7d_in_currency ?? Infinity) < (b?.price_change_percentage_7d_in_currency ?? Infinity) ? t : b
  , tokens[0]);

  return (
    <div className="space-y-8 pb-20">
      <DataHeader
        title="Sports and Fan Tokens"
        description="Fan token market caps, prices, and performance - PSG, BAR, JUV, CITY, ACM, and more."
      />

      <div className="flex items-center gap-3 flex-wrap">
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          isLive ? "border-[#00d672]/40 text-[#00d672]" : "border-[#FABF2C]/40 text-[#FABF2C]"
        }`}>
          {isLive ? "Live - CoinGecko" : "Unavailable"}
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          {tokens.length} fan tokens tracked - refreshed every 5 min
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Market Cap", value: fmtUsd(totalMcap), color: "#FABF2C" },
          { label: "Tokens Tracked",   value: String(tokens.length), color: "#888" },
          { label: "Best 7D",
            value: best7d ? `${best7d.symbol.toUpperCase()} ${best7d.price_change_percentage_7d_in_currency?.toFixed(1)}%` : "-",
            color: "#00d672" },
          { label: "Worst 7D",
            value: worst7d ? `${worst7d.symbol.toUpperCase()} ${worst7d.price_change_percentage_7d_in_currency?.toFixed(1)}%` : "-",
            color: "#ff4757" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {tokens.length === 0 ? (
        <div className="border border-dashed border-[#1a1a1a] p-12 text-center">
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
            Fan token data temporarily unavailable - CoinGecko rate limited
          </p>
        </div>
      ) : (
        <div className="border border-[#1a1a1a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-[#1a1a1a] bg-[#050505]">
              <tr>
                {["#", "Token", "Price", "24h %", "7d %", "Market Cap", "24h Volume", "From ATH"].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                    ["#", "Token"].includes(h) ? "text-left" : "text-right"
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((t, i) => (
                <tr key={t.id} className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                  i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                }`}>
                  <td className="px-4 py-3 text-[#333] font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {t.image && (
                        <img src={t.image} alt={t.name} className="w-6 h-6 rounded-full" />
                      )}
                      <span className="font-bold text-white">{t.name}</span>
                      <span className="text-[9px] font-black text-[#FABF2C] px-1.5 py-0.5 bg-[#FABF2C]/10">
                        {t.symbol.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black text-white tabular-nums">
                    {t.current_price ? `$${t.current_price.toFixed(4)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right"><PctCell v={t.price_change_percentage_24h} /></td>
                  <td className="px-4 py-3 text-right"><PctCell v={t.price_change_percentage_7d_in_currency} /></td>
                  <td className="px-4 py-3 text-right font-mono text-[#FABF2C] tabular-nums">{fmtUsd(t.market_cap)}</td>
                  <td className="px-4 py-3 text-right font-mono text-[#888] tabular-nums">{fmtUsd(t.total_volume)}</td>
                  <td className="px-4 py-3 text-right">
                    <PctCell v={t.ath_change_percentage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[9px] text-[#333] font-mono text-right">
        Source: CoinGecko category=fan-token - Free API - Cached 5 min
      </p>
    </div>
  );
}

export default function SportsTokensPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <SportsTokensData />
      </Suspense>
    </main>
  );
}
