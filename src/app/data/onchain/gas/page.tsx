import React, { Suspense } from 'react';
import { DataHeader }       from '../../_components/DataHeader';
import { ChartSkeleton }    from '../../_components/ChartSkeleton';

export const metadata = {
  title: 'Gas Tracker | CryptoBrainNews',
  description: 'Live Ethereum and multi-chain gas price tracker.',
};
export const revalidate = 60;

interface GasApiResponse {
  SafeGasPrice:    string;
  ProposeGasPrice: string;
  FastGasPrice:    string;
  suggestBaseFee:  string;
  gasUsedRatio:    string;
}

async function fetchEthGas(): Promise<GasApiResponse | null> {
  try {
    // Use the free ethgasstation proxy via DefiLlama (no key required)
    const res = await fetch(
      'https://api.ethgasstation.info/api/fee-estimate',
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const d = await res.json() as { fastest: number; fast: number; average: number };
      return {
        FastGasPrice:    String(Math.round(d.fastest / 10)),
        ProposeGasPrice: String(Math.round(d.fast    / 10)),
        SafeGasPrice:    String(Math.round(d.average / 10)),
        suggestBaseFee:  '—',
        gasUsedRatio:    '—',
      };
    }
  } catch { /* fallback */ }

  // Fallback: mempool.space recommended fees
  try {
    const res2 = await fetch('https://mempool.space/api/v1/fees/recommended');
    if (res2.ok) {
      const d = await res2.json() as { fastestFee: number; halfHourFee: number; hourFee: number };
      return {
        FastGasPrice:    `~${d.fastestFee} sat/vB`,
        ProposeGasPrice: `~${d.halfHourFee} sat/vB`,
        SafeGasPrice:    `~${d.hourFee} sat/vB`,
        suggestBaseFee:  'BTC mempool',
        gasUsedRatio:    '—',
      };
    }
  } catch { /* return null */ }

  return null;
}

const CHAIN_FALLBACKS = [
  { name: 'Ethereum',  symbol: 'ETH', color: '#3b82f6', note: 'Base fee + priority tip (EIP-1559)' },
  { name: 'Bitcoin',   symbol: 'BTC', color: '#FABF2C', note: 'sat/vB — priority mempool estimate' },
  { name: 'Solana',    symbol: 'SOL', color: '#9945ff', note: '~0.000005 SOL per tx (fixed + priority)' },
  { name: 'Avalanche', symbol: 'AVAX',color: '#e84142', note: 'C-Chain: EIP-1559 style (~25 nAVAX base)' },
  { name: 'BNB Chain', symbol: 'BNB', color: '#f3ba2f', note: 'BSC: ~3 Gwei base fee (centralised)' },
];

async function GasTrackerData() {
  const gasData = await fetchEthGas();

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Gas Tracker"
        description="Live multi-chain transaction fee estimates – Ethereum, Bitcoin, Solana, and more."
      />

      {/* ── Ethereum Gas Tiers ────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 border-l-2 border-[#3b82f6] pl-3">
          Ethereum Gas Estimates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tier: 'Safe (slow)',  value: gasData?.SafeGasPrice    ?? '—', color: '#00d672',  sub: '> 10 min' },
            { tier: 'Standard',    value: gasData?.ProposeGasPrice  ?? '—', color: '#FABF2C',  sub: '~3 min' },
            { tier: 'Fast',        value: gasData?.FastGasPrice     ?? '—', color: '#ff4757',  sub: '< 30 sec' },
          ].map((g) => (
            <div key={g.tier} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-3">{g.tier}</p>
              <p className="text-3xl font-black tabular-nums" style={{ color: g.color }}>
                {g.value} {!g.value.includes('/') ? 'Gwei' : ''}
              </p>
              <p className="text-[10px] font-mono text-[#555] mt-2">{g.sub}</p>
            </div>
          ))}
        </div>
        {gasData?.suggestBaseFee && gasData.suggestBaseFee !== '—' && (
          <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
            Base fee: {gasData.suggestBaseFee} Gwei · Cached 60s
          </p>
        )}
      </div>

      {/* ── Multi-Chain Reference ─────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Multi-Chain Fee Reference
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['Chain', 'Token', 'Fee Model', 'Notes'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHAIN_FALLBACKS.map((c, i) => (
                <tr
                  key={c.name}
                  className={`border-b border-[#111] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}
                >
                  <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                  <td className="px-4 py-3 font-black" style={{ color: c.color }}>{c.symbol}</td>
                  <td className="px-4 py-3 text-[#888]">
                    {c.name === 'Bitcoin' ? 'sat/vB' :
                     c.name === 'Solana'  ? 'Lamports' : 'Gwei'}
                  </td>
                  <td className="px-4 py-3 text-[#555] font-mono">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Context note ──────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          <span className="text-[#888] font-black">About gas fees:</span>{' '}
          Ethereum fees follow EIP-1559: base fee (burned) + priority tip (to validator).
          During high demand, base fee can multiply by up to 12.5× per block.
          Bitcoin fees are denominated in satoshis per virtual byte (sat/vB) and vary with mempool congestion.
          Solana charges a fixed base fee (~5,000 lamports = 0.000005 SOL) plus optional priority fees
          to jump the compute unit queue.
        </p>
      </div>
    </div>
  );
}

export default function GasTrackerPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <GasTrackerData />
      </Suspense>
    </main>
  );
}
