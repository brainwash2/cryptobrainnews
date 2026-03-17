import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import { Clock }       from 'lucide-react';

export const metadata = {
  title: 'Gaming NFTs | CryptoBrainNews',
  description: 'Blockchain gaming NFT volume, top games, and market context.',
};
export const revalidate = 3600;

const TOP_GAMES = [
  { name: 'Axie Infinity',    chain: 'Ronin',    token: 'AXS',  type: 'Play-to-Earn',      active: true,  note: 'Pioneer P2E, declining from peak' },
  { name: 'Gods Unchained',   chain: 'Immutable X', token: 'GODS', type: 'Trading Card',   active: true,  note: 'Immutable ecosystem card game' },
  { name: 'Parallel',         chain: 'Ethereum', token: 'PRIME', type: 'Trading Card',     active: true,  note: 'Sci-fi CCG with AI agents (Colony)' },
  { name: 'Illuvium',         chain: 'Immutable', token: 'ILV', type: 'Open World RPG',    active: true,  note: 'Flagship Immutable RPG' },
  { name: 'The Sandbox',      chain: 'Ethereum', token: 'SAND', type: 'Metaverse',          active: true,  note: 'User-generated content metaverse' },
  { name: 'Decentraland',     chain: 'Ethereum', token: 'MANA', type: 'Metaverse',          active: true,  note: 'Ethereum metaverse with virtual land' },
  { name: 'Star Atlas',       chain: 'Solana',   token: 'ATLAS', type: 'Space MMO',         active: true,  note: 'High-fidelity Solana space game' },
  { name: 'Off The Grid',     chain: 'Gunzilla', token: 'GUN',  type: 'Battle Royale',      active: true,  note: 'AAA game on custom chain' },
  { name: 'Shrapnel',         chain: 'Avalanche',token: 'SHRAP', type: 'FPS Extraction',   active: true,  note: 'AAA extraction shooter on Avalanche' },
  { name: 'Nyan Heroes',      chain: 'Solana',   token: 'NYAN', type: 'Battle Royale',      active: true,  note: 'Cat-themed hero shooter on Solana' },
];

function fmtNum(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

export default function NftGamingPage() {
  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Gaming NFTs"
        description="Blockchain gaming ecosystem – active games, in-game NFT volume, and player economics."
      />

      <div className="border border-[#FABF2C]/20 bg-[#FABF2C]/[0.02] p-5 flex gap-4 items-start">
        <Clock className="text-[#FABF2C] shrink-0 mt-0.5" size={18} />
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          <span className="text-[#FABF2C] font-black">Live data:</span>{' '}
          Real-time gaming NFT volume from Dune Analytics activates once query IDs are configured.
          The table below shows active blockchain games as of Q1 2026.
        </p>
      </div>

      {/* ── Sector KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Blockchain Games', value: String(TOP_GAMES.length),      color: '#00d672' },
          { label: 'Chains Represented',       value: '6',                           color: '#FABF2C' },
          { label: 'Sector Leader',            value: 'Axie Infinity',              color: '#fff', sub: 'by historical volume' },
          { label: 'Emerging Leader',          value: 'Parallel / Off The Grid',    color: '#888', sub: 'AAA blockchain gaming' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Game Directory Table ─────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#00d672] rounded-full" />
          Active Blockchain Games
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Game', 'Chain', 'Token', 'Genre', 'Notes'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_GAMES.map((g, i) => (
                <tr key={g.name} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                  <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-white">{g.name}</td>
                  <td className="px-4 py-3 text-[#888]">{g.chain}</td>
                  <td className="px-4 py-3 font-mono text-[#FABF2C]">{g.token}</td>
                  <td className="px-4 py-3 text-[#888]">{g.type}</td>
                  <td className="px-4 py-3 text-[#555] font-mono">{g.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
