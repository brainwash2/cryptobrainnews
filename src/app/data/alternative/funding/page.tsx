import React from 'react';
import { DataHeader }             from '../../_components/DataHeader';
import { VC_DEALS_2026, VC_CATEGORIES_2026 } from '@/lib/alternative-data';

export const metadata = {
  title: 'Crypto Venture Funding | CryptoBrainNews',
  description: 'Crypto VC funding rounds, category breakdown, and notable deals.',
};
export const revalidate = 86400;

function fmtUsd(n: number): string {
  if (!n) return 'Undisclosed';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export default function FundingPage() {
  const totalRaised = VC_CATEGORIES_2026.reduce((s, c) => s + c.totalUsd, 0);
  const totalDeals  = VC_CATEGORIES_2026.reduce((s, c) => s + c.deals, 0);
  const maxCat      = VC_CATEGORIES_2026[0]?.totalUsd ?? 1;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Venture Funding"
        description="Crypto VC deals, funding categories, and notable rounds – Q1 2026 reference data."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Raised (est.)',  value: fmtUsd(totalRaised), color: '#FABF2C' },
          { label: 'Total Deals (est.)',   value: String(totalDeals),  color: '#FABF2C' },
          { label: 'Largest Category',     value: VC_CATEGORIES_2026[0]?.category ?? '—', color: '#fff' },
          { label: 'Data Vintage',         value: 'Q1 2026',          color: '#888', sub: 'Curated reference' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Category Bars ──────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-5">
          Funding by Category
        </h3>
        <div className="space-y-2">
          {VC_CATEGORIES_2026.map((c) => (
            <div key={c.category} className="flex items-center gap-3">
              <span className="w-36 text-right text-[10px] font-bold text-white shrink-0 truncate">{c.category}</span>
              <div className="flex-1 h-4 bg-[#111]">
                <div className="h-full bg-[#FABF2C] opacity-75" style={{ width: `${(c.totalUsd / maxCat) * 100}%` }} />
              </div>
              <span className="w-20 text-right font-mono text-[10px] text-[#FABF2C] tabular-nums shrink-0">{fmtUsd(c.totalUsd)}</span>
              <span className="w-12 text-right font-mono text-[10px] text-[#888] shrink-0">{c.deals}d</span>
              <span className="w-12 text-right font-mono text-[10px] text-[#555] shrink-0">{c.share.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Notable Deals Table ────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Notable Deals
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['Company', 'Round', 'Amount', 'Category', 'Lead Investors', 'Date'].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VC_DEALS_2026.map((d, i) => (
                <tr key={d.company} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                  <td className="px-4 py-3 font-bold text-white">{d.company}</td>
                  <td className="px-4 py-3 text-[#888]">{d.round}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-[#FABF2C] tabular-nums">{fmtUsd(d.amount)}</td>
                  <td className="px-4 py-3"><span className="text-[10px] font-mono text-[#888] border border-[#1a1a1a] px-2 py-0.5">{d.category}</span></td>
                  <td className="px-4 py-3 text-[#555] font-mono">{d.investors.join(', ')}</td>
                  <td className="px-4 py-3 text-[#555] font-mono">{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Curated reference data · Live integration via RootData API planned
        </p>
      </div>
    </div>
  );
}
