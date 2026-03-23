import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import { getWikiPageviews, WIKI_ARTICLES } from "@/lib/alternative-data";

/**
 * Phase 45 · H8 — /alternative/social
 *
 * Previous state: static platform cards with no live data. Wikipedia card said
 * "Live" but showed only a link; Twitter/Reddit/YouTube showed "Planned".
 *
 * Fix: Wikipedia section now fetches and displays real 7D + 30D pageview KPIs
 * (same data as /alternative/web-traffic, surfaced here so this page has actual
 * live content). Twitter/Reddit/YouTube remain "Planned" — honest, no fake data.
 */

export const metadata = {
  title: "Social Metrics | CryptoBrainNews",
  description: "Wikipedia pageviews, Twitter/X volume, Reddit activity, and YouTube growth for crypto topics.",
};
export const revalidate = 86400;

async function SocialData() {
  // Wikipedia pageviews — same source as /alternative/web-traffic
  const wikiResults = await Promise.all(
    WIKI_ARTICLES.map(async (article) => {
      const points = await getWikiPageviews(article.id, 30).catch(() => []);
      return {
        ...article,
        views7d:  points.slice(-7).reduce((s, p) => s + p.views, 0),
        views30d: points.reduce((s, p) => s + p.views, 0),
      };
    })
  );

  const totalViews7d  = wikiResults.reduce((s, r) => s + r.views7d,  0);
  const totalViews30d = wikiResults.reduce((s, r) => s + r.views30d, 0);
  const topArticle    = [...wikiResults].sort((a, b) => b.views7d - a.views7d)[0];

  function fmtViews(n: number): string {
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
    return String(n);
  }

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Social Metrics"
        description="Public interest signals across Wikipedia, Twitter/X, Reddit, and YouTube."
      />

      {/* ── Wikipedia — Live ──────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-[#FABF2C]">
                Wikipedia
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 border text-[#00d672] border-[#00d672]/30 bg-[#00d672]/10">
                Live
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#555]">
              Daily pageviews via Wikimedia REST API — free, no key required
            </p>
          </div>
          <a
            href="/data/alternative/web-traffic"
            className="text-[10px] font-black uppercase tracking-widest text-[#FABF2C] hover:opacity-80 transition-opacity"
          >
            View full charts
          </a>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="border border-[#1a1a1a] bg-[#080808] p-4">
            <p className="text-[9px] font-black text-[#555] uppercase tracking-widest mb-2">
              Total Views (7D)
            </p>
            <p className="text-xl font-black text-[#FABF2C] tabular-nums">
              {fmtViews(totalViews7d)}
            </p>
            <p className="text-[9px] font-mono text-[#555] mt-1">4 articles combined</p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#080808] p-4">
            <p className="text-[9px] font-black text-[#555] uppercase tracking-widest mb-2">
              Total Views (30D)
            </p>
            <p className="text-xl font-black text-white tabular-nums">
              {fmtViews(totalViews30d)}
            </p>
            <p className="text-[9px] font-mono text-[#555] mt-1">trailing 30 days</p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#080808] p-4">
            <p className="text-[9px] font-black text-[#555] uppercase tracking-widest mb-2">
              Top Article (7D)
            </p>
            <p className="text-xl font-black text-white">{topArticle?.label ?? "-"}</p>
            <p className="text-[9px] font-mono text-[#555] mt-1">
              {topArticle ? fmtViews(topArticle.views7d) + " views" : ""}
            </p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#080808] p-4">
            <p className="text-[9px] font-black text-[#555] uppercase tracking-widest mb-2">
              Source
            </p>
            <p className="text-xl font-black text-[#888]">Wikimedia</p>
            <p className="text-[9px] font-mono text-[#555] mt-1">en.wikipedia.org</p>
          </div>
        </div>

        {/* Per-article bars */}
        <div className="space-y-2">
          {wikiResults.map((r) => {
            const pct = totalViews7d > 0 ? (r.views7d / totalViews7d) * 100 : 0;
            return (
              <div key={r.id} className="flex items-center gap-3">
                <span className="w-20 text-right text-[10px] font-bold text-white shrink-0">
                  {r.label}
                </span>
                <div className="flex-1 h-4 bg-[#111]">
                  <div
                    className="h-full"
                    style={{ width: `${pct}%`, backgroundColor: r.color, opacity: 0.8 }}
                  />
                </div>
                <span
                  className="w-16 text-right font-mono text-[10px] tabular-nums shrink-0"
                  style={{ color: r.color }}
                >
                  {fmtViews(r.views7d)}/7d
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Planned platforms ─────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-[#555] mb-4">
          Planned Integrations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              platform: "Twitter / X",
              metric:   "Crypto Tweet Volume",
              color:    "#1d9bf0",
              note:     "Daily tweet count for BTC, ETH, SOL, and major tokens. Requires Twitter API v2 Basic tier ($100/mo).",
            },
            {
              platform: "Reddit",
              metric:   "Subreddit Activity",
              color:    "#ff4500",
              note:     "r/Bitcoin, r/ethereum, r/CryptoCurrency active users and post volume. Reddit API free tier limited.",
            },
            {
              platform: "YouTube",
              metric:   "Crypto Creator Growth",
              color:    "#ff0000",
              note:     "Weekly subscriber counts for top crypto channels. Requires YouTube Data API v3 (free quota limited).",
            },
          ].map((s) => (
            <div
              key={s.platform}
              className="bg-[#0a0a0a] border border-[#1a1a1a] p-6"
              style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-sm font-black uppercase tracking-tight"
                  style={{ color: s.color }}
                >
                  {s.platform}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 border text-[#555] border-[#1a1a1a] bg-[#111]">
                  Planned
                </span>
              </div>
              <p className="text-[10px] font-black text-[#888] uppercase tracking-widest mb-2">
                {s.metric}
              </p>
              <p className="text-[10px] font-mono text-[#555] leading-relaxed">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-[#333] font-mono text-right">
        Wikipedia data: Wikimedia REST API - Free, no key - Cached 24h
      </p>
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
