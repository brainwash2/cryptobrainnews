'use client';

import React, { useState, useMemo } from 'react';
import { TimeframeSelector }         from '../../../_components/TimeframeSelector';
import type { Timeframe }            from '../../../_components/TimeframeSelector';
import type {
  GlobalMarketData,
  FearAndGreedData,
  ExtendedCoinData,
} from '@/lib/market-data';

interface Props {
  globalData:   GlobalMarketData | null;
  fearAndGreed: FearAndGreedData | null;
  coins:        ExtendedCoinData[];
}

type SortField = 'rank' | 'performance' | 'volume' | 'mcap';

function fmtUsd(n: number | null | undefined): string {
  if (!n) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function pctNode(n: number | null): React.ReactNode {
  if (n === null || isNaN(n)) return <span className="text-[#333]">—</span>;
  const pos = n >= 0;
  return (
    <span className={`font-mono font-bold tabular-nums text-xs ${pos ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
      {pos ? '+' : ''}{n.toFixed(2)}%
    </span>
  );
}

function fngGauge(val: string, label: string) {
  const v = parseInt(val, 10);
  const deg = (v / 100) * 180;
  const color =
    v >= 75 ? '#00d672' : v >= 55 ? '#22c55e' : v >= 45 ? '#FABF2C' : v >= 25 ? '#f97316' : '#ff4757';
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 flex flex-col items-center">
      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-3">Fear & Greed</p>
      <div className="relative w-24 h-12 overflow-hidden mb-3">
        <div className="absolute inset-0 rounded-t-full border-4 border-[#1a1a1a]" />
        <div
          className="absolute bottom-0 left-1/2 w-1 h-10 origin-bottom transition-transform"
          style={{
            background: color,
            transform: `rotate(${deg - 90}deg) translateX(-50%)`,
          }}
        />
      </div>
      <p className="text-3xl font-black tabular-nums" style={{ color }}>{val}</p>
      <p className="text-[10px] font-mono mt-1" style={{ color }}>{label}</p>
    </div>
  );
}

export default function PricesClient({ globalData, fearAndGreed, coins }: Props) {
  const [tf, setTf]       = useState<Timeframe>('1D');
  const [sort, setSort]   = useState<SortField>('rank');
  const [dir, setDir]     = useState<1 | -1>(1);

  const totalMcap   = globalData?.total_market_cap?.usd ?? 0;
  const totalVol    = globalData?.total_volume?.usd ?? 0;
  const btcDom      = globalData?.market_cap_percentage?.btc ?? 0;
  const ethDom      = globalData?.market_cap_percentage?.eth ?? 0;
  const mcapChg24h  = globalData?.market_cap_change_percentage_24h_usd ?? 0;
  const activeCryp  = globalData?.active_cryptocurrencies ?? 0;

  function getPct(coin: ExtendedCoinData): number | null {
    if (tf === '1D')  return coin.price_change_percentage_24h_in_currency;
    if (tf === '7D')  return coin.price_change_percentage_7d_in_currency;
    if (tf === '30D') return coin.price_change_percentage_30d_in_currency;
    return coin.price_change_percentage_24h_in_currency;
  }

  const sortedCoins = useMemo(() => {
    return [...coins].sort((a, b) => {
      if (sort === 'rank')        return (a.market_cap_rank - b.market_cap_rank) * dir;
      if (sort === 'performance') return ((getPct(b) ?? -999) - (getPct(a) ?? -999)) * dir;
      if (sort === 'volume')      return (b.total_volume - a.total_volume) * dir;
      if (sort === 'mcap')        return (b.market_cap - a.market_cap) * dir;
      return 0;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coins, tf, sort, dir]);

  function handleSort(field: SortField) {
    if (sort === field) setDir((d) => (d === 1 ? -1 : 1));
    else { setSort(field); setDir(1); }
  }

  function SortArrow({ field }: { field: SortField }) {
    if (sort !== field) return <span className="text-[#333]"> ↕</span>;
    return <span className="text-[#FABF2C]"> {dir === 1 ? '↓' : '↑'}</span>;
  }

  // Separate top gainers / losers for quick view
  const sortedByPerf = [...coins].sort(
    (a, b) => (getPct(b) ?? -999) - (getPct(a) ?? -999)
  );
  const gainers = sortedByPerf.slice(0, 5);
  const losers  = sortedByPerf.slice(-5).reverse();

  return (
    <div className="space-y-10">

      {/* ── Global Health Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Total Market Cap</p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">{fmtUsd(totalMcap)}</p>
          <p className={`text-[10px] font-mono mt-1 ${mcapChg24h >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
            {mcapChg24h >= 0 ? '+' : ''}{mcapChg24h.toFixed(2)}% (24h)
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">24h Volume</p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">{fmtUsd(totalVol)}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">BTC Dominance</p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">{btcDom.toFixed(1)}%</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">ETH: {ethDom.toFixed(1)}%</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Active Assets</p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">
            {activeCryp.toLocaleString()}
          </p>
        </div>
        {fearAndGreed
          ? fngGauge(fearAndGreed.value, fearAndGreed.value_classification)
          : (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Fear & Greed</p>
              <p className="text-2xl font-black text-[#333]">—</p>
            </div>
          )
        }
      </div>

      {/* ── Movers Strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { label: `Top Gainers (${tf})`, items: gainers, accent: '#00d672' },
          { label: `Top Losers (${tf})`,  items: losers,  accent: '#ff4757' },
        ].map(({ label, items, accent }) => (
          <div key={label}>
            <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: accent }}>{label}</h3>
            <div className="space-y-2">
              {items.map((coin) => (
                <div key={coin.id} className="flex items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-2">
                  <div className="flex items-center gap-2">
                    {coin.image && <img src={coin.image} alt={coin.symbol} width={18} height={18} className="rounded-full" />}
                    <span className="font-bold text-white text-xs">{coin.symbol.toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-[#888]">
                      ${coin.current_price >= 1
                        ? coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : coin.current_price.toFixed(4)
                      }
                    </p>
                    {pctNode(getPct(coin))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Full Performance Table ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
            Price Performance
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
                <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest cursor-pointer select-none" onClick={() => handleSort('rank')}>
                  # <SortArrow field="rank" />
                </th>
                <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Asset</th>
                <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Price</th>
                <th className="px-4 py-3 text-right font-black text-[#FABF2C] uppercase tracking-widest cursor-pointer select-none" onClick={() => handleSort('performance')}>
                  {tf} % <SortArrow field="performance" />
                </th>
                <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest cursor-pointer select-none" onClick={() => handleSort('mcap')}>
                  MCap <SortArrow field="mcap" />
                </th>
                <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest cursor-pointer select-none" onClick={() => handleSort('volume')}>
                  Volume <SortArrow field="volume" />
                </th>
                <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">ATH %</th>
              </tr>
            </thead>
            <tbody>
              {sortedCoins.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[#555] font-mono text-xs">Syncing prices...</td>
                </tr>
              )}
              {sortedCoins.map((coin, i) => (
                <tr
                  key={coin.id}
                  className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}
                >
                  <td className="px-4 py-2.5 text-[#555] tabular-nums w-10">{coin.market_cap_rank}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {coin.image && <img src={coin.image} alt={coin.symbol} width={18} height={18} className="rounded-full shrink-0" />}
                      <span className="font-bold text-white">{coin.name}</span>
                      <span className="text-[#555] uppercase text-[10px]">{coin.symbol}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-white text-[11px]">
                    {coin.current_price >= 1
                      ? `$${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : coin.current_price > 0
                        ? `$${coin.current_price.toFixed(coin.current_price < 0.001 ? 8 : 5)}`
                        : '—'
                    }
                  </td>
                  <td className="px-4 py-2.5 text-right">{pctNode(getPct(coin))}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#888] text-[11px]">{fmtUsd(coin.market_cap)}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#888] text-[11px]">{fmtUsd(coin.total_volume)}</td>
                  <td className="px-4 py-2.5 text-right">
                    {pctNode(coin.ath_change_percentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Source: CoinGecko · Cached 5 min · Click column headers to sort
        </p>
      </div>

    </div>
  );
}
