/**
 * components/monetisation/AffiliateDashboard.tsx
 * Admin-only affiliate analytics dashboard (client component).
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { PartnerSummary }              from '../../lib/monetisation/analytics';

interface AnalyticsResponse {
  partners:    PartnerSummary[];
  generatedAt: string;
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return <div className="h-10 bg-[#1a1a2e] rounded animate-pulse" />;

  const max   = Math.max(...data, 1);
  const w     = 200;
  const h     = 40;
  const step  = w / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${h - (v / max) * (h - 4)}`)
    .join(' ');

  const lastVal  = data[data.length - 1];
  const prevVal  = data[data.length - 2];
  const trending = lastVal >= prevVal ? '#22c55e' : '#ef4444';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" aria-hidden="true">
      <polyline
        fill="none"
        stroke={trending}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label:   string;
  value:   string | number;
  sub?:    string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        accent ? 'border-[#00d4ff]/30 bg-[#00d4ff]/5' : 'border-[#1a1a2e] bg-[#0d0d1a]'
      }`}
    >
      <p className="text-xs text-[#555] uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${accent ? 'text-[#00d4ff]' : 'text-white'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

function PartnerPanel({ partner }: { partner: PartnerSummary }) {
  const sparkData = [...partner.last30Days]
    .reverse()
    .map((d) => d.clicks);

  const totalLast7  = partner.last7Days.reduce((s, d) => s + d.clicks, 0);
  const totalLast30 = partner.last30Days.reduce((s, d) => s + d.clicks, 0);

  return (
    <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-bold capitalize text-lg">{partner.partnerId}</h3>
          <p className="text-xs text-[#555] mt-0.5">Affiliate partner</p>
        </div>
        <div className="text-right">
          <p className="text-[#00d4ff] font-bold font-mono text-xl">
            ${partner.totalRevenue.toFixed(2)}
          </p>
          <p className="text-xs text-[#555]">all-time revenue</p>
        </div>
      </div>

      <Sparkline data={sparkData} />

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center">
          <p className="text-white font-bold font-mono">{partner.totalClicks.toLocaleString()}</p>
          <p className="text-[10px] text-[#555] uppercase tracking-wide">all-time</p>
        </div>
        <div className="text-center">
          <p className="text-white font-bold font-mono">{totalLast30.toLocaleString()}</p>
          <p className="text-[10px] text-[#555] uppercase tracking-wide">30d clicks</p>
        </div>
        <div className="text-center">
          <p className="text-white font-bold font-mono">{totalLast7.toLocaleString()}</p>
          <p className="text-[10px] text-[#555] uppercase tracking-wide">7d clicks</p>
        </div>
      </div>

      {partner.topArticles.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#1a1a2e]">
          <p className="text-[10px] text-[#555] uppercase tracking-widest mb-2">Top Articles</p>
          <ul className="space-y-1.5">
            {partner.topArticles.slice(0, 5).map((a) => (
              <li key={a.slug} className="flex items-center justify-between gap-2">
                <span className="text-xs text-[#94a3b8] truncate max-w-[160px]">{a.slug}</span>
                <span className="text-xs font-mono text-white shrink-0">{a.clicks} clicks</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AffiliateDashboard() {
  const [data,    setData]    = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/monetisation/analytics?days=30', {
        headers: {
          'x-cron-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET ?? '',
        },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      setData(await res.json() as AnalyticsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const totalClicks  = data?.partners.reduce((s, p) => s + p.totalClicks,  0) ?? 0;
  const totalRevenue = data?.partners.reduce((s, p) => s + p.totalRevenue, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#080812] p-6 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Affiliate Analytics</h1>
          <p className="text-sm text-[#555] mt-1">
            {data ? `Updated ${new Date(data.generatedAt).toLocaleTimeString()}` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-xs px-4 py-2 rounded-lg border border-[#1a1a2e] text-[#94a3b8] hover:text-white hover:border-[#00d4ff] transition-colors disabled:opacity-40"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-900/50 bg-red-900/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Clicks"    value={totalClicks.toLocaleString()}     accent />
        <StatCard label="Total Revenue"   value={`$${totalRevenue.toFixed(2)}`}    accent />
        <StatCard label="Active Partners" value={data?.partners.length ?? '—'} />
        <StatCard
          label="Best Partner"
          value={
            data?.partners.sort((a, b) => b.totalClicks - a.totalClicks)[0]?.partnerId ?? '—'
          }
          sub="by clicks"
        />
      </div>

      {loading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-xl bg-[#0d0d1a] border border-[#1a1a2e] animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.partners.map((p) => (
            <PartnerPanel key={p.partnerId} partner={p} />
          ))}
        </div>
      )}

      <p className="text-xs text-[#333] text-center pb-4">
        Admin only · Revenue figures are estimates pending partner confirmation
      </p>
    </div>
  );
}
