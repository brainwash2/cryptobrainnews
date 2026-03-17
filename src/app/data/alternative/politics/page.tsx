import React from 'react';
import { DataHeader }    from '../../_components/DataHeader';
import { PAC_DATA }      from '@/lib/alternative-data';

export const metadata = { title: 'Crypto Politics & PACs | CryptoBrainNews' };
export const revalidate = 86400;

function fmtUsd(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export default function PoliticsPage() {
  const totalRaised = PAC_DATA.reduce((s, p) => s + p.raised, 0);
  const totalSpent  = PAC_DATA.reduce((s, p) => s + p.spent, 0);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Crypto Politics & PACs"
        description="Crypto Political Action Committees – fundraising, spending, and electoral focus (2024 cycle)."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Raised',   value: fmtUsd(totalRaised),       color: '#FABF2C' },
          { label: 'Total Spent',    value: fmtUsd(totalSpent),        color: '#ff4757' },
          { label: 'PACs Tracked',   value: String(PAC_DATA.length),   color: '#888' },
          { label: 'Election Cycle', value: '2024',                    color: '#888', sub: 'Source: FEC public filings' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#080808]">
              {['Committee', 'Cycle', 'Raised', 'Spent', 'Political Focus'].map((h) => (
                <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${['Raised','Spent'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAC_DATA.map((p, i) => (
              <tr key={p.committee} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                <td className="px-4 py-3 font-bold text-white">{p.committee}</td>
                <td className="px-4 py-3 font-mono text-[#888]">{p.cycle}</td>
                <td className="px-4 py-3 text-right font-mono font-black text-[#00d672] tabular-nums">{fmtUsd(p.raised)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[#ff4757]">{fmtUsd(p.spent)}</td>
                <td className="px-4 py-3 text-[#555] font-mono">{p.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-[#333] font-mono text-right">Source: FEC public filings · Reference data</p>
    </div>
  );
}
