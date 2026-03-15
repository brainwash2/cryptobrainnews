import React, { Suspense }       from 'react';
import { DataHeader }             from '../../_components/DataHeader';
import { ChartSkeleton }          from '../../_components/ChartSkeleton';
import ScalingTable               from '../_components/ScalingTable';
import TvlBars                    from '../_components/TvlBars';
import { getL1NonEvmChains }      from '@/lib/scaling-data';

export const metadata = {
  title: 'L1 Non-EVM Blockchains | CryptoBrainNews',
  description: 'Solana, TON, NEAR, Cardano and other non-EVM Layer 1 blockchains by TVL and ecosystem activity.',
};
export const revalidate = 3600;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return n > 0 ? `$${n.toLocaleString()}` : '—';
}

const VM_INFO: Record<string, { vm: string; consensus: string }> = {
  'Solana':     { vm: 'Sealevel (SVM)',     consensus: 'PoH + Tower BFT' },
  'Tron':       { vm: 'TVM (EVM-like)',      consensus: 'DPoS' },
  'TON':        { vm: 'TVM (FunC/Tact)',    consensus: 'BFT PoS (Catchain)' },
  'Cardano':    { vm: 'Plutus (Haskell)',   consensus: 'Ouroboros PoS' },
  'NEAR':       { vm: 'WASM + Aurora EVM', consensus: 'Nightshade sharding' },
  'Cosmos Hub': { vm: 'CosmWasm',           consensus: 'Tendermint BFT' },
  'Algorand':   { vm: 'AVM (TEAL)',          consensus: 'Pure PoS (BA★)' },
  'Aptos':      { vm: 'MoveVM',             consensus: 'AptosBFT (DiemBFT v4)' },
};

async function L1NonEvmData() {
  const chains   = await getL1NonEvmChains();
  const totalTvl = chains.reduce((s, c) => s + c.tvl, 0);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Layer 1: Non-EVM Blockchains"
        description="Non-EVM Layer 1 chains – Solana, Tron, TON, NEAR, Cardano, Cosmos, and more."
      />

      {/* ── KPI Strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Non-EVM TVL', value: fmtUsd(totalTvl),              color: '#f97316' },
          { label: 'Leading Chain',      value: chains[0]?.name ?? '—',        color: '#fff', sub: fmtUsd(chains[0]?.tvl ?? 0) },
          { label: 'Chains Tracked',     value: String(chains.length),         color: '#888' },
          { label: 'Solana TVL',         value: fmtUsd(chains.find(c => c.name === 'Solana')?.tvl ?? 0), color: '#9945ff' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── TVL Bars ───────────────────────────────────────────────── */}
      <TvlBars chains={chains} title="Non-EVM L1 TVL Market Share" />

      {/* ── VM & Consensus Table ───────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#f97316] rounded-full" />
          Virtual Machine &amp; Consensus Reference
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['Chain', 'VM / Runtime', 'Consensus', 'TVL', '24h %'].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${['TVL', '24h %'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chains.map((c, i) => {
                const info = VM_INFO[c.name];
                return (
                  <tr key={c.slug} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        <span className="font-bold text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#f97316]">{info?.vm ?? '—'}</td>
                    <td className="px-4 py-3 text-[#888]">{info?.consensus ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-mono font-black tabular-nums" style={{ color: c.color }}>
                      {fmtUsd(c.tvl)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.change1d != null ? (
                        <span className={`font-mono font-bold text-xs ${c.change1d >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                          {c.change1d >= 0 ? '+' : ''}{c.change1d.toFixed(2)}%
                        </span>
                      ) : <span className="text-[#333]">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">Source: DefiLlama · Cached 1 hour</p>
      </div>

      {/* ── Full TVL table ─────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#f97316] rounded-full" />
          TVL &amp; Protocol Rankings
        </h3>
        <ScalingTable chains={chains} />
      </div>
    </div>
  );
}

export default function L1NonEvmPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <L1NonEvmData />
      </Suspense>
    </main>
  );
}
