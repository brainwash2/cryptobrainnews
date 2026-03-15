import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import { Clock }      from 'lucide-react';

export const metadata = { title: 'Solana Treasuries | CryptoBrainNews' };

// Publicly known SOL treasury companies as of Q1 2026
const KNOWN_HOLDERS = [
  { name: 'DeFi Development Corp', symbol: 'DFDV',  country: 'US',   approxSol: 600_000, note: 'Formerly Janover' },
  { name: 'Sol Strategies',        symbol: 'HODL',  country: 'CA',   approxSol: 170_000, note: 'TSX listed' },
  { name: 'Upexi',                  symbol: 'UPXI',  country: 'US',   approxSol:  75_000, note: 'Nasdaq listed' },
];

export default function SolanaTreasuriesPage() {
  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Solana Treasuries"
        description="Public companies holding SOL on their balance sheet – known holdings as of Q1 2026."
      />

      <div className="border border-[#FABF2C]/20 bg-[#FABF2C]/[0.02] p-5 flex gap-4 items-start">
        <Clock className="text-[#FABF2C] shrink-0 mt-0.5" size={18} />
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          <span className="text-[#FABF2C] font-black">Data note:</span> CoinGecko does not yet provide a
          public API for Solana corporate treasuries. The table below shows known publicly disclosed SOL
          holdings. Automated live data will be added when a reliable free API becomes available.
        </p>
      </div>

      <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#080808]">
              {['Company', 'Ticker', 'Country', 'Approx SOL Holdings', 'Note'].map((h) => (
                <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${h === 'Approx SOL Holdings' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {KNOWN_HOLDERS.map((c, i) => (
              <tr key={c.name} className={`border-b border-[#111] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                <td className="px-4 py-3 font-mono text-[#FABF2C]">{c.symbol}</td>
                <td className="px-4 py-3 text-[#888]">{c.country}</td>
                <td className="px-4 py-3 text-right font-mono font-black text-[#9945ff] tabular-nums">
                  {c.approxSol.toLocaleString()} SOL
                </td>
                <td className="px-4 py-3 text-[#555] font-mono">{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
