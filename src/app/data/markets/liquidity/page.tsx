// src/app/data/markets/liquidity/page.tsx
// Updated: Kaiko paid API replaced with Hyperliquid (BTC/ETH) + Drift (SOL).
import React, { Suspense } from 'react';
import { DataHeader }       from '../../_components/DataHeader';
import { ChartSkeleton }    from '../../_components/ChartSkeleton';
import { getOrderBookSnapshot } from '@/lib/orderbook';
import type { OrderBookSnapshot } from '@/lib/orderbook';

export const metadata = {
  title: 'Market Liquidity | CryptoBrainNews',
  description: 'BTC‑USD, ETH‑USD and SOL‑USD order‑book depth and spread from Hyperliquid and Drift.',
};
export const revalidate = 30;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

async function LiquidityData() {
  const [btcDepth, ethDepth, solDepth] = await Promise.all([
    getOrderBookSnapshot('BTC-USD').catch(() => null) as Promise<OrderBookSnapshot | null>,
    getOrderBookSnapshot('ETH-USD').catch(() => null) as Promise<OrderBookSnapshot | null>,
    getOrderBookSnapshot('SOL-USD').catch(() => null) as Promise<OrderBookSnapshot | null>,
  ]);

  const isLive = [btcDepth, ethDepth, solDepth].some(
    (d) => d?.source === 'hyperliquid' || d?.source === 'drift',
  );

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Market Liquidity"
        description="BTC‑USD, ETH‑USD and SOL‑USD order‑book depth and spread — powered by Hyperliquid & Drift."
      />

      {/* ── Source badge ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          isLive
            ? 'border-[#00d672]/40 text-[#00d672]'
            : 'border-[#FABF2C]/40 text-[#FABF2C]'
        }`}>
          {isLive
            ? '● Live — Hyperliquid / Drift · Free public API · Cached 30s'
            : '◌ Seed — Live feed unavailable'}
        </span>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'BTC‑USD Spread', value: btcDepth ? `${btcDepth.spreadBps.toFixed(2)} bps` : '—', color: '#FABF2C' },
          { label: 'ETH‑USD Spread', value: ethDepth ? `${ethDepth.spreadBps.toFixed(2)} bps` : '—', color: '#3b82f6' },
          { label: 'SOL‑USD Spread', value: solDepth ? `${solDepth.spreadBps.toFixed(2)} bps` : '—', color: '#9945ff' },
          { label: 'BTC Mid Price',  value: btcDepth ? fmtUsd(btcDepth.midPrice) : '—', color: '#fff' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Depth heatmap ─────────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-6">
          Order‑Book Depth (Top 10 Levels)
        </h3>
        <p className="text-[10px] text-[#555] font-mono mb-4">
          Aggregated liquidity depth from Hyperliquid (BTC/ETH) and Drift DLOB (SOL). Updated every 30 seconds.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {([
            { depth: btcDepth, accent: '#FABF2C', label: 'BTC‑USD', source: 'Hyperliquid' },
            { depth: ethDepth, accent: '#3b82f6', label: 'ETH‑USD', source: 'Hyperliquid' },
            { depth: solDepth, accent: '#9945ff', label: 'SOL‑USD', source: 'Drift DLOB' },
          ] as const).map(({ depth, accent, label, source }) => (
            <div key={label} className="border border-[#1a1a1a] bg-[#080808] p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>
                  {label}
                </h4>
                <span className="text-[9px] font-mono text-[#555]">
                  {source}
                </span>
              </div>

              {depth ? (
                <div className="space-y-3">
                  {/* Asks (red tones) */}
                  <div>
                    <p className="text-[9px] font-mono text-[#ff4757] uppercase mb-1">Asks (Sell Side)</p>
                    <div className="space-y-0.5">
                      {[...depth.asks].reverse().slice(0, 10).map((lvl, i) => {
                        const maxAmt = Math.max(...depth.asks.map((a) => a.amount), 1);
                        return (
                          <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                            <span className="w-20 text-right text-[#ff4757] tabular-nums shrink-0">
                              {fmtUsd(lvl.price)}
                            </span>
                            <div className="flex-1 h-3 bg-[#111]">
                              <div
                                className="h-full bg-[#ff4757] opacity-70"
                                style={{ width: `${(lvl.amount / maxAmt) * 100}%` }}
                              />
                            </div>
                            <span className="w-12 text-right text-[#888] tabular-nums shrink-0">
                              {lvl.amount >= 1000 ? `${(lvl.amount / 1000).toFixed(0)}K` : lvl.amount.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mid price */}
                  <div className="text-center border-y border-[#1a1a1a] py-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      Mid: {fmtUsd(depth.midPrice)}
                    </span>
                    <span className="text-[9px] font-mono text-[#555] ml-2">
                      Spread: {depth.spreadBps.toFixed(2)} bps
                    </span>
                  </div>

                  {/* Bids (green tones) */}
                  <div>
                    <p className="text-[9px] font-mono text-[#00d672] uppercase mb-1">Bids (Buy Side)</p>
                    <div className="space-y-0.5">
                      {depth.bids.slice(0, 10).map((lvl, i) => {
                        const maxAmt = Math.max(...depth.bids.map((b) => b.amount), 1);
                        return (
                          <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                            <span className="w-20 text-right text-[#00d672] tabular-nums shrink-0">
                              {fmtUsd(lvl.price)}
                            </span>
                            <div className="flex-1 h-3 bg-[#111]">
                              <div
                                className="h-full bg-[#00d672] opacity-70"
                                style={{ width: `${(lvl.amount / maxAmt) * 100}%` }}
                              />
                            </div>
                            <span className="w-12 text-right text-[#888] tabular-nums shrink-0">
                              {lvl.amount >= 1000 ? `${(lvl.amount / 1000).toFixed(0)}K` : lvl.amount.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-[#555] font-mono text-xs">
                  Depth data unavailable
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── About the data source ──────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Data Sources</h3>
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          <span className="text-[#FABF2C] font-black">Hyperliquid:</span>{' '}
          Public order‑book API (api.hyperliquid.xyz/info) provides BTC‑USD and ETH‑USD
          depth at 1,200 requests/minute per IP — no API key required.
          {' '}
          <span className="text-[#9945ff] font-black">Drift DLOB:</span>{' '}
          Public L2 endpoint (dlob.drift.trade/l2) provides SOL‑PERP depth —
          no API key required. Data refreshes every 30 seconds.
          {' '}
          <span className="text-[#888] font-black">Seed fallback:</span>{' '}
          Accurate April 2026 reference depth shown when live data is unavailable.
          These APIs replace the paid Kaiko Lite ($300/month) integration.
        </p>
      </div>
    </div>
  );
}

export default function LiquidityPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <LiquidityData />
      </Suspense>
    </main>
  );
}
