import React from 'react';
import { DataHeader }      from '../../_components/DataHeader';
import type { TreasuryOverview } from '@/lib/treasury-data';

interface Props {
  coin:     'BTC' | 'ETH';
  data:     TreasuryOverview;
}

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtCoin(n: number, symbol: string): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M ${symbol}`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K ${symbol}`;
  return `${n.toLocaleString()} ${symbol}`;
}

export function TreasuryPageLayout({ coin, data }: Props) {
  const accent       = coin === 'BTC' ? '#FABF2C' : '#3b82f6';
  const companies    = data.companies ?? [];
  const sorted       = [...companies].sort((a, b) => b.total_holdings - a.total_holdings);
  const maxHoldings  = sorted[0]?.total_holdings ?? 1;

  // Compute unrealised P&L for each company
  const withPnl = sorted.map((c) => {
    const entryVal   = c.total_entry_value_usd;
    const currentVal = c.total_current_value_usd;
    const pnlUsd     = currentVal - entryVal;
    const pnlPct     = entryVal > 0 ? (pnlUsd / entryVal) * 100 : 0;
    return { ...c, pnlUsd, pnlPct };
  });

  const totalPnl = withPnl.reduce((s, c) => s + c.pnlUsd, 0);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title={`${coin === 'BTC' ? 'Bitcoin' : 'Ethereum'} Treasuries`}
        description={`Public companies holding ${coin} on their balance sheet – total holdings, current value, and unrealised P&L.`}
      />

      {/* ── KPI Strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Holdings',      value: fmtCoin(data.total_holdings, coin),   color: accent },
          { label: 'Total Current Value', value: fmtUsd(data.total_value_usd),         color: accent },
          { label: 'Supply Dominance',    value: data.market_cap_dominance,             color: '#00d672' },
          { label: 'Companies Tracked',   value: String(companies.length),              color: '#888' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Aggregate P&L ──────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-1">Aggregate Unrealised P&amp;L</p>
          <p className={`text-3xl font-black tabular-nums ${totalPnl >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
            {totalPnl >= 0 ? '+' : ''}{fmtUsd(totalPnl)}
          </p>
        </div>
        <p className="text-[10px] text-[#555] font-mono max-w-sm leading-relaxed">
          Difference between total current market value and total acquisition cost across all tracked companies.
        </p>
      </div>

      {/* ── Holdings Bar Chart ─────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 pl-3 mb-6"
            style={{ borderColor: accent }}>
          Holdings by Company (top 15)
        </h3>
        <div className="space-y-2">
          {sorted.slice(0, 15).map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="w-36 text-right font-bold text-white text-[10px] shrink-0 truncate">{c.name}</span>
              <div className="flex-1 h-4 bg-[#111]">
                <div
                  className="h-full"
                  style={{
                    width:      `${(c.total_holdings / maxHoldings) * 100}%`,
                    background: accent,
                    opacity:    0.75,
                  }}
                />
              </div>
              <span className="w-28 text-right font-mono text-[10px] text-[#888] tabular-nums shrink-0">
                {fmtCoin(c.total_holdings, coin)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Full Table ─────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
          All Public Companies
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Company', 'Symbol', 'Country', `${coin} Holdings`, 'Entry Value', 'Current Value', 'Unrealised P&L', '% of Supply'].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest whitespace-nowrap ${
                      h === '#' || h === 'Company' || h === 'Symbol' || h === 'Country' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withPnl.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-[#555] font-mono text-xs uppercase">
                    Syncing treasury data...
                  </td>
                </tr>
              )}
              {withPnl.map((c, i) => (
                <tr
                  key={c.name}
                  className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                    i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                  }`}
                >
                  <td className="px-4 py-3 text-[#555] tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-[#888]">{c.symbol || '—'}</td>
                  <td className="px-4 py-3 text-[#888]">{c.country || '—'}</td>
                  <td className="px-4 py-3 text-right font-mono font-black tabular-nums" style={{ color: accent }}>
                    {c.total_holdings.toLocaleString()} {coin}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#555]">
                    {c.total_entry_value_usd > 0 ? fmtUsd(c.total_entry_value_usd) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-white">
                    {fmtUsd(c.total_current_value_usd)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-bold tabular-nums ${
                    c.pnlPct >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'
                  }`}>
                    {c.pnlPct >= 0 ? '+' : ''}{c.pnlPct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {c.percentage_of_total_supply}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Source: CoinGecko public treasury API · Cached 6 hours
        </p>
      </div>
    </div>
  );
}

export default TreasuryPageLayout;
