import React, { Suspense }              from 'react';
import { DataHeader }                   from '../../_components/DataHeader';
import { ChartSkeleton }                from '../../_components/ChartSkeleton';
import { DefiTable, fmtUsd, PctBadge } from '../_components/DefiTable';
import { getDerivativesProtocols }      from '@/lib/defi-data';
import { cached }                       from '@/lib/cache';

export const metadata = {
  title: 'DeFi Derivatives | CryptoBrainNews',
  description: 'Hyperliquid, dYdX, GMX and all on-chain derivatives protocols by 24h volume and open interest.',
};
export const revalidate = 1800;

// ── Unit 4: Hyperliquid 24h perps volume — cached 5 min ──────────────────────

interface HLAssetCtx {
  dayNtlVlm?: string;
}

async function fetchHyperliquidVolume(): Promise<number | null> {
  return cached('hyperliquid:vol:24h', async () => {
    try {
      const res = await fetch('https://api.hyperliquid.xyz/info', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type: 'metaAndAssetCtxs' }),
        next:    { revalidate: 300 },
      });
      if (!res.ok) return null;
      const json = await res.json() as [unknown, HLAssetCtx[]];
      const assetCtxs = Array.isArray(json[1]) ? json[1] : [];
      const total = assetCtxs.reduce((s, a) => s + parseFloat(a.dayNtlVlm ?? '0'), 0);
      return total > 0 ? total : null;
    } catch {
      return null;
    }
  }, 300);
}

async function DerivativesData() {
  const [protocols, hlVol] = await Promise.all([
    getDerivativesProtocols(25),
    fetchHyperliquidVolume().catch(() => null),
  ]);

  const total24h = protocols.reduce((s, p) => s + (p.total24h ?? 0), 0);
  const totalOI  = protocols.reduce((s, p) => s + (p.totalOI  ?? 0), 0);
  const rows     = protocols.map((p) => ({ ...p })) as Record<string, unknown>[];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="DeFi Derivatives"
        description="On-chain perpetuals and derivatives – Hyperliquid, dYdX, GMX, and more. Volume and open interest."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume (24h)',       value: fmtUsd(total24h),         color: '#FABF2C' },
          { label: 'Total Open Interest',      value: fmtUsd(totalOI),          color: '#FABF2C' },
          { label: 'Protocols Tracked',        value: String(protocols.length), color: '#888'    },
          { label: 'Source',                   value: 'DefiLlama',              color: '#888', sub: 'Cached 30 min' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Unit 4: Hyperliquid KPI card ────────────────────────────────────── */}
      {hlVol !== null && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-5">
            Hyperliquid Perps — Live Volume
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-[#1a1a1a] bg-[#080808] p-5">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
                Hyperliquid 24h Perps Volume
              </p>
              <p className="text-3xl font-black text-[#FABF2C] tabular-nums">{fmtUsd(hlVol)}</p>
              <p className="text-[10px] font-mono text-[#555] mt-2">
                api.hyperliquid.xyz · all perps · Cached 5 min
              </p>
            </div>
            <div className="border border-[#1a1a1a] bg-[#080808] p-5">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
                HL Share of DefiLlama Total
              </p>
              <p className="text-3xl font-black text-white tabular-nums">
                {total24h > 0 ? `${((hlVol / total24h) * 100).toFixed(1)}%` : '—'}
              </p>
              <p className="text-[10px] font-mono text-[#555] mt-2">
                Hyperliquid ÷ all tracked on-chain perps
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          All DeFi Derivatives Protocols
        </h3>
        <DefiTable
          columns={[
            { key: 'name',      label: 'Protocol',      render: (v) => <span className="font-bold text-white">{String(v)}</span> },
            { key: 'total24h',  label: '24h Volume',    align: 'right', render: (v) => <span className="font-mono font-black text-[#FABF2C] tabular-nums">{fmtUsd(v)}</span> },
            { key: 'totalOI',   label: 'Open Interest', align: 'right', render: (v) => <span className="font-mono tabular-nums text-[#888]">{fmtUsd(v)}</span> },
            { key: 'change_1d', label: '24h %',         align: 'right', render: (v) => <PctBadge v={v as number | null} /> },
            { key: 'chains',    label: 'Chains',        render: (v) => <span className="text-[#555] font-mono text-[10px]">{(v as string[]).slice(0, 3).join(', ')}</span> },
          ]}
          data={rows}
          source="Source: DefiLlama derivatives overview · Cached 30 min"
        />
      </div>
    </div>
  );
}

export default function DerivativesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <DerivativesData />
      </Suspense>
    </main>
  );
}
