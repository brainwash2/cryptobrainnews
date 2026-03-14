'use client';

import React, { useState } from 'react';
import { TimeframeSelector } from '../../../_components/TimeframeSelector';
import type { Timeframe }    from '../../../_components/TimeframeSelector';
import type {
  GlobalMarketData,
  FearAndGreedData,
  ExtendedCoinData,
  CoinGeckoExchange,
} from '@/lib/market-data';

interface Props {
  globalData:  GlobalMarketData | null;
  fearAndGreed: FearAndGreedData | null;
  coins:       ExtendedCoinData[];
  exchanges:   CoinGeckoExchange[];
}

/* ── Formatting helpers ──────────────────────────────────────────────────── */
function fmtUsd(n: number | null | undefined, decimals = 2): string {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(decimals)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(decimals)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number | null | undefined): React.ReactNode {
  if (n === null || n === undefined || isNaN(n)) {
    return <span className="text-[#555]">—</span>;
  }
  const pos = n >= 0;
  return (
    <span className={`font-mono font-bold tabular-nums ${pos ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
      {pos ? '+' : ''}{n.toFixed(2)}%
    </span>
  );
}

function pctKey(tf: Timeframe): keyof ExtendedCoinData {
  if (tf === '1D')  return 'price_change_percentage_24h_in_currency';
  if (tf === '7D')  return 'price_change_percentage_7d_in_currency';
  if (tf === '30D') return 'price_change_percentage_30d_in_currency';
  return 'price_change_percentage_24h_in_currency';
}

function fngColor(val: string): string {
  const v = parseInt(val, 10);
  if (v >= 75) return 'text-[#00d672]';
  if (v >= 55) return 'text-[#22c55e]';
  if (v >= 45) return 'text-[#FABF2C]';
  if (v >= 25) return 'text-[#f97316]';
  return 'text-[#ff4757]';
}

export default function SpotClient({ globalData, fearAndGreed, coins, exchanges }: Props) {
  const [tf, setTf] = useState<Timeframe>('1D');

  const totalMcap = globalData?.total_market_cap?.usd ?? 0;
  const total24hVol = globalData?.total_volume?.usd ?? 0;
  const btcDom = globalData?.market_cap_percentage?.btc ?? 0;
  const ethDom = globalData?.market_cap_percentage?.eth ?? 0;
  const mcapChange24h = globalData?.market_cap_change_percentage_24h_usd ?? 0;
  const fng = fearAndGreed;

  // Sort coins by selected timeframe performance
  const sortedCoins = [...coins].sort((a, b) => {
    const aVal = Number(a[pctKey(tf)] ?? -999);
    const bVal = Number(b[pctKey(tf)] ?? -999);
    return bVal - aVal;
  });

  return (
    <div className="space-y-10">

      {/* ── Global Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Total Market Cap',
            value: fmtUsd(totalMcap),
            sub: `${mcapChange24h >= 0 ? '+' : ''}${mcapChange24h.toFixed(2)}% (24h)`,
            subColor: mcapChange24h >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]',
          },
          {
            label: '24h Volume',
            value: fmtUsd(total24hVol),
            sub: 'Global spot',
            subColor: 'text-[#888]',
          },
          {
            label: 'BTC Dominance',
            value: `${btcDom.toFixed(1)}%`,
            sub: 'of total market cap',
            subColor: 'text-[#888]',
          },
          {
            label: 'ETH Dominance',
            value: `${ethDom.toFixed(1)}%`,
            sub: 'of total market cap',
            subColor: 'text-[#888]',
          },
          {
            label: 'Fear & Greed',
            value: fng ? fng.value : '—',
            sub: fng?.value_classification ?? 'N/A',
            subColor: fng ? fngColor(fng.value) : 'text-[#888]',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-[#FABF2C] tabular-nums leading-none">
              {stat.value}
            </p>
            <p className={`text-[10px] font-mono mt-2 ${stat.subColor}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Top Coins Table ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
            Top 50 Assets
          </h3>
          <TimeframeSelector
            value={tf}
            onChange={setTf}
            available={['1D', '7D', '30D']}
          />
        </div>

        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Asset', 'Price', '1h%', `${tf} Perf`, 'Market Cap', '24h Volume'].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest whitespace-nowrap ${
                      h === 'Asset' || h === '#' ? 'text-left' : 'text-right'
                    } ${h === `${tf} Perf` ? 'text-[#FABF2C]' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCoins.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[#555] font-mono text-xs uppercase tracking-widest">
                    Syncing market data...
                  </td>
                </tr>
              )}
              {sortedCoins.map((coin, i) => {
                const tfPct = coin[pctKey(tf)] as number | null;
                const h1Pct = coin.price_change_percentage_1h_in_currency;
                const price = coin.current_price;
                return (
                  <tr
                    key={coin.id}
                    className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                      i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                    }`}
                  >
                    <td className="px-4 py-3 text-[#555] tabular-nums w-10">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {coin.image && (
                          <img
                            src={coin.image}
                            alt={coin.symbol}
                            width={20}
                            height={20}
                            className="rounded-full shrink-0"
                          />
                        )}
                        <span className="font-bold text-white">{coin.name}</span>
                        <span className="text-[#555] uppercase text-[10px]">{coin.symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-white">
                      {price >= 1
                        ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : price > 0
                          ? `$${price.toFixed(price < 0.001 ? 8 : price < 0.01 ? 6 : 4)}`
                          : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">{fmtPct(h1Pct)}</td>
                    <td className="px-4 py-3 text-right">{fmtPct(tfPct)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {fmtUsd(coin.market_cap)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {fmtUsd(coin.total_volume)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Source: CoinGecko · Cached 5 min
        </p>
      </div>

      {/* ── Exchange Volumes ─────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#00d672] rounded-full" />
          CEX Rankings by 24h Volume
        </h3>

        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Exchange', 'Country', 'Trust Score', '24h Volume (BTC)', '24h Vol Norm'].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                      h === 'Exchange' || h === '#' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exchanges.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#555] font-mono text-xs uppercase">
                    Syncing exchange data...
                  </td>
                </tr>
              )}
              {exchanges.map((ex, i) => (
                <tr
                  key={ex.id}
                  className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                    i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                  }`}
                >
                  <td className="px-4 py-3 text-[#555] tabular-nums w-10">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-white">{ex.name}</td>
                  <td className="px-4 py-3 text-right text-[#888]">{ex.country ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {ex.trust_score !== null ? (
                      <span className={`font-mono font-bold ${
                        (ex.trust_score ?? 0) >= 8 ? 'text-[#00d672]' :
                        (ex.trust_score ?? 0) >= 5 ? 'text-[#FABF2C]' : 'text-[#ff4757]'
                      }`}>
                        {ex.trust_score}/10
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#FABF2C]">
                    {ex.trade_volume_24h_btc?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '—'} BTC
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {ex.trade_volume_24h_btc_normalized?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '—'} BTC
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Source: CoinGecko · Cached 1 hr
        </p>
      </div>

    </div>
  );
}
