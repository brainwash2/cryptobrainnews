import React from "react";
import { getWhaleTransfers } from "@/lib/onchain-extended";
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
  const transfers = await getWhaleTransfers().catch(() => []);

  const totalVolume = transfers.reduce((s, t) => s + (Number(t.amount_usd) || 0), 0);
  const uniqueWhales = new Set(
    transfers.map((t) => String(t.whale_address ?? ""))
  ).size;

  return (
    <div className="space-y-8 pb-20">

      <DataHeader
        title="Whale Watch"
        description="Large USDT transfers on Ethereum (>$100K) - Source: Etherscan free API."
      />

      {/* Source badge */}
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - Etherscan
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          USDT transfers &gt;$100K on Ethereum - refreshed every 5 min
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Transfers</p>
          <p className="text-2xl font-black text-[#FABF2C]">{transfers.length}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Total Volume</p>
          <p className="text-2xl font-black text-[#FABF2C]">{formatUsd(totalVolume)}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Unique Senders</p>
          <p className="text-2xl font-black text-[#FABF2C]">{uniqueWhales}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Threshold</p>
          <p className="text-2xl font-black text-white">$100K+</p>
          <p className="text-[9px] font-mono text-[#555] mt-1">USDT only</p>
        </div>
      </div>

      {transfers.length === 0 ? (
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
                  <th className="px-6 py-3">To</th>
                  <th className="px-6 py-3 text-right">USD Value</th>
                  <th className="px-6 py-3">Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111]">
                {transfers.slice(0, 50).map((tx, i) => {
                  const blockTime = String(tx.block_time ?? "");
                  const timeStr   = blockTime
                    ? new Date(blockTime).toLocaleTimeString("en-US", {
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "-";
                  const fromAddr = String(tx.whale_address ?? "");
                  const toAddr   = String(tx.recipient   ?? "");
                  const txHash   = String(tx.tx_hash     ?? "");

                  return (
                    <tr
                      key={`${txHash}-${i}`}
                      className={`hover:bg-[#111] transition-colors ${
                        i % 2 === 0 ? "bg-[#080808]" : "bg-[#0b0b0b]"
                      }`}
                    >
                      <td className="px-6 py-3 text-[#555] font-mono whitespace-nowrap">
                        {timeStr}
                      </td>
                      <td className="px-6 py-3 font-semibold text-white">
                        {String(tx.token_symbol ?? "USDT")}
                      </td>
                      <td className="px-6 py-3 text-[#555] font-mono">
                        <a
                          href={`https://etherscan.io/address/${fromAddr}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FABF2C] transition-colors"
                        >
                          {shortenAddress(fromAddr)}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-[#555] font-mono">
                        <a
                          href={`https://etherscan.io/address/${toAddr}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FABF2C] transition-colors"
                        >
                          {shortenAddress(toAddr)}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-[#FABF2C]">
                        {formatUsd(tx.amount_usd)}
                      </td>
                      <td className="px-6 py-3">
                        <a
                          href={`https://etherscan.io/tx/${txHash}`}
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

      <p className="text-[10px] text-[#333] font-mono text-right">
        Source: Etherscan token transfer API - USDT contract 0xdac17f...ec7 - Free API key required
      </p>
    </div>
  );
}