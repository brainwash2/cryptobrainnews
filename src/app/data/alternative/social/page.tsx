import React, { Suspense }  from 'react';
import { DataHeader }        from '../../_components/DataHeader';
import { ChartSkeleton }     from '../../_components/ChartSkeleton';
import { redirect }          from 'next/navigation';

// Redirect social alternative to web-traffic (both show public interest)
export const metadata = { title: 'Social Metrics | CryptoBrainNews' };
export const revalidate = 86400;

export default function AlternativeSocialPage() {
  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Social Metrics"
        description="Twitter/X volume, Reddit activity, YouTube subscriber growth, and Wikipedia pageviews for crypto."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          {
            platform: 'Wikipedia',
            metric:   'Daily Pageviews',
            color:    '#FABF2C',
            status:   'Live',
            note:     'Bitcoin, Ethereum, Cryptocurrency, NFT pageviews via Wikimedia API.',
            link:     '/data/alternative/web-traffic',
            linkText: 'View Pageview Charts →',
          },
          {
            platform: 'Twitter / X',
            metric:   'Crypto Tweet Volume',
            color:    '#1d9bf0',
            status:   'Planned',
            note:     'Daily tweet count for BTC, ETH, SOL, and major tokens. Requires Twitter API v2 Basic tier.',
            link:     null,
            linkText: null,
          },
          {
            platform: 'Reddit',
            metric:   'Subreddit Activity',
            color:    '#ff4500',
            status:   'Planned',
            note:     'r/Bitcoin, r/ethereum, r/CryptoCurrency subscriber counts and daily active users.',
            link:     null,
            linkText: null,
          },
          {
            platform: 'YouTube',
            metric:   'Crypto Creator Growth',
            color:    '#ff0000',
            status:   'Planned',
            note:     'Weekly new subscriber counts for top crypto channels. Requires YouTube Data API.',
            link:     null,
            linkText: null,
          },
        ].map((s) => (
          <div key={s.platform} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6"
               style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black uppercase tracking-tight" style={{ color: s.color }}>{s.platform}</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 border ${
                s.status === 'Live'
                  ? 'text-[#00d672] border-[#00d672]/30 bg-[#00d672]/10'
                  : 'text-[#555] border-[#1a1a1a] bg-[#111]'
              }`}>
                {s.status}
              </span>
            </div>
            <p className="text-[10px] font-black text-[#888] uppercase tracking-widest mb-2">{s.metric}</p>
            <p className="text-[10px] font-mono text-[#555] leading-relaxed mb-4">{s.note}</p>
            {s.link && (
              <a href={s.link} className="text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                 style={{ color: s.color }}>
                {s.linkText}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
