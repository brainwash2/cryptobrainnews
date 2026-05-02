import React, { Suspense } from 'react';
import { DataHeader }       from '../../_components/DataHeader';
import { ChartSkeleton }    from '../../_components/ChartSkeleton';
import { getDexFlowsByChain } from '@/lib/onchain-data';
import { getNetExchangeFlows } from '@/lib/glassnode';
import { cached }             from '@/lib/cache';

export const metadata = {
  title: 'CEX / DEX Flows | CryptoBrainNews',
  description: 'Exchange inflows and outflows – DEX volume by protocol as a proxy for on-chain flow activity.',
};
export const revalidate = 1800;

// ── Unit 3: Cross-Chain Bridge Volume (DefiLlama) ─────────────────────────────

interface BridgeEntry {
  name:          string;
  displayName:   string;
  volume24h:     number;
  volume7d:      number;
}

async function fetchBridgeVolume(): Promise<{ total24h: number; bridges: BridgeEntry[] }> {
  return cached("bridges:vol:24h:v1", async () => {
    try {
      const res = await fetch("https://api.llama.fi/bridges", {
        next: { revalidate: 3600 },
      });
      if (!res.ok) return { total24h: 0, bridges: [] };
      const json = await res.json() as {
        bridges?: Array<{
          name?:          string;
          displayName?:   string;
          lastDailyVolume?: number;
          lastWeeklyVolume?: number;
        }>;
      };
      const raw = (json.bridges ?? [])
        .map((b) => ({
          name:        b.name        ?? "",
          displayName: b.displayName ?? b.name ?? "",
          volume24h:   b.lastDailyVolume   ?? 0,
          volume7d:    b.lastWeeklyVolume  ?? 0,
        }))
        .filter((b) => b.volume24h > 0)
        .sort((a, b) => b.volume24h - a.volume24h);
      const total24h = raw.reduce((s, b) => s + b.volume24h, 0);
      return { total24h, bridges: raw.slice(0, 5) };
    } catch {
      return { total24h: 0, bridges: [] };
    }
  }, 3600);
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

async function FlowsData() {
  const [dexFlows, netFlows, bridgeData] = await Promise.all([
    getDexFlowsByChain(),
    getNetExchangeFlows().catch(() => []),
    fetchBridgeVolume(),
  ]);
  const total24h = dexFlows.reduce((s, d) => s + d.total24h, 0);
  const total7d  = dexFlows.reduce((s, d) => s + d.total7d, 0);
  const isGlassnodeLive = netFlows.some(f => f.source === 'live');

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Exchange Flows"
        description="DEX protocol volumes as an on-chain flow proxy – top protocols by 24h volume."
      />

      {/* ── Net Exchange Flows — Glassnode ───────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#FABF2C]/30 p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
              Net Exchange Flows — BTC & ETH
            </h3>
            <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
              Negative = outflow from exchanges (typically bullish) · Positive = inflow (typically bearish)
            </p>
          </div>
          <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
            isGlassnodeLive
              ? 'border-[#00d672]/40 text-[#00d672]'
              : 'border-[#FABF2C]/40 text-[#FABF2C]'
          }`}>
            {isGlassnodeLive ? '● Live — Glassnode' : '◌ Seed — Set GLASSNODE_API_KEY'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {netFlows.map((flow) => {
            const accent    = flow.asset === 'BTC' ? '#FABF2C' : '#3b82f6';
            const trendIcon = flow.trend === 'accumulation' ? '🟢' : flow.trend === 'distribution' ? '🔴' : '⚪';
            const trendLabel = flow.trend === 'accumulation' ? 'Accumulation' : flow.trend === 'distribution' ? 'Distribution' : 'Neutral';
            return (
              <div key={flow.asset} className="border border-[#1a1a1a] bg-[#080808] p-5"
                style={{ borderLeftColor: accent, borderLeftWidth: 3 }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: accent }}>
                    {flow.asset}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 border" style={{
                    color: flow.trend === 'accumulation' ? '#00d672' :
                           flow.trend === 'distribution' ? '#ff4757' : '#888',
                    borderColor: flow.trend === 'accumulation' ? '#00d67240' :
                                flow.trend === 'distribution' ? '#ff475740' : '#333',
                  }}>
                    {trendIcon} {trendLabel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-mono text-[#555] uppercase mb-1">Net Flow (24h)</p>
                    <p className={`text-2xl font-black tabular-nums ${flow.netFlow24h <= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                      {flow.netFlow24h > 0 ? '+' : ''}{flow.netFlow24h.toLocaleString()} {flow.asset}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-[#555] uppercase mb-1">Net Flow (7d)</p>
                    <p className={`text-2xl font-black tabular-nums ${flow.netFlow7d <= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                      {flow.netFlow7d > 0 ? '+' : ''}{flow.netFlow7d.toLocaleString()} {flow.asset}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-[#333] font-mono mt-3">
          Source: Glassnode exchange net flows · Requires GLASSNODE_API_KEY for live data
        </p>
      </div>

      {/* ── Note on CEX flows ─────────────────────────────────────── */}
      <div className="border border-[#FABF2C]/20 bg-[#FABF2C]/[0.02] p-5">
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          <span className="text-[#FABF2C] font-black">About CEX flows:</span>{' '}
          True CEX inflow/outflow data requires Nansen or Glassnode (paid APIs).
          This page shows DEX protocol volumes from DefiLlama as a free-tier proxy for on-chain
          exchange activity. Whale transfer data (Dune Query 7) will be integrated once query IDs are configured.
        </p>
      </div>

      {/* Unit 3 — Cross-Chain Bridge Volume ──────────────────────────────────── */}
      {bridgeData.total24h > 0 && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#00d672] pl-3">
              Cross-Chain Bridge Volume
            </h3>
            <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
              ● Live — DefiLlama
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#080808] border border-[#1a1a1a] p-4">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">24h Bridge Volume</p>
              <p className="text-2xl font-black text-[#00d672] tabular-nums">{fmtUsd(bridgeData.total24h)}</p>
              <p className="text-[10px] font-mono text-[#555] mt-1">all tracked bridges</p>
            </div>
            <div className="bg-[#080808] border border-[#1a1a1a] p-4">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Bridges Tracked</p>
              <p className="text-2xl font-black text-[#888] tabular-nums">
                {bridgeData.bridges.length}
              </p>
              <p className="text-[10px] font-mono text-[#555] mt-1">top 5 shown</p>
            </div>
            <div className="bg-[#080808] border border-[#1a1a1a] p-4">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Leader 24h</p>
              <p className="text-xl font-black text-[#FABF2C] tabular-nums truncate">
                {bridgeData.bridges[0]?.displayName ?? "—"}
              </p>
              <p className="text-[10px] font-mono text-[#555] mt-1">
                {bridgeData.bridges[0] ? fmtUsd(bridgeData.bridges[0].volume24h) : "—"}
              </p>
            </div>
          </div>

          <div className="border border-[#1a1a1a] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                  {['#', 'Bridge', '24h Volume', '7d Volume', 'Share (24h)'].map((h) => (
                    <th key={h}
                      className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                        h === '#' || h === 'Bridge' ? 'text-left' : 'text-right'
                      }`}
                    >{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bridgeData.bridges.map((b, i) => {
                  const share = bridgeData.total24h > 0 ? (b.volume24h / bridgeData.total24h) * 100 : 0;
                  return (
                    <tr key={b.name}
                      className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                        i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                      }`}>
                      <td className="px-4 py-3 text-[#555] tabular-nums">{i + 1}</td>
                      <td className="px-4 py-3 font-bold text-white">{b.displayName}</td>
                      <td className="px-4 py-3 text-right font-mono font-black tabular-nums text-[#00d672]">
                        {fmtUsd(b.volume24h)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                        {fmtUsd(b.volume7d)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#555]">
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[9px] text-[#333] font-mono mt-3">
            Source: api.llama.fi/bridges · Cached 1 h
          </p>
        </div>
      )}

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
