import React, { Suspense }     from 'react';
import { DataHeader }           from '../../_components/DataHeader';
import { ChartSkeleton }        from '../../_components/ChartSkeleton';
import ScalingTable             from '../_components/ScalingTable';
import TvlBars                  from '../_components/TvlBars';
import { getZkRollups }         from '@/lib/scaling-data';

export const metadata = {
  title: 'ZK Rollups | CryptoBrainNews',
  description: 'zkSync Era, Starknet, Scroll, Linea, Polygon zkEVM – TVL, ecosystem size, and ZK proof technology.',
};
export const revalidate = 3600;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return n > 0 ? `$${n.toLocaleString()}` : '—';
}

const ZK_TECH = [
  { name: 'zkSync Era',     tech: 'PLONK / Boojum', vm: 'EVM-compatible',  company: 'Matter Labs' },
  { name: 'Starknet',       tech: 'STARK',           vm: 'Cairo VM',         company: 'StarkWare' },
  { name: 'Scroll',         tech: 'KZG / PLONK',    vm: 'EVM-equivalent',  company: 'Scroll Foundation' },
  { name: 'Linea',          tech: 'PLONK',           vm: 'EVM-equivalent',  company: 'ConsenSys' },
  { name: 'Polygon zkEVM',  tech: 'FFLONK',          vm: 'EVM-equivalent',  company: 'Polygon Labs' },
  { name: 'Manta Pacific',  tech: 'KZG / Plonky2',  vm: 'EVM-compatible',  company: 'Manta Network' },
];

async function ZkRollupsData() {
  const chains = await getZkRollups();
  const totalTvl = chains.reduce((s, c) => s + c.tvl, 0);

  const techMap = new Map(ZK_TECH.map((t) => [t.name, t]));

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Zero-Knowledge Rollups"
        description="Validity-proof based rollups – instant finality, no challenge window. TVL and ecosystem metrics."
      />

      {/* ── KPI Strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total ZK TVL',      value: fmtUsd(totalTvl),        color: '#8b5cf6' },
          { label: 'Leading Network',   value: chains[0]?.name ?? '—',  color: '#fff', sub: fmtUsd(chains[0]?.tvl ?? 0) },
          { label: 'Networks Tracked',  value: String(chains.length),   color: '#888' },
          { label: 'Mechanism',         value: 'Validity Proofs',       color: '#8b5cf6', sub: 'Instant finality' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── TVL Bars ───────────────────────────────────────────────── */}
      <TvlBars chains={chains} title="ZK Rollup TVL Market Share" />

      {/* ── Technology Comparison Table ────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#8b5cf6] rounded-full" />
          Proof Technology Comparison
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['Network', 'Proof System', 'VM Type', 'Developer', 'TVL'].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${h === 'TVL' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chains.map((c, i) => {
                const tech = techMap.get(c.name);
                return (
                  <tr key={c.slug} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        <span className="font-bold text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#8b5cf6]">{tech?.tech ?? '—'}</td>
                    <td className="px-4 py-3 text-[#888]">{tech?.vm ?? '—'}</td>
                    <td className="px-4 py-3 text-[#888]">{tech?.company ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-mono font-black tabular-nums" style={{ color: c.color }}>
                      {fmtUsd(c.tvl)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Full TVL / Change Table ─────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#8b5cf6] rounded-full" />
          TVL & Growth Metrics
        </h3>
        <ScalingTable chains={chains} />
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">Source: DefiLlama · Cached 1 hour</p>
      </div>

      {/* ── Tech explainer ─────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">ZK vs Optimistic Rollups</h3>
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          ZK rollups generate a cryptographic validity proof for every batch of transactions.
          This proof is verified on Ethereum L1, making withdrawals instant (no 7-day challenge window).
          The tradeoff is computational cost of proof generation. Two main proof systems are used:
          <span className="text-[#8b5cf6]"> STARKs</span> (no trusted setup, larger proofs, used by Starknet) and
          <span className="text-[#8b5cf6]"> SNARKs/PLONK</span> (smaller proofs, require trusted setup, used by zkSync/Scroll/Linea).
          EVM-equivalence refers to bytecode-level compatibility; EVM-compatible requires recompilation.
        </p>
      </div>
    </div>
  );
}

export default function ZKPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <ZkRollupsData />
      </Suspense>
    </main>
  );
}
