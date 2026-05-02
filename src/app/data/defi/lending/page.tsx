import React, { Suspense }              from 'react';
import { DataHeader }                   from '../../_components/DataHeader';
import { ChartSkeleton }                from '../../_components/ChartSkeleton';
import { DefiTable, fmtUsd, PctBadge } from '../_components/DefiTable';
import { getLendingProtocols, getLendingRates } from '@/lib/defi-data';
import type { LendingRate }             from '@/lib/defi-data';

export const metadata = {
  title: 'DeFi Lending | CryptoBrainNews',
  description: 'Aave, Compound, MakerDAO and all DeFi lending protocols ranked by TVL.',
};
export const revalidate = 3600;

// ── APY helpers ───────────────────────────────────────────────────────────────
function fmtApy(v: number | null): string {
  if (v === null || v === undefined) return '—';
  return `${v.toFixed(2)}%`;
}

function supplyApyColor(v: number): string {
  if (v >= 15) return '#00d672';
  if (v >= 8)  return '#22c55e';
  if (v >= 3)  return '#FABF2C';
  return '#888';
}

function borrowApyColor(v: number | null): string {
  if (v === null || v === undefined) return '#555';
  if (v >= 20) return '#ff4d4f';
  if (v >= 10) return '#f97316';
  if (v >= 5)  return '#FABF2C';
  return '#888';
}

// ── Lending rates leaderboard (server-rendered) ───────────────────────────────
function LendingRatesTable({ rates }: { rates: LendingRate[] }) {
  if (!rates.length) return null;

  const topSupply = rates.reduce(
    (best, r) => (r.supplyApy > best.supplyApy ? r : best),
    rates[0],
  );
  const topBorrow = rates
    .filter((r) => r.borrowApy !== null)
    .reduce<LendingRate | null>(
      (best, r) =>
        best === null || (r.borrowApy ?? 0) > (best.borrowApy ?? 0) ? r : best,
      null,
    );

  return (
    <div>
      <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
        <span className="w-2 h-2 bg-[#00d672] rounded-full" />
        Live Lending Rates
      </h3>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Top Supply APY
          </p>
          <p className="text-2xl font-black tabular-nums" style={{ color: supplyApyColor(topSupply.supplyApy) }}>
            {fmtApy(topSupply.supplyApy)}
          </p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            {topSupply.protocol} · {topSupply.asset} · {topSupply.chain}
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Highest Borrow APY
          </p>
          {topBorrow ? (
            <>
              <p className="text-2xl font-black tabular-nums" style={{ color: borrowApyColor(topBorrow.borrowApy) }}>
                {fmtApy(topBorrow.borrowApy)}
              </p>
              <p className="text-[10px] font-mono text-[#555] mt-1">
                {topBorrow.protocol} · {topBorrow.asset} · {topBorrow.chain}
              </p>
            </>
          ) : (
            <p className="text-2xl font-black text-[#555]">—</p>
          )}
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Markets Tracked
          </p>
          <p className="text-2xl font-black tabular-nums text-white">{rates.length}</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">
            lending pools with borrow markets
          </p>
        </div>
      </div>

      {/* Ranked table */}
      <DefiTable
        columns={[
          {
            key: 'protocol',
            label: 'Protocol',
            render: (v) => (
              <span className="font-bold text-white capitalize">{String(v)}</span>
            ),
          },
          {
            key: 'chain',
            label: 'Chain',
            render: (v) => (
              <span className="text-[#888] font-mono text-[10px]">{String(v)}</span>
            ),
          },
          {
            key: 'asset',
            label: 'Asset',
            render: (v) => (
              <span className="font-mono font-black text-[#FABF2C] text-[11px]">{String(v)}</span>
            ),
          },
          {
            key: 'supplyApy',
            label: 'Supply APY',
            align: 'right',
            render: (v) => {
              const n = v as number;
              return (
                <span
                  className="font-mono font-black tabular-nums"
                  style={{ color: supplyApyColor(n) }}
                >
                  {fmtApy(n)}
                </span>
              );
            },
          },
          {
            key: 'borrowApy',
            label: 'Borrow APY',
            align: 'right',
            render: (v) => {
              const n = v as number | null;
              return (
                <span
                  className="font-mono font-black tabular-nums"
                  style={{ color: borrowApyColor(n) }}
                >
                  {fmtApy(n)}
                </span>
              );
            },
          },
          {
            key: 'tvlUsd',
            label: 'TVL',
            align: 'right',
            render: (v) => (
              <span className="font-mono font-black text-[#3b82f6] tabular-nums">
                {fmtUsd(v)}
              </span>
            ),
          },
        ]}
        data={rates as unknown as Record<string, unknown>[]}
        source="Source: DefiLlama yields API · Filtered to lending pools with active borrow markets · Ranked by TVL · Cached 1 hour"
      />
    </div>
  );
}

async function LendingData() {
  const [protocols, rates] = await Promise.all([
    getLendingProtocols(),
    getLendingRates(20),
  ]);

  const totalTvl = protocols.reduce((s, p) => s + p.tvl, 0);
  const rows     = protocols.map((p) => ({ ...p })) as Record<string, unknown>[];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Lending Markets"
        description="Aave, Compound, MakerDAO, and all DeFi lending protocols – TVL, outstanding debt, and growth metrics."
      />

      {/* ── Existing KPI strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Lending TVL', value: fmtUsd(totalTvl),           color: '#3b82f6' },
          { label: 'Protocols Tracked', value: String(protocols.length),   color: '#888' },
          { label: 'Largest Protocol',  value: protocols[0]?.name ?? '—',  color: '#fff', sub: fmtUsd(protocols[0]?.tvl ?? 0) },
          { label: 'Source',            value: 'DefiLlama',                color: '#888', sub: 'Cached 1 hour' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Batch 19: Live Lending Rates leaderboard ────────────────────────── */}
      <LendingRatesTable rates={rates} />

      {/* ── Existing TVL table ──────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#3b82f6] rounded-full" />
          Lending Protocols Ranked by TVL
        </h3>
        <DefiTable
          columns={[
            { key: 'name',      label: 'Protocol',  render: (v) => <span className="font-bold text-white">{String(v)}</span> },
            { key: 'category',  label: 'Type',      render: (v) => <span className="text-[#888] font-mono text-[10px]">{String(v)}</span> },
            { key: 'tvl',       label: 'TVL',       align: 'right', render: (v) => <span className="font-mono font-black text-[#3b82f6] tabular-nums">{fmtUsd(v)}</span> },
            { key: 'change_1d', label: '24h %',     align: 'right', render: (v) => <PctBadge v={v as number | null} /> },
            { key: 'chains',    label: 'Chains',    render: (v) => <span className="text-[#555] font-mono text-[10px]">{(v as string[]).slice(0, 3).join(', ')}</span> },
          ]}
          data={rows}
          source="Source: DefiLlama protocols API · Cached 1 hour"
        />
      </div>

      {/* ── Glossary ────────────────────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Key Lending Metrics Explained</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono text-[#555] leading-relaxed">
          {[
            ['TVL (Total Value Locked)',  'Collateral deposited in lending markets. High TVL = deep liquidity.'],
            ['Supply APY',               'Annual yield earned by depositing an asset as lending liquidity. Includes base rate + any protocol reward tokens.'],
            ['Borrow APY',               'Annual cost of borrowing an asset. Higher borrow APY = higher demand relative to supply. Rising rapidly = market stress.'],
            ['Loan-to-Value (LTV)',       'Max borrowable value vs collateral. 75% LTV = borrow $75 against $100 collateral.'],
            ['Utilisation Rate',          'Borrowed / Deposited. High utilisation = high rates for both borrowers and lenders.'],
            ['Health Factor',             'Collateral value / Liquidation threshold. Below 1.0 triggers liquidation.'],
          ].map(([k, v]) => (
            <div key={k}><span className="text-[#888] font-black">{k}:</span> {v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LendingPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <LendingData />
      </Suspense>
    </main>
  );
}
