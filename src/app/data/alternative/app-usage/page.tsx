import React from 'react';
import { DataHeader }       from '../../_components/DataHeader';
import { APP_RANKINGS }     from '@/lib/alternative-data';

export const metadata = { title: 'Crypto App Rankings | CryptoBrainNews' };
export const revalidate = 86400;

export default function AppUsagePage() {
  const ios     = APP_RANKINGS.filter((a) => ['ios', 'both'].includes(a.platform));
  const android = APP_RANKINGS.filter((a) => ['android', 'both'].includes(a.platform));

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="App Usage & Rankings"
        description="Crypto app rankings on the App Store and Google Play – Finance and Utilities categories (US)."
      />

      <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
          <h3 className="text-xs font-black uppercase tracking-widest text-white">
            Finance Category Rankings (US · Q1 2026)
          </h3>
          <span className="text-[10px] font-mono text-[#555]">Curated reference data</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#080808]">
              {['Rank', 'App', 'Category', 'Platform', 'WoW Change'].map((h) => (
                <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${h === 'Rank' || h === 'WoW Change' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ios.map((a, i) => (
              <tr key={a.app} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                <td className="px-4 py-3 text-right font-mono font-black text-[#FABF2C] tabular-nums">#{a.rank}</td>
                <td className="px-4 py-3 font-bold text-white">{a.app}</td>
                <td className="px-4 py-3 text-[#888]">{a.category}</td>
                <td className="px-4 py-3 text-[#555] font-mono capitalize">{a.platform}</td>
                <td className="px-4 py-3 text-right">
                  {a.change !== null ? (
                    <span className={`font-mono font-bold text-xs ${a.change > 0 ? 'text-[#00d672]' : a.change < 0 ? 'text-[#ff4757]' : 'text-[#555]'}`}>
                      {a.change > 0 ? `▲ ${a.change}` : a.change < 0 ? `▼ ${Math.abs(a.change)}` : '—'}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-[#333] font-mono text-right">Reference data Q1 2026 · Live Sensor Tower integration planned</p>
    </div>
  );
}
