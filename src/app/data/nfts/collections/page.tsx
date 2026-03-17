import React, { Suspense }   from 'react';
import { DataHeader }         from '../../_components/DataHeader';
import { ChartSkeleton }      from '../../_components/ChartSkeleton';
import { getTopCollections }  from '@/lib/nft-data';

export const metadata = {
  title: 'Top NFT Collections | CryptoBrainNews',
  description: 'Top NFT collections ranked by 24h volume – floor prices, owners, and supply.',
};
export const revalidate = 3600;

function fmtUsd(n: number | null | undefined): string {
  if (!n) return '—';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

async function CollectionsData() {
  const collections = await getTopCollections();
  const totalVol    = collections.reduce((s, c) => s + (c.volume24hUsd ?? 0), 0);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Top NFT Collections"
        description="Ranked by 24h trading volume – floor price, owners, and supply metrics."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Collections Tracked', value: String(collections.length),  color: '#FABF2C' },
          { label: 'Total 24h Volume',    value: totalVol > 0 ? fmtUsd(totalVol) : '—', color: '#FABF2C' },
          { label: 'Source',              value: 'Reservoir API',             color: '#888', sub: 'demo key · cached 1h' },
          { label: 'Fallback',            value: 'Reference Data',            color: '#888', sub: 'if API rate-limited' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          All Collections
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Collection', 'Chain', 'Floor (ETH)', 'Floor (USD)', '24h Vol', '7d Vol', 'Owners', 'Supply'].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest whitespace-nowrap ${['#','Collection','Chain'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collections.map((c, i) => (
                <tr key={c.id} className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                  <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {c.imageUrl && (
                        <img src={c.imageUrl} alt={c.name} width={20} height={20} className="rounded-full shrink-0" />
                      )}
                      <span className="font-bold text-white whitespace-nowrap">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#888]">{c.chain}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#FABF2C]">
                    {c.floorPriceEth != null ? `${c.floorPriceEth.toFixed(2)} Ξ` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {c.floorPriceUsd != null ? fmtUsd(c.floorPriceUsd) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black tabular-nums text-[#FABF2C]">
                    {c.volume24hUsd != null ? fmtUsd(c.volume24hUsd) : c.volume24hEth != null ? `${c.volume24hEth.toFixed(0)} Ξ` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {c.volume7dUsd != null ? fmtUsd(c.volume7dUsd) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {c.owners != null ? c.owners.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#555]">
                    {c.totalSupply != null ? c.totalSupply.toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Source: Reservoir API (demo key) with seed fallback · Cached 1 hour
        </p>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <CollectionsData />
      </Suspense>
    </main>
  );
}
