import React, { Suspense }        from 'react';
import { DataHeader }              from '../../_components/DataHeader';
import { ChartSkeleton }           from '../../_components/ChartSkeleton';
import { getNftChainVolumes }      from '@/lib/nft-data';

export const metadata = {
  title: 'NFT Trade Volume | CryptoBrainNews',
  description: 'NFT trade volume by chain, daily sales, and marketplace activity.',
};
export const revalidate = 3600;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

async function NftVolumeData() {
  const chainVolumes = await getNftChainVolumes();

  const total24h = chainVolumes.reduce((s, c) => s + c.volume24h, 0);
  const total7d  = chainVolumes.reduce((s, c) => s + c.volume7d, 0);
  const maxVol   = chainVolumes[0]?.volume24h ?? 1;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="NFT Trade Volume"
        description="NFT trading activity by blockchain – 24h and 7d volume, trade counts, and chain market share."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total NFT Volume (24h)', value: fmtUsd(total24h), color: '#FABF2C' },
          { label: 'Total NFT Volume (7d)',  value: fmtUsd(total7d),  color: '#FABF2C' },
          { label: 'Chains Tracked',         value: String(chainVolumes.length), color: '#888' },
          { label: 'Source',                 value: 'Reference Data', color: '#888', sub: 'Live Dune pending' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-6">
          24h Volume by Chain
        </h3>
        <div className="space-y-3">
          {chainVolumes.map((c) => {
            const share = total24h > 0 ? (c.volume24h / total24h) * 100 : 0;
            return (
              <div key={c.chain} className="flex items-center gap-3">
                <span className="w-20 text-right text-[10px] font-bold text-white shrink-0">{c.chain}</span>
                <div className="flex-1 h-5 bg-[#111]">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${(c.volume24h / maxVol) * 100}%`, background: c.color, opacity: 0.8 }}
                  />
                </div>
                <span className="w-20 text-right font-mono text-[10px] tabular-nums shrink-0" style={{ color: c.color }}>
                  {fmtUsd(c.volume24h)}
                </span>
                <span className="w-12 text-right font-mono text-[10px] text-[#555] shrink-0">
                  {share.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Volume by Blockchain
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['Chain', '24h Volume', '7d Volume', '24h Trades', '24h Share'].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${h === 'Chain' ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
               </tr>
            </thead>
            <tbody>
              {chainVolumes.map((c, i) => {
                const share = total24h > 0 ? (c.volume24h / total24h) * 100 : 0;
                return (
                  <tr key={c.chain} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        <span className="font-bold text-white">{c.chain}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black tabular-nums" style={{ color: c.color }}>{fmtUsd(c.volume24h)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">{fmtUsd(c.volume7d)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">{c.tradeCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#555]">{share.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Reference data · Dune Analytics integration pending
        </p>
      </div>
    </div>
  );
}

export default function NftVolumePage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <NftVolumeData />
      </Suspense>
    </main>
  );
}
