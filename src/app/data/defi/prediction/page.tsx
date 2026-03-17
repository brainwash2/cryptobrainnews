import React, { Suspense }  from 'react';
import { DataHeader }        from '../../_components/DataHeader';
import { ChartSkeleton }     from '../../_components/ChartSkeleton';
import { getPolymarketTop } from '@/lib/defi-data';

export const metadata = {
  title: 'Prediction Markets | CryptoBrainNews',
  description: 'Polymarket top markets by volume and open interest.',
};
export const revalidate = 600;

function fmtUsd(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

async function PredictionData() {
  const markets   = await getPolymarketTop(20).catch(() => []);
  const totalVol  = markets.reduce((s, m) => s + m.volume, 0);
  const totalOI   = markets.reduce((s, m) => s + m.openInt, 0);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Prediction Markets"
        description="Polymarket top markets by volume and open interest – live from Polymarket Gamma API."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume',        value: fmtUsd(totalVol),       color: '#00d672' },
          { label: 'Total Open Interest', value: fmtUsd(totalOI),        color: '#FABF2C' },
          { label: 'Active Markets',      value: String(markets.length), color: '#888' },
          { label: 'Source',              value: 'Polymarket',           color: '#888', sub: 'Gamma API · 10 min cache' },
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
          <span className="w-2 h-2 bg-[#00d672] rounded-full animate-pulse" />
          Top Markets by Volume
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Market', 'YES Price', 'Volume', 'Open Interest'].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${['YES Price','Volume','Open Interest'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {markets.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[#555] font-mono text-xs">Syncing Polymarket data...</td></tr>
              )}
              {markets.map((m, i) => (
                <tr key={m.id} className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                  <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-white max-w-xs">
                    
                      href={`https://polymarket.com/event/${m.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#FABF2C] transition-colors line-clamp-2"
                    >
                      {m.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-black tabular-nums text-xs ${
                      m.yesPrice > 0.7 ? 'text-[#00d672]' : m.yesPrice < 0.3 ? 'text-[#ff4757]' : 'text-[#FABF2C]'
                    }`}>
                      {(m.yesPrice * 100).toFixed(0)}¢
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#FABF2C]">{fmtUsd(m.volume)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">{fmtUsd(m.openInt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Source: Polymarket Gamma API · YES price = implied probability · Cached 10 min
        </p>
      </div>
    </div>
  );
}

export default function PredictionPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <PredictionData />
      </Suspense>
    </main>
  );
}
