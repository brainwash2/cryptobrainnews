import React, { Suspense }              from 'react';
import { DataHeader }                   from '../../_components/DataHeader';
import { ChartSkeleton }                from '../../_components/ChartSkeleton';
import { getDexFlowsByChain }           from '@/lib/onchain-data';

export const metadata = {
  title: 'CEX / DEX Flows | CryptoBrainNews',
  description: 'Exchange inflows and outflows – DEX volume by protocol as a proxy for on-chain flow activity.',
};
export const revalidate = 1800;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

async function FlowsData() {
  const dexFlows = await getDexFlowsByChain();
  const total24h = dexFlows.reduce((s, d) => s + d.total24h, 0);
  const total7d  = dexFlows.reduce((s, d) => s + d.total7d, 0);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Exchange Flows"
        description="DEX protocol volumes as an on-chain flow proxy – top protocols by 24h volume."
      />

      {/* ── Note on CEX flows ─────────────────────────────────────── */}
      <div className="border border-[#FABF2C]/20 bg-[#FABF2C]/[0.02] p-5">
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          <span className="text-[#FABF2C] font-black">About CEX flows:</span>{' '}
          True CEX inflow/outflow data requires Nansen or Glassnode (paid APIs).
          This page shows DEX protocol volumes from DefiLlama as a free-tier proxy for on-chain
          exchange activity. Whale transfer data (Dune Query 7) will be integrated once query IDs are configured.
        </p>
      </div>

      {/* ── KPI Strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total 24h DEX Volume', value: fmtUsd(total24h),          color: '#FABF2C' },
          { label: 'Total 7d DEX Volume',  value: fmtUsd(total7d),           color: '#FABF2C' },
          { label: 'Protocols Tracked',    value: String(dexFlows.length),   color: '#888' },
          { label: 'Source',               value: 'DefiLlama', sub: '30-min cache', color: '#888' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── DEX Protocol Volume Table ─────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Top DEX Protocols by Volume
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Protocol', '24h Volume', '7d Volume', '24h Change', 'Share of 24h'].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                      h === '#' || h === 'Protocol' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dexFlows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#555] font-mono text-xs">
                    Syncing flow data...
                  </td>
                </tr>
              )}
              {dexFlows.map((d, i) => {
                const share = total24h > 0 ? (d.total24h / total24h) * 100 : 0;
                const chg   = d.change_1d;
                return (
                  <tr
                    key={d.name}
                    className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                      i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                    }`}
                  >
                    <td className="px-4 py-3 text-[#555] tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-white">{d.name}</td>
                    <td className="px-4 py-3 text-right font-mono font-black tabular-nums text-[#FABF2C]">
                      {fmtUsd(d.total24h)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {fmtUsd(d.total7d)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {chg !== null ? (
                        <span className={`font-mono font-bold tabular-nums text-xs ${chg >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                          {chg >= 0 ? '+' : ''}{chg.toFixed(1)}%
                        </span>
                      ) : <span className="text-[#333]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#555]">
                      {share.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Source: DefiLlama · Cached 30 min
        </p>
      </div>
    </div>
  );
}

export default function FlowsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <FlowsData />
      </Suspense>
    </main>
  );
}
