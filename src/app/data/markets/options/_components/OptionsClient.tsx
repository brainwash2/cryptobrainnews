'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { OptionsAggregate, HistVolPoint } from '@/lib/options';

interface Props {
  btcAgg: OptionsAggregate | null;
  ethAgg: OptionsAggregate | null;
  btcVol: HistVolPoint[];
  ethVol: HistVolPoint[];
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
  const pcr = agg.putCallRatio;
  const pcrColor = pcr > 1.2 ? '#ff4757' : pcr < 0.8 ? '#00d672' : '#FABF2C';
  const pcrLabel = pcr > 1.2 ? 'Bearish' : pcr < 0.8 ? 'Bullish' : 'Neutral';
  return (
    <div>
      <h3 className="text-base font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: agg.currency === 'BTC' ? '#FABF2C' : '#3b82f6' }} />
        {agg.currency} Options
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total OI (USD)"   value={fmtUsd(agg.totalOiUsd)}   sub={`${agg.totalOiContracts.toFixed(0)} contracts`} />
        <StatCard label="24h Volume (USD)" value={fmtUsd(agg.totalVolumeUsd)} />
        <StatCard label="Put/Call Ratio"   value={pcr.toFixed(2)} sub={pcrLabel} color={pcrColor} />
        <StatCard label="Avg Impl. Vol."   value={`${agg.avgIV.toFixed(1)}%`} sub={`${agg.expiryCount} active expiries`} color="#888" />
        <StatCard label="Call OI"          value={fmtUsd(agg.callOiUsd)} color="#00d672" />
        <StatCard label="Put OI"           value={fmtUsd(agg.putOiUsd)}  color="#ff4757" />
      </div>
    </div>
  );
}

export default function OptionsClient({ btcAgg, ethAgg, btcVol, ethVol }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Merge BTC + ETH vol into one chart dataset
  const volMap = new Map<string, { date: string; btc?: number; eth?: number }>();
  btcVol.forEach(({ date, value }) => {
    volMap.set(date, { date, btc: value });
  });
  ethVol.forEach(({ date, value }) => {
    const existing = volMap.get(date) ?? { date };
    volMap.set(date, { ...existing, eth: value });
  });
  const volChartData = [...volMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-10">

      {/* ── Aggregate Panels ───────────────────────────────────────────── */}
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

      {/* ── Historical Implied Volatility Chart ────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
            Historical Implied Volatility (30D)
          </h3>
          <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
            Source: Deribit DVol Index · BTC (gold) & ETH (blue)
          </p>
        </div>
        <div className="h-72">
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
                  formatter={(val: number, name: string) => [`${val.toFixed(1)}%`, `${name.toUpperCase()} DVol`]}
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

      {/* ── Data Source Note ───────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          <span className="text-[#888] font-black">Data source:</span> Deribit public API (no auth required).
          OI shown in USD notional (contracts × underlying spot price).
          Put/Call Ratio = Put OI / Call OI. Values above 1.0 are bearish-skewed; below 1.0 are bullish-skewed.
          DVol = Deribit's proprietary 30-day constant-maturity implied volatility index, calculated from order book data.
          CME options data will be added in a future phase.
        </p>
      </div>
    </div>
  );
}
