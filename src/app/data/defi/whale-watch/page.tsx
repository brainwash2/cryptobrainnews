// src/app/data/defi/whale-watch/page.tsx
import React from "react";
import { getWhaleTransfers } from "@/lib/onchain-extended";
import { getZerionWhaleAlerts } from "@/lib/zerion";
import { DataHeader } from "../../_components/DataHeader";

export const metadata = { title: "Whale Watch | CryptoBrainNews" };
export const revalidate = 300;

function shortenAddress(addr: string | number | null | undefined): string {
  const s = String(addr ?? "");
  if (!s || s.length < 10) return s || "-";
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function formatUsd(value: string | number | null | undefined): string {
  const n = Number(value) || 0;
  if (n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default async function WhaleWatchPage() {
  const [etherscanTransfers, zerionAlerts] = await Promise.all([
    getWhaleTransfers().catch(() => []),
    getZerionWhaleAlerts(50).catch(() => []),
  ]);

  const hasZerion = zerionAlerts.length > 0;

  // Merge both sources: Etherscan + Zerion
  // Zerion provides entity labels that Etherscan lacks
  const allTransfers = [
    // Etherscan transfers (primary source)
    ...etherscanTransfers.map((t) => ({
      blockchain:       String(t.blockchain ?? 'ethereum'),
      timestamp:        String(t.block_time ?? ''),
      tx_hash:          String(t.tx_hash ?? ''),
      whale_address:    String(t.whale_address ?? ''),
      whale_label:      null as string | null,
      recipient:        String(t.recipient ?? ''),
      recipient_label:  null as string | null,
      token_symbol:     String(t.token_symbol ?? 'USDT'),
      amount_usd:       Number(t.amount_usd ?? 0),
      source:           'etherscan' as const,
    })),
    // Zerion alerts (enriched with entity labels)
    ...zerionAlerts.map((a) => ({
      blockchain:       a.blockchain,
      timestamp:        a.timestamp,
      tx_hash:          a.tx_hash,
      whale_address:    a.whale_address,
      whale_label:      a.whale_label,
      recipient:        a.recipient,
      recipient_label:  a.recipient_label,
      token_symbol:     a.token_symbol,
      amount_usd:       a.amount_usd,
      source:           'zerion' as const,
    })),
  ];

  // Deduplicate by tx_hash (Etherscan takes precedence)
  const seenTx = new Set<string>();
  const deduped = allTransfers.filter((t) => {
    if (seenTx.has(t.tx_hash)) return false;
    seenTx.add(t.tx_hash);
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalVolume = deduped.reduce((s, t) => s + t.amount_usd, 0);
  const uniqueSenders = new Set(deduped.map((t) => t.whale_address)).size;

  // Count labelled transfers from Zerion
  const labelledCount = deduped.filter(
    (t) => t.whale_label !== null || t.recipient_label !== null,
  ).length;

  return (
    <div className="space-y-8 pb-20">

      <DataHeader
        title="Whale Watch"
        description="Large transfers on Ethereum — Etherscan USDT/USDC (>$100K) + Zerion entity‑labelled whale alerts (>$100K)."
      />

      {/* Source badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          ● Live — Etherscan
        </span>
        {hasZerion ? (
          <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
            ● Live — Zerion
          </span>
        ) : (
          <span className="border border-[#FABF2C]/40 text-[#FABF2C] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
            ◌ Zerion — Set ZERION_API_KEY for entity labels
          </span>
        )}
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          {deduped.length} transfers tracked · Refreshed every 5 min
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Total Transfers</p>
          <p className="text-2xl font-black text-[#FABF2C]">{deduped.length}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Total Volume</p>
          <p className="text-2xl font-black text-[#FABF2C]">{formatUsd(totalVolume)}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Unique Senders</p>
          <p className="text-2xl font-black text-[#FABF2C]">{uniqueSenders}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Threshold</p>
          <p className="text-2xl font-black text-white">$100K+</p>
          {hasZerion && (
            <p className="text-[9px] font-mono text-[#00d672] mt-1">
              {labelledCount} entity‑labelled
            </p>
          )}
        </div>
      </div>

      {deduped.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-12 text-center">
          <p className="text-[10px] text-[#555] font-mono uppercase tracking-widest mb-2">
            No large transfers found
          </p>
          <p className="text-[9px] text-[#333] font-mono">
            Requires ETHERSCAN_API_KEY in environment variables.
            Get a free key at etherscan.io/myapikey
          </p>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080808] text-[#555] uppercase tracking-wider font-mono border-b border-[#1a1a1a]">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Token</th>
                  <th className="px-6 py-3">From</th>
                  <th className="px-6 py-3">Entity</th>
                  <th className="px-6 py-3">To</th>
                  <th className="px-6 py-3 text-right">USD Value</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111]">
                {deduped.slice(0, 100).map((tx, i) => {
                  const timeStr = tx.timestamp
                    ? new Date(tx.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "-";
                  const label = tx.whale_label ?? tx.recipient_label;

                  return (
                    <tr
                      key={`${tx.tx_hash}-${i}`}
                      className={`hover:bg-[#111] transition-colors ${
                        i % 2 === 0 ? "bg-[#080808]" : "bg-[#0b0b0b]"
                      }`}
                    >
                      <td className="px-6 py-3 text-[#555] font-mono whitespace-nowrap">
                        {timeStr}
                      </td>
                      <td className="px-6 py-3 font-semibold text-white">
                        {tx.token_symbol}
                      </td>
                      <td className="px-6 py-3 text-[#555] font-mono">
                        <a
                          href={`https://etherscan.io/address/${tx.whale_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FABF2C] transition-colors"
                        >
                          {shortenAddress(tx.whale_address)}
                        </a>
                      </td>
                      <td className="px-6 py-3">
                        {label ? (
                          <span className="font-mono text-[10px] px-2 py-0.5 border border-[#00d672]/30 text-[#00d672] bg-[#00d672]/10">
                            {label}
                          </span>
                        ) : (
                          <span className="text-[#333]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-[#555] font-mono">
                        <a
                          href={`https://etherscan.io/address/${tx.recipient}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FABF2C] transition-colors"
                        >
                          {shortenAddress(tx.recipient)}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-[#FABF2C]">
                        {formatUsd(tx.amount_usd)}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`font-mono text-[9px] uppercase tracking-widest ${
                          tx.source === 'zerion' ? 'text-[#00d672]' : 'text-[#555]'
                        }`}>
                          {tx.source}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <a
                          href={`https://etherscan.io/tx/${tx.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FABF2C] hover:underline font-mono"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border border-[#1a1a1a] bg-[#080808] p-5 flex flex-col gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white mb-2">Data Sources</h3>
          <p className="text-[10px] text-[#555] font-mono leading-relaxed">
            <span className="text-[#FABF2C] font-black">Etherscan:</span> Token transfer API —
            USDT/USDC transfers &gt;$100K on Ethereum. Free API key required (etherscan.io/myapikey).
          </p>
          <p className="text-[10px] text-[#555] font-mono leading-relaxed mt-2">
            <span className="text-[#00d672] font-black">Zerion:</span> Entity‑labelled whale alerts —
            exchange hot wallets, DeFi contracts, MEV bots. Free tier: 3,000 requests/day.
            Sign up at dashboard.zerion.io · Set ZERION_API_KEY to activate.
          </p>
        </div>
      </div>

      <p className="text-[10px] text-[#333] font-mono text-right">
        Source: Etherscan + Zerion APIs · Cached 5 min · Duplicates merged by transaction hash
      </p>
    </div>
  );
}