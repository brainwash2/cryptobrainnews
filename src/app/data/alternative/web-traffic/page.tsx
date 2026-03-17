import React, { Suspense }           from 'react';
import { DataHeader }                 from '../../_components/DataHeader';
import { ChartSkeleton }              from '../../_components/ChartSkeleton';
import WikiPageviewsClient            from './_components/WikiPageviewsClient';
import { getWikiPageviews, WIKI_ARTICLES } from '@/lib/alternative-data';

export const metadata = {
  title: 'Web Traffic & Interest | CryptoBrainNews',
  description: 'Wikipedia pageview trends for major crypto topics – a proxy for public interest.',
};
export const revalidate = 86400;

async function WikiData() {
  // Fetch pageviews for all articles in parallel
  const results = await Promise.all(
    WIKI_ARTICLES.map(async (article) => {
      const points = await getWikiPageviews(article.id, 30).catch(() => []);
      return { ...article, points };
    })
  );

  const latest = results.map((r) => ({
    label:  r.label,
    color:  r.color,
    views7d: r.points.slice(-7).reduce((s, p) => s + p.views, 0),
    views30d: r.points.reduce((s, p) => s + p.views, 0),
  }));

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Web Traffic & Public Interest"
        description="Wikipedia pageview trends for key crypto topics – daily pageviews as a proxy for public awareness."
      />

      {/* ── 30-day Totals ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {latest.map((a) => (
          <div key={a.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{a.label} (30d)</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: a.color }}>
              {a.views30d > 0 ? a.views30d.toLocaleString() : '—'}
            </p>
            <p className="text-[10px] font-mono text-[#555] mt-1">Wikipedia pageviews</p>
          </div>
        ))}
      </div>

      {/* ── Interactive charts – client component ─────────────────── */}
      <WikiPageviewsClient articles={results} />

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">About Wikipedia Pageviews</h3>
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          Wikipedia pageview data is a widely used proxy for public awareness and search interest.
          Spikes often correlate with major price movements, media coverage, or significant events.
          Data from Wikimedia Analytics REST API (free, no key required). Updated daily.
          Google Search Trends integration is planned for a future update.
        </p>
      </div>
    </div>
  );
}

export default function WebTrafficPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <WikiData />
      </Suspense>
    </main>
  );
}
