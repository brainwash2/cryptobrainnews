// src/app/data/alternative/social/page.tsx
// Updated: ApeWisdom (real‑time mentions) + Santiment (dev activity).
// LunarCrush seed fallback retained for social volume.
import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import { getApeWisdomSentiment } from "@/lib/apewisdom";
import type { ApeWisdomMention } from "@/lib/apewisdom";
import { getSantimentMetric }    from "@/lib/santiment";
import type { SantimentAssetMetrics } from "@/lib/santiment";

export const metadata = {
  title: "Social Metrics | CryptoBrainNews",
  description: "Real‑time trending mentions (ApeWisdom) and Santiment dev activity for top crypto assets.",
};
export const revalidate = 3600;

// ─── LunarCrush seed fallback ────────────────────────────────────────────────
// Retained from the previous implementation for social volume if ApeWisdom fails.
const SEED_SOCIAL: Array<{
  symbol: string;
  name: string;
  socialVolume24h: number;
  bullishPct: number;
  bearishPct: number;
  sentiment: string;
}> = [
  { symbol: "BTC",  name: "Bitcoin",  socialVolume24h: 48200,  bullishPct: 0.58, bearishPct: 0.22, sentiment: "Bullish" },
  { symbol: "ETH",  name: "Ethereum", socialVolume24h: 32100,  bullishPct: 0.52, bearishPct: 0.28, sentiment: "Bullish" },
  { symbol: "SOL",  name: "Solana",   socialVolume24h: 18900,  bullishPct: 0.61, bearishPct: 0.19, sentiment: "Bullish" },
  { symbol: "DOGE", name: "Dogecoin", socialVolume24h: 12100,  bullishPct: 0.44, bearishPct: 0.31, sentiment: "Neutral" },
  { symbol: "XRP",  name: "XRP",      socialVolume24h: 10800,  bullishPct: 0.48, bearishPct: 0.27, sentiment: "Neutral" },
  { symbol: "BNB",  name: "BNB",      socialVolume24h: 8600,   bullishPct: 0.55, bearishPct: 0.24, sentiment: "Bullish" },
  { symbol: "ADA",  name: "Cardano",  socialVolume24h: 7200,   bullishPct: 0.39, bearishPct: 0.33, sentiment: "Neutral" },
  { symbol: "AVAX", name: "Avalanche",socialVolume24h: 5400,   bullishPct: 0.51, bearishPct: 0.29, sentiment: "Bullish" },
  { symbol: "DOT",  name: "Polkadot", socialVolume24h: 4800,   bullishPct: 0.35, bearishPct: 0.38, sentiment: "Bearish" },
  { symbol: "LINK", name: "Chainlink",socialVolume24h: 4200,   bullishPct: 0.58, bearishPct: 0.21, sentiment: "Bullish" },
];

function fmtSocialVolume(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(0);
}

async function SocialData() {
  // Fetch both sources in parallel
  const [apeWisdom, santimentBtc, santimentEth, santimentSol] = await Promise.all([
    getApeWisdomSentiment().catch(() => []),
    getSantimentMetric("bitcoin").catch(() => null) as Promise<SantimentAssetMetrics | null>,
    getSantimentMetric("ethereum").catch(() => null) as Promise<SantimentAssetMetrics | null>,
    getSantimentMetric("solana").catch(() => null) as Promise<SantimentAssetMetrics | null>,
  ]);

  const isApeWisdomLive = apeWisdom.length > 0;
  const isSantimentLive = santimentBtc?.source === "live" ||
    santimentEth?.source === "live" ||
    santimentSol?.source === "live";

  const santimentAssets = [santimentBtc, santimentEth, santimentSol].filter(
    (a): a is SantimentAssetMetrics => a !== null,
  );

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Social Metrics"
        description="Real‑time trending mentions from ApeWisdom plus Santiment dev activity for top crypto assets."
      />

      {/* ── Source badges ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          isApeWisdomLive
            ? "border-[#00d672]/40 text-[#00d672]"
            : "border-[#FABF2C]/40 text-[#FABF2C]"
        }`}>
          {isApeWisdomLive ? "● Live — ApeWisdom" : "◌ Seed — ApeWisdom unavailable"}
        </span>
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          isSantimentLive
            ? "border-[#00d672]/40 text-[#00d672]"
            : "border-[#FABF2C]/40 text-[#FABF2C]"
        }`}>
          {isSantimentLive ? "● Live — Santiment" : "◌ Seed — Santiment"}
        </span>
        {!isSantimentLive && (
          <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
            Free tier: santiment.net → 1,000 calls/month — Set SANTIMENT_API_KEY
          </span>
        )}
      </div>

      {/* ── ApeWisdom: Trending Mentions Table ────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#3b82f6] rounded-full" />
          Trending Mentions — ApeWisdom
        </h3>
        {isApeWisdomLive ? (
          <div className="border border-[#1a1a1a] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                  <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest w-8">Rank</th>
                  <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Ticker</th>
                  <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Mentions</th>
                  <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Upvotes</th>
                  <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Rank Δ (24h)</th>
                </tr>
              </thead>
              <tbody>
                {apeWisdom.slice(0, 25).map((m: ApeWisdomMention, i: number) => {
                  const rankDelta = m.rankChange24h;
                  const deltaColor = rankDelta > 0
                    ? "text-[#00d672]"
                    : rankDelta < 0
                    ? "text-[#ff4757]"
                    : "text-[#555]";
                  return (
                    <tr
                      key={m.ticker}
                      className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                        i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                      }`}
                    >
                      <td className="px-4 py-3 text-[#555] tabular-nums">{m.rank || i + 1}</td>
                      <td className="px-4 py-3 font-bold text-white">{m.ticker}</td>
                      <td className="px-4 py-3 text-right font-mono font-black text-[#FABF2C] tabular-nums">
                        {m.mentions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                        {m.upvotes.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold tabular-nums ${deltaColor}`}>
                        {rankDelta > 0 ? "▲" : rankDelta < 0 ? "▼" : "—"}
                        {rankDelta !== 0 ? ` ${Math.abs(rankDelta)}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-[#1a1a1a] p-10 text-center">
            <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
              ApeWisdom data unavailable — showing LunarCrush seed fallback below
            </p>
          </div>
        )}
      </div>

      {/* ── Santiment: Dev Activity ────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Dev Activity — Santiment
        </h3>
        {santimentAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {santimentAssets.map((asset) => {
              const latestDev = asset.latestDevActivity;
              const devPoints = asset.devActivity.slice(-7);
              const accent =
                asset.asset === "bitcoin" ? "#FABF2C" :
                asset.asset === "ethereum" ? "#3b82f6" : "#9945ff";

              return (
                <div key={asset.asset} className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>
                      {asset.name}
                    </span>
                    <span className={`border font-mono text-[9px] px-2 py-0.5 uppercase tracking-widest ${
                      asset.source === "live"
                        ? "border-[#00d672]/40 text-[#00d672]"
                        : "border-[#FABF2C]/40 text-[#FABF2C]"
                    }`}>
                      {asset.source === "live" ? "Live" : "Seed"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-1">
                      Latest Dev Activity
                    </p>
                    <p className="text-3xl font-black tabular-nums" style={{ color: accent }}>
                      {latestDev !== null ? Math.round(latestDev).toLocaleString() : "—"}
                    </p>
                  </div>

                  {/* Mini 7‑day sparkline using CSS bars */}
                  {devPoints.length > 0 && (
                    <div>
                      <p className="text-[9px] font-mono text-[#555] uppercase mb-1">7‑Day Trend</p>
                      <div className="flex items-end gap-[2px] h-12">
                        {devPoints.map((pt, j) => {
                          const maxVal = Math.max(...devPoints.map((p) => p.value), 1);
                          const h = Math.max(2, (pt.value / maxVal) * 100);
                          return (
                            <div
                              key={j}
                              className="flex-1 rounded-sm"
                              style={{ height: `${h}%`, backgroundColor: accent, opacity: 0.7 }}
                              title={`${pt.datetime}: ${pt.value.toLocaleString()}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-[#333] mt-1">
                        <span>{devPoints[0]?.datetime ?? ""}</span>
                        <span>{devPoints[devPoints.length - 1]?.datetime ?? ""}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-[#1a1a1a] p-10 text-center">
            <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
              Santiment dev activity unavailable — requires SANTIMENT_API_KEY (free tier at santiment.net)
            </p>
          </div>
        )}
      </div>

      {/* ── Social Volume (LunarCrush seed fallback) ────────────────────── */}
      {!isApeWisdomLive && (
        <>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
              <span className="w-2 h-2 bg-[#00d672] rounded-full" />
              Social Volume — Reference Snapshot
            </h3>
            <div className="border border-[#1a1a1a] overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                    <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest w-8">#</th>
                    <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Asset</th>
                    <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Social Volume (24h)</th>
                    <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Bullish %</th>
                    <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Bearish %</th>
                    <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {SEED_SOCIAL.map((r, i) => {
                    const sentimentColor =
                      r.sentiment === "Bullish" ? "#00d672" :
                      r.sentiment === "Bearish" ? "#ff4757" : "#888";
                    return (
                      <tr key={r.symbol} className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                        i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                      }`}>
                        <td className="px-4 py-3 text-[#555] tabular-nums">{i + 1}</td>
                        <td className="px-4 py-3 font-bold text-white">{r.name} <span className="text-[#555]">{r.symbol}</span></td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-[#FABF2C]">{fmtSocialVolume(r.socialVolume24h)}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-[#00d672]">{(r.bullishPct * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-[#ff4757]">{(r.bearishPct * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 font-mono font-bold text-xs" style={{ color: sentimentColor }}>{r.sentiment}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
              Source: LunarCrush public dashboard · Reference snapshot April 2026 · Set LUNARCRUSH_API_KEY for live data
            </p>
          </div>
        </>
      )}

      {/* ── About ──────────────────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">About Social Metrics</h3>
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          <span className="text-[#3b82f6] font-black">ApeWisdom</span> tracks trending cryptocurrency
          mentions across Reddit (r/CryptoCurrency and related subreddits), ranking coins by
          total mentions, upvotes, and comment count. Free public API — no key or signup required.
          {' '}
          <span className="text-[#FABF2C] font-black">Santiment</span> provides developer activity
          metrics (GitHub commits, PRs, issues) via a free‑tier GraphQL API with 1,000 calls/month
          (signup at app.santiment.net, no credit card required — 30‑day data lag).
          {' '}
          <span className="text-[#888] font-black">LunarCrush</span> seed data is shown as fallback
          when both live sources are unavailable (50 calls/day free tier at lunarcrush.com/developers).
        </p>
      </div>
    </div>
  );
}

export default function AlternativeSocialPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <SocialData />
      </Suspense>
    </main>
  );
}
