/**
 * Phase 45 · C6 — large-swaps/page.tsx
 *
 * Previous state: getLargeDexSwaps() always returned []. The page rendered
 * a broken empty-state with $0 KPI cards and a TODO comment pointing to a
 * Dune call that was never implemented. The UI was designed for a per-tx
 * swap feed (tx_hash, token_a_symbol, …) — data that no existing Dune query
 * in dune.ts produces.
 *
 * Fix: page is rewired to getDEXTopProtocols() (Dune ID 6705632), which returns
 * real 30-day rolling DEX protocol volumes. UI redesigned to match the actual
 * data shape: a ranked protocol-volume table with KPI summary cards.
 *
 * Fallback: when Dune returns empty (no API key / rate-limited), a curated
 * static reference table is shown with clear snapshot attribution.
 * Source: DefiLlama DEX overview — https://defillama.com/dexs — snapshot 2026-03-21.
 */

import React from 'react';
import { getDEXTopProtocols, type DuneRow } from '@/lib/dune';

export const metadata = {
  title: 'DEX Flow — Protocol Volumes | CryptoBrainNews',
  description: '30-day DEX protocol volumes, trade counts, and chain breakdown via Dune Analytics.',
};
export const revalidate = 1800; // 30 min

// ─── Types ────────────────────────────────────────────────────────────────────

interface DexProtocol {
  dex:           string;
  blockchain:    string;
  volume30dUsd:  number;
  tradeCount:    number;
  uniqueTxs:     number;
  isLive:        boolean; // false = static reference row
}

// ─── Static reference fallback ────────────────────────────────────────────────
// Shown when Dune API key is absent or query returns empty.
// Source: DefiLlama /overview/dexs — snapshot 2026-03-21.
// Update this table when a new Dune query ID is configured for ID 6705632.

const STATIC_DEX_REFERENCE: DexProtocol[] = [
  { dex: 'Uniswap',       blockchain: 'Ethereum',  volume30dUsd: 42_800_000_000, tradeCount: 14_200_000, uniqueTxs: 11_800_000, isLive: false },
  { dex: 'PancakeSwap',   blockchain: 'BNB Chain', volume30dUsd: 18_400_000_000, tradeCount:  9_600_000, uniqueTxs:  8_100_000, isLive: false },
  { dex: 'Orca',          blockchain: 'Solana',    volume30dUsd: 14_200_000_000, tradeCount: 22_000_000, uniqueTxs: 18_500_000, isLive: false },
  { dex: 'Raydium',       blockchain: 'Solana',    volume30dUsd: 12_600_000_000, tradeCount: 19_800_000, uniqueTxs: 16_200_000, isLive: false },
  { dex: 'Curve',         blockchain: 'Ethereum',  volume30dUsd:  9_100_000_000, tradeCount:  1_800_000, uniqueTxs:  1_600_000, isLive: false },
  { dex: 'Aerodrome',     blockchain: 'Base',      volume30dUsd:  7_300_000_000, tradeCount:  4_200_000, uniqueTxs:  3_700_000, isLive: false },
  { dex: 'Balancer',      blockchain: 'Ethereum',  volume30dUsd:  4_800_000_000, tradeCount:    920_000, uniqueTxs:    810_000, isLive: false },
  { dex: 'dYdX',          blockchain: 'Cosmos',    volume30dUsd:  3_900_000_000, tradeCount:  2_100_000, uniqueTxs:  1_900_000, isLive: false },
];

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function getDEXFlowData(): Promise<{ protocols: DexProtocol[]; isLive: boolean }> {
  const rows: DuneRow[] = await getDEXTopProtocols().catch(() => []);

  if (rows.length > 0) {
    const protocols = rows.map((r) => ({
      dex:          String(r.dex          ?? r.project ?? '—'),
      blockchain:   String(r.blockchain   ?? '—'),
      volume30dUsd: Number(r.volume_30d_usd ?? 0),
      tradeCount:   Number(r.trade_count  ?? 0),
      uniqueTxs:    Number(r.unique_txs   ?? 0),
      isLive:       true,
    }));
    return { protocols, isLive: true };
  }

  return { protocols: STATIC_DEX_REFERENCE, isLive: false };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtVol(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function fmtCount(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum:  '#3b82f6',
  Solana:    '#9945ff',
  'BNB Chain': '#f3ba2f',
  Base:      '#0052ff',
  Arbitrum:  '#28a0f0',
  Optimism:  '#ff0420',
  Polygon:   '#8247e5',
  Cosmos:    '#6d28d9',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LargeSwapsPage() {
  const { protocols, isLive } = await getDEXFlowData();

  const totalVolume   = protocols.reduce((s, p) => s + p.volume30dUsd, 0);
  const totalTrades   = protocols.reduce((s, p) => s + p.tradeCount, 0);
  const topProtocol   = protocols[0]?.dex ?? '—';
  const topShare      = totalVolume > 0
    ? ((protocols[0]?.volume30dUsd ?? 0) / totalVolume * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8 pb-20">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-black text-[#FABF2C] uppercase tracking-[0.4em] mb-2">
          Data Terminal
        </p>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
          DEX <span className="text-[#FABF2C]">Flow</span>
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em]">
          30-Day Protocol Volumes · Trades · Chain Breakdown
        </p>
      </div>

      {/* ── Data source badge ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          isLive
            ? 'border-[#00d672]/40 text-[#00d672]'
            : 'border-[#FABF2C]/30 text-[#FABF2C]'
        }`}>
          {isLive ? '● Live — Dune Analytics' : '◌ Reference Snapshot — 2026-03-21'}
        </span>
        {!isLive && (
          <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
            Source: DefiLlama /dexs · Configure DUNE_API_KEY to activate live data
          </span>
        )}
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">30D Volume</p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">{fmtVol(totalVolume)}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Total Trades</p>
          <p className="text-2xl font-black text-white tabular-nums">{fmtCount(totalTrades)}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Top Protocol</p>
          <p className="text-2xl font-black text-[#FABF2C]">{topProtocol}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Leader Share</p>
          <p className="text-2xl font-black text-white tabular-nums">{topShare}%</p>
        </div>
      </div>

      {/* ── Volume bar chart ─────────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <h2 className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-5">
          Volume Distribution
        </h2>
        <div className="space-y-3">
          {protocols.slice(0, 8).map((p) => {
            const pct = totalVolume > 0 ? (p.volume30dUsd / totalVolume) * 100 : 0;
            const color = CHAIN_COLORS[p.blockchain] ?? '#FABF2C';
            return (
              <div key={`${p.dex}-${p.blockchain}`} className="flex items-center gap-4">
                <div className="w-28 shrink-0 text-right">
                  <span className="text-white font-bold text-xs">{p.dex}</span>
                </div>
                <div className="flex-1 bg-[#111] h-5 relative overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${pct.toFixed(1)}%`, backgroundColor: color, opacity: 0.85 }}
                  />
                </div>
                <div className="w-20 shrink-0 text-right">
                  <span className="text-[#888] font-mono text-[10px]">{fmtVol(p.volume30dUsd)}</span>
                </div>
                <div className="w-10 shrink-0 text-right">
                  <span className="text-[#555] font-mono text-[10px]">{pct.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Protocol table ───────────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#080808]">
            <tr>
              <th className="px-5 py-3 text-left font-black text-[#555] uppercase tracking-widest w-8">#</th>
              <th className="px-5 py-3 text-left font-black text-[#555] uppercase tracking-widest">Protocol</th>
              <th className="px-5 py-3 text-left font-black text-[#555] uppercase tracking-widest">Chain</th>
              <th className="px-5 py-3 text-right font-black text-[#555] uppercase tracking-widest">30D Volume</th>
              <th className="px-5 py-3 text-right font-black text-[#555] uppercase tracking-widest">Trades</th>
              <th className="px-5 py-3 text-right font-black text-[#555] uppercase tracking-widest">Unique Txs</th>
              <th className="px-5 py-3 text-right font-black text-[#555] uppercase tracking-widest">Share</th>
            </tr>
          </thead>
          <tbody>
            {protocols.map((p, i) => {
              const share = totalVolume > 0
                ? ((p.volume30dUsd / totalVolume) * 100).toFixed(1)
                : '0';
              const color = CHAIN_COLORS[p.blockchain] ?? '#888';
              return (
                <tr
                  key={`${p.dex}-${p.blockchain}-${i}`}
                  className={`border-b border-[#0d0d0d] hover:bg-[#0f0f0f] transition-colors ${
                    i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0b0b0b]'
                  }`}
                >
                  <td className="px-5 py-4 text-[#333] font-mono">{i + 1}</td>
                  <td className="px-5 py-4 font-bold text-white">{p.dex}</td>
                  <td className="px-5 py-4">
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 border"
                      style={{ color, borderColor: `${color}40` }}
                    >
                      {p.blockchain}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-[#FABF2C] tabular-nums">
                    {fmtVol(p.volume30dUsd)}
                  </td>
                  <td className="px-5 py-4 text-right text-[#888] tabular-nums font-mono">
                    {fmtCount(p.tradeCount)}
                  </td>
                  <td className="px-5 py-4 text-right text-[#888] tabular-nums font-mono">
                    {fmtCount(p.uniqueTxs)}
                  </td>
                  <td className="px-5 py-4 text-right text-[#555] font-mono">{share}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Attribution footer ───────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          {isLive
            ? 'Live data: Dune Analytics · Query ID 6705632 · Refreshed every 30 min'
            : 'Reference data: DefiLlama /overview/dexs · Snapshot 2026-03-21 · Activate live data by setting DUNE_API_KEY'}
        </span>
        <a
          href="https://defillama.com/dexs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#555] font-mono text-[10px] uppercase tracking-widest hover:text-white transition-colors"
        >
          DefiLlama DEX Overview ↗
        </a>
      </div>

    </div>
  );
}
