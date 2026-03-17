import React, { Suspense }          from 'react';
import { DataHeader }                from '../../_components/DataHeader';
import { ChartSkeleton }             from '../../_components/ChartSkeleton';
import { getKnownCollections }       from '@/lib/nft-data';

export const metadata = {
  title: 'Art & Collectibles NFTs | CryptoBrainNews',
  description: 'Top NFT art and collectible collections – floor prices, volume, and market context.',
};
export const revalidate = 3600;

function fmtUsd(n: number | null | undefined): string {
  if (!n) return '—';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const ART_CATEGORIES = [
  {
    label: 'Generative Art',
    description: 'Algorithmically generated art, often stored fully on-chain.',
    examples: ['Art Blocks Curated', 'Chromie Squiggle', 'Fidenza', 'Ringers'],
    color: '#ec4899',
  },
  {
    label: 'PFP Collections',
    description: 'Profile picture projects with community and utility focus.',
    examples: ['CryptoPunks', 'Bored Apes', 'Azuki', 'Pudgy Penguins'],
    color: '#3b82f6',
  },
  {
    label: 'Photography / 1/1s',
    description: 'Single-edition digital photographs and unique artworks.',
    examples: ['Beeple', 'Justin Aversano', 'Jack Butcher'],
    color: '#f97316',
  },
  {
    label: 'Bitcoin Ordinals',
    description: 'Inscriptions on individual satoshis — fully on-chain on Bitcoin.',
    examples: ['Bitcoin Punks', 'Ordinal Maxi Biz', 'Rare Sats'],
    color: '#FABF2C',
  },
];

async function ArtData() {
  const collections = getKnownCollections().filter((c) =>
    ['CryptoPunks', 'Bored Ape Yacht Club', 'Azuki', 'Pudgy Penguins', 'Milady Maker', 'Mutant Ape Yacht Club'].includes(c.name)
  );

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Art & Collectibles"
        description="NFT art and collectible collections – PFPs, generative art, photography, and Bitcoin Ordinals."
      />

      {/* ── Category Overview ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ART_CATEGORIES.map((cat) => (
          <div
            key={cat.label}
            className="bg-[#0a0a0a] border border-[#1a1a1a] p-5"
            style={{ borderLeftColor: cat.color, borderLeftWidth: 3 }}
          >
            <h3 className="text-sm font-black uppercase tracking-tight text-white mb-2"
                style={{ color: cat.color }}>
              {cat.label}
            </h3>
            <p className="text-[10px] font-mono text-[#888] leading-relaxed mb-3">{cat.description}</p>
            <p className="text-[10px] text-[#555] font-mono">
              Examples: {cat.examples.join(' · ')}
            </p>
          </div>
        ))}
      </div>

      {/* ── Known Collections Floor Prices ─────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#3b82f6] rounded-full" />
          Blue-Chip PFP Collections
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Collection', 'Chain', 'Floor Price', 'Est. 24h Vol', 'Supply', 'Owners'].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${['#','Collection','Chain'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collections.map((c, i) => (
                <tr key={c.id} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                  <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                  <td className="px-4 py-3 text-[#888]">{c.chain}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-[#FABF2C] tabular-nums">
                    {c.floorPriceEth != null ? `${c.floorPriceEth} Ξ` : c.floorPriceUsd != null ? fmtUsd(c.floorPriceUsd) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {c.volume24hEth != null ? `${c.volume24hEth} Ξ` : c.volume24hUsd != null ? fmtUsd(c.volume24hUsd) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#555]">
                    {c.totalSupply?.toLocaleString() ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#555]">
                    {c.owners?.toLocaleString() ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Approximate reference data · Live floor prices via Reservoir API
        </p>
      </div>
    </div>
  );
}

export default function NftArtPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <ArtData />
      </Suspense>
    </main>
  );
}
