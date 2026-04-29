// src/app/data/onchain/comparison/page.tsx — add Flipside/Free tab
// Adds a third tab ("Free APIs") that uses existing REST APIs for cross‑chain
// active address comparison. This replaces the planned Flipside SQL tab while
// Flipside is gated behind organization access.
import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import { getAllChainsSummary } from "@/lib/onchain-data";
import { getBTCActiveAddresses, getETHActiveAddresses } from "@/lib/onchain-extended";

export const metadata = {
  title: "On-Chain Comparison | CryptoBrainNews",
  description: "Cross-chain TVL, 24h change, protocol count, and active address comparison across all major blockchains.",
};
export const revalidate = 3600;

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function PctCell({ v }: { v: number | null }) {
  if (v === null) return <span className="text-[#333]">—</span>;
  const pos = v >= 0;
  return (
    <span className={`font-mono font-bold tabular-nums text-xs ${pos ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
      {pos ? '+' : ''}{v.toFixed(2)}%
    </span>
  );
}

interface ActiveAddressRow {
  chain: string;
  today: number;
  yesterday: number;
  changePct: number | null;
  source: string;
}

async function ComparisonData() {
  const chains = await getAllChainsSummary();
  const totalTvl = chains.reduce((s, c) => s + c.tvl, 0);

  // Fetch active address data from free REST APIs
  const [btcAddr, ethAddr] = await Promise.all([
    getBTCActiveAddresses(7).catch(() => []),
    getETHActiveAddresses(7).catch(() => []),
  ]);

  // Build active address comparison rows
  const addrRows: ActiveAddressRow[] = [];

  // BTC
  if (btcAddr.length >= 2) {
    const today     = Number(btcAddr[btcAddr.length - 1]?.active_addresses ?? 0);
    const yesterday = Number(btcAddr[btcAddr.length - 2]?.active_addresses ?? 0);
    addrRows.push({
      chain: "Bitcoin",
      today,
      yesterday,
      changePct: yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : null,
      source: "blockchain.info",
    });
  } else {
    addrRows.push({
      chain: "Bitcoin", today: 0, yesterday: 0, changePct: null,
      source: "Unavailable (blockchain.info)",
    });
  }

  // ETH
  if (ethAddr.length >= 2) {
    const today     = Number(ethAddr[ethAddr.length - 1]?.active_addresses ?? 0);
    const yesterday = Number(ethAddr[ethAddr.length - 2]?.active_addresses ?? 0);
    addrRows.push({
      chain: "Ethereum",
      today,
      yesterday,
      changePct: yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : null,
      source: "Etherscan Stats",
    });
  } else {
    addrRows.push({
      chain: "Ethereum", today: 0, yesterday: 0, changePct: null,
      source: "Set ETHERSCAN_API_KEY for live data",
    });
  }

  // Solana — approximate from TVL as activity proxy
  const solChain = chains.find((c) => c.name === "Solana");
  if (solChain) {
    addrRows.push({
      chain: "Solana",
      today: 0,
      yesterday: 0,
      changePct: null,
      source: "TVL proxy — no free address API",
    });
  }

  const hasAddrData = addrRows.some((r) => r.today > 0);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Cross-Chain Comparison"
        description="TVL, 24h/7d change, protocol count, and active address comparison across all major blockchains."
      />

      {/* ── Headline Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total TVL Tracked',  value: fmtUsd(totalTvl),      color: '#FABF2C' },
          { label: 'Chains Tracked',     value: String(chains.length),  color: '#FABF2C' },
          { label: '#1 Chain',           value: chains[0]?.name ?? '—', color: '#fff' },
          { label: 'Source',             value: 'DefiLlama',            color: '#888', sub: 'Hourly cache' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            {'sub' in s && s.sub && <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── TVL Market Share Bars (top 10) ─────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-6">
          TVL Market Share (Top 10)
        </h3>
        <div className="space-y-3">
          {chains.slice(0, 10).map((c) => {
            const share = totalTvl > 0 ? (c.tvl / totalTvl) * 100 : 0;
            return (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-24 text-right font-bold text-white text-[10px] shrink-0 truncate">{c.name}</span>
                <div className="flex-1 h-4 bg-[#111]">
                  <div
                    className="h-full bg-[#FABF2C] opacity-80 transition-all"
                    style={{ width: `${(share / (chains[0]?.tvl / totalTvl * 100 || 1)) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right font-mono text-[10px] text-[#FABF2C] tabular-nums shrink-0">
                  {fmtUsd(c.tvl)}
                </span>
                <span className="w-10 text-right font-mono text-[10px] text-[#555] tabular-nums shrink-0">
                  {share.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active Addresses tab ───────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#3b82f6] rounded-full" />
          Active Addresses — Free REST APIs
        </h3>

        <div className="flex items-center gap-3 mb-4">
          <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
            hasAddrData
              ? "border-[#00d672]/40 text-[#00d672]"
              : "border-[#FABF2C]/40 text-[#FABF2C]"
          }`}>
            {hasAddrData ? "● Live — blockchain.info + Etherscan" : "◌ Partial — configure ETHERSCAN_API_KEY"}
          </span>
          <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
            Free APIs — no SQL engine required
          </span>
        </div>

        <div className="border border-[#1a1a1a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {["Chain", "Today", "Yesterday", "24h Change", "Data Source"].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                    ["Chain", "Data Source"].includes(h) ? "text-left" : "text-right"
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {addrRows.map((r, i) => (
                <tr key={r.chain} className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                  i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                }`}>
                  <td className="px-4 py-3 font-bold text-white">{r.chain}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#FABF2C]">
                    {r.today > 0 ? r.today.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {r.yesterday > 0 ? r.yesterday.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right"><PctCell v={r.changePct} /></td>
                  <td className="px-4 py-3 text-[#555] font-mono">{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2">
          BTC: blockchain.info/charts/n-unique-addresses (free, no key) · ETH: Etherscan Stats API (free key) ·
          Solana: no free daily address API — shown as TVL proxy in main table above.
        </p>
      </div>

      {/* ── Full Chain Table ───────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          All Chains – Ranked by TVL
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['#', 'Chain', 'TVL', '24h %', '7d %', 'Protocols', 'Share'].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                      h === '#' || h === 'Chain' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chains.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[#555] font-mono text-xs">
                    Syncing chain data...
                  </td>
                </tr>
              )}
              {chains.map((c, i) => {
                const share = totalTvl > 0 ? (c.tvl / totalTvl) * 100 : 0;
                return (
                  <tr
                    key={c.name}
                    className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                      i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                    }`}
                  >
                    <td className="px-4 py-3 text-[#555] tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                    <td className="px-4 py-3 text-right font-mono font-black tabular-nums text-[#FABF2C]">
                      {fmtUsd(c.tvl)}
                    </td>
                    <td className="px-4 py-3 text-right"><PctCell v={c.change1d} /></td>
                    <td className="px-4 py-3 text-right"><PctCell v={c.change7d} /></td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {c.protocols ?? '—'}
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
          Source: DefiLlama · Cached 1 hour
        </p>
      </div>
    </div>
  );
}

export default function OnchainComparisonPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <ComparisonData />
      </Suspense>
    </main>
  );
}
