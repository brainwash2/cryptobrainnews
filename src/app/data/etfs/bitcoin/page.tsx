import React, { Suspense }   from 'react';
import { ChartSkeleton }      from '../../_components/ChartSkeleton';
import { FreshnessBadge }     from '@/components/common/FreshnessBadge';
import EtfPageLayout          from '../_components/EtfPageLayout';
import { getBtcEtfOverview }  from '@/lib/etf-data';
import { getWeeklyFlows }     from '@/lib/coinshares';

export const metadata = {
  title: 'Bitcoin Spot ETFs | CryptoBrainNews',
  description: 'Live AUM, market share, holdings, and fees for all US-listed spot Bitcoin ETFs.',
};
export const revalidate = 300;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

async function BtcEtfData() {
  const [overview, flows] = await Promise.all([
    getBtcEtfOverview(),
    getWeeklyFlows().catch(() => null),
  ]);

  return (
    <>
      <div className="flex items-center gap-3 pb-2">
        <FreshnessBadge ttlSeconds={300} />
      </div>
      <EtfPageLayout coin="BTC" overview={overview} />

      {flows && flows.latestWeek && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 mt-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
                ETF Weekly Flows — CoinShares
              </h3>
              <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
                Data updated weekly — manual entry · Source: coinshares.com/research
              </p>
            </div>
            <span className="border border-[#FABF2C]/40 text-[#FABF2C] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
              Week ending {new Date(flows.latestWeek.weekEnding).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'BTC Flow',     value: flows.latestWeek.btcFlowUsd,   color: '#FABF2C' },
              { label: 'ETH Flow',     value: flows.latestWeek.ethFlowUsd,   color: '#3b82f6' },
              { label: 'SOL Flow',     value: flows.latestWeek.solFlowUsd,   color: '#9945ff' },
              { label: 'Total Net',    value: flows.latestWeek.totalFlowUsd, color: '#00d672' },
              { label: 'Total AUM',    value: flows.latestWeek.aumUsd,       color: '#fff' },
            ].map((s) => {
              const isNegative = s.value < 0;
              return (
                <div key={s.label} className="border border-[#1a1a1a] bg-[#080808] p-4">
                  <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-xl font-black tabular-nums ${
                    s.label !== 'Total AUM' ? (isNegative ? 'text-[#ff4757]' : 'text-[#00d672]') : ''
                  }`} style={s.label === 'Total AUM' ? { color: s.color } : undefined}>
                    {s.label === 'Total AUM'
                      ? fmtUsd(s.value)
                      : `${isNegative ? '-' : '+'}$${(Math.abs(s.value) / 1e6).toFixed(1)}M`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border border-[#1a1a1a] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                  {['Week Ending', 'BTC Flow', 'ETH Flow', 'SOL Flow', 'Total Net', 'AUM'].map((h) => (
                    <th key={h} className={`px-3 py-2 font-black text-[#555] uppercase tracking-widest ${h === 'Week Ending' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flows.weeks.slice(0, 12).map((w, i) => (
                  <tr key={w.weekEnding} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                    <td className="px-3 py-2 font-mono text-[#888]">{w.weekEnding}</td>
                    <td className={`px-3 py-2 text-right font-mono tabular-nums ${w.btcFlowUsd >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                      {w.btcFlowUsd >= 0 ? '+' : ''}${(w.btcFlowUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className={`px-3 py-2 text-right font-mono tabular-nums ${w.ethFlowUsd >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                      {w.ethFlowUsd >= 0 ? '+' : ''}${(w.ethFlowUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className={`px-3 py-2 text-right font-mono tabular-nums ${w.solFlowUsd >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                      {w.solFlowUsd >= 0 ? '+' : ''}${(w.solFlowUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className={`px-3 py-2 text-right font-mono font-black tabular-nums ${w.totalFlowUsd >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                      {w.totalFlowUsd >= 0 ? '+' : ''}${(w.totalFlowUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-[#888]">${(w.aumUsd / 1e9).toFixed(1)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default function BitcoinEtfsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <BtcEtfData />
      </Suspense>
    </main>
  );
}
