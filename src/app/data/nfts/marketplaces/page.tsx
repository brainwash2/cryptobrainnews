import React, { Suspense }      from 'react';
import { DataHeader }            from '../../_components/DataHeader';
import { ChartSkeleton }         from '../../_components/ChartSkeleton';
import { getNftMarketplaces }    from '@/lib/nft-data';

export const metadata = {
  title: 'NFT Marketplaces | CryptoBrainNews',
  description: 'NFT marketplace rankings by volume, market share, and chain coverage.',
};
export const revalidate = 86400;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

async function MarketplacesData() {
  const marketplaces = await getNftMarketplaces();
  const totalVol     = marketplaces.reduce((s, m) => s + m.volume30dUsd, 0);
  const maxVol       = marketplaces[0]?.volume30dUsd ?? 1;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="NFT Marketplaces"
        description="NFT marketplace rankings by 30-day volume, market share, and chain specialisation."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total 30d Volume',     value: fmtUsd(totalVol),            color: '#FABF2C' },
          { label: 'Marketplaces Tracked', value: String(marketplaces.length), color: '#888' },
          { label: '#1 Platform',          value: marketplaces[0]?.name ?? '—', color: '#fff', sub: `${marketplaces[0]?.marketShare.toFixed(1)}% share` },
          { label: 'Data Vintage',         value: 'Q1 2026',                   color: '#888', sub: 'Reference estimates' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Market Share Bars ──────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-6">
          30-Day Volume Market Share
        </h3>
        <div className="space-y-3">
          {marketplaces.map((m) => (
            <div key={m.name} className="flex items-center gap-3">
              <span className="w-28 text-right text-[10px] font-bold text-white shrink-0">{m.name}</span>
              <div className="flex-1 h-5 bg-[#111]">
                <div className="h-full bg-[#FABF2C] opacity-80"
                     style={{ width: `${(m.volume30dUsd / maxVol) * 100}%` }} />
              </div>
              <span className="w-20 text-right font-mono text-[10px] text-[#FABF2C] tabular-nums shrink-0">{fmtUsd(m.volume30dUsd)}</span>
              <span className="w-12 text-right font-mono text-[10px] text-[#555] shrink-0">{m.marketShare.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Marketplace Table ──────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          All Marketplaces
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Platform', 'Chain', '30d Volume', 'Market Share', 'Description'].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${['30d Volume','Market Share'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marketplaces.map((m, i) => (
                <tr key={m.name} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                  <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-white">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#FABF2C] transition-colors">
                      {m.name} ↗
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[#888]">{m.chain}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-[#FABF2C] tabular-nums">{fmtUsd(m.volume30dUsd)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">{m.marketShare.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-[#555] font-mono">{m.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">Reference data Q1 2026 · Live tracking via Dune planned</p>
      </div>
    </div>
  );
}

export default function NftMarketplacesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <MarketplacesData />
      </Suspense>
    </main>
  );
}
