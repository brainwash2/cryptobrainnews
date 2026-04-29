// src/app/data/markets/options/_components/OptionsClient.tsx
'use client';

import React, { useSyncExternalStore } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { OptionsAggregate, HistVolPoint } from '@/lib/options';
import type { OptionsFlowSummary } from '@/lib/greekslive';

interface Props {
  btcAgg: OptionsAggregate | null;
  ethAgg: OptionsAggregate | null;
  btcVol: HistVolPoint[];
  ethVol: HistVolPoint[];
  greeksFlow: OptionsFlowSummary | null;
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function StatCard({
  label, value, sub, color = '#FABF2C',
}: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

function AggPanel({ agg }: { agg: OptionsAggregate }) {
  const pcr      = agg.putCallRatio;
  const pcrColor = pcr > 1.2 ? '#ff4757' : pcr < 0.8 ? '#00d672' : '#FABF2C';
  const pcrLabel = pcr > 1.2 ? 'Bearish'  : pcr < 0.8 ? 'Bullish'  : 'Neutral';
  return (
    <div>
      <h3 className="text-base font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: agg.currency === 'BTC' ? '#FABF2C' : '#3b82f6' }}
        />
        {agg.currency} Options
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total OI (USD)"   value={fmtUsd(agg.totalOiUsd)}    sub={`${agg.totalOiContracts.toFixed(0)} contracts`} />
        <StatCard label="24h Volume (USD)" value={fmtUsd(agg.totalVolumeUsd)} />
        <StatCard label="Put/Call Ratio"   value={pcr.toFixed(2)}             sub={pcrLabel} color={pcrColor} />
        <StatCard label="Avg Impl. Vol."   value={`${agg.avgIV.toFixed(1)}%`} sub={`${agg.expiryCount} active expiries`} color="#888" />
        <StatCard label="Call OI"          value={fmtUsd(agg.callOiUsd)}      color="#00d672" />
        <StatCard label="Put OI"           value={fmtUsd(agg.putOiUsd)}       color="#ff4757" />
      </div>
    </div>
  );
}

type AnyFormatter = (value: unknown, name: unknown) => [string, string];

const volTooltipFormatter: AnyFormatter = (value, name) => {
  const n = Number(value ?? 0);
  return [isNaN(n) ? '—' : `${n.toFixed(1)}%`, `${String(name).toUpperCase()} DVol`];
};

export default function OptionsClient({ btcAgg, ethAgg, btcVol, ethVol, greeksFlow }: Props) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const volMap = new Map<string, { date: string; btc?: number; eth?: number }>();
  btcVol.forEach(({ date, value }) => { volMap.set(date, { date, btc: value }); });
  ethVol.forEach(({ date, value }) => {
    volMap.set(date, { ...(volMap.get(date) ?? { date }), eth: value });
  });
  const volChartData = [...volMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-10">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {btcAgg ? <AggPanel agg={btcAgg} /> : (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 flex items-center justify-center text-[#555] font-mono text-xs">
            BTC options data unavailable
          </div>
        )}
        {ethAgg ? <AggPanel agg={ethAgg} /> : (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 flex items-center justify-center text-[#555] font-mono text-xs">
            ETH options data unavailable
          </div>
        )}
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            Historical Implied Volatility (30D)
          </h3>
          <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
            Source: Deribit DVol Index · BTC (gold) &amp; ETH (blue)
          </p>
        </div>
        <div className="h-72" style={{ minHeight: "288px" }}>
          {mounted && volChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volChartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gBtcVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FABF2C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FABF2C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gEthVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="date" stroke="#444" fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke="#444" fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 0, fontFamily: 'monospace', fontSize: 11 }}
                  formatter={volTooltipFormatter}
                />
                <Legend iconType="line" wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase' }} />
                <Area type="monotone" dataKey="btc" name="BTC" stroke="#FABF2C" fill="url(#gBtcVol)" strokeWidth={1.5} dot={false} />
                <Area type="monotone" dataKey="eth" name="ETH" stroke="#3b82f6" fill="url(#gEthVol)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#333] font-mono text-xs uppercase">
              {volChartData.length === 0 ? 'Historical IV data unavailable' : 'Loading chart...'}
            </div>
          )}
        </div>
      </div>

      {/* ── Block Trades / Options Flow — Greeks.live ─────────────────────────── */}
      {greeksFlow && greeksFlow.trades.length > 0 && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
                Block Trades / Options Flow
              </h3>
              <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
                Large notional options trades — Source: Greeks.live
              </p>
            </div>
            <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
              greeksFlow.source === 'live'
                ? 'border-[#00d672]/40 text-[#00d672]'
                : 'border-[#FABF2C]/40 text-[#FABF2C]'
            }`}>
              {greeksFlow.source === 'live' ? '● Live — Greeks.live' : '◌ Manual — Greeks.live seed'}
            </span>
          </div>

          <div className="border border-[#1a1a1a] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                  {['Time', 'Symbol', 'Type', 'Strike', 'Expiry', 'Qty', 'Notional', 'Premium', 'IV', 'Sentiment'].map((h) => (
                    <th key={h} className={`px-3 py-2 font-black text-[#555] uppercase tracking-widest ${
                      ['Time', 'Symbol', 'Type', 'Sentiment'].includes(h) ? 'text-left' : 'text-right'
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {greeksFlow.trades.map((t, i) => (
                  <tr key={`${t.timestamp}-${i}`} className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                    i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                  }`}>
                    <td className="px-3 py-2 font-mono text-[#555] text-[10px]">
                      {new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-3 py-2 font-bold text-white">{t.symbol}</td>
                    <td className="px-3 py-2">
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 border ${
                        t.type === 'call' ? 'text-[#00d672] border-[#00d672]/30 bg-[#00d672]/10' :
                        t.type === 'put' ? 'text-[#ff4757] border-[#ff4757]/30 bg-[#ff4757]/10' :
                        'text-[#FABF2C] border-[#FABF2C]/30 bg-[#FABF2C]/10'
                      }`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-[#888]">
                      ${t.strike.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[#555] text-[10px]">
                      {t.expiry}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-white">{t.quantity}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-[#FABF2C]">
                      ${(t.notionalUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-[#888]">
                      ${(t.premiumUsd / 1e3).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-[#555]">
                      {t.iv !== null ? `${t.iv.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`font-mono font-black text-xs ${
                        t.sentiment === 'bullish' ? 'text-[#00d672]' :
                        t.sentiment === 'bearish' ? 'text-[#ff4757]' : 'text-[#FABF2C]'
                      }`}>
                        {t.sentiment.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          <span className="text-[#888] font-black">Data source:</span> Deribit public API (no auth required).
          OI shown in USD notional (contracts × underlying spot price).
          Put/Call Ratio = Put OI / Call OI. Values above 1.0 are bearish-skewed; below 1.0 are bullish-skewed.
          DVol = Deribit&apos;s proprietary 30-day constant-maturity implied volatility index,
          calculated from order book data. CME options data will be added in a future phase.
        </p>
      </div>

    </div>
  );
}
