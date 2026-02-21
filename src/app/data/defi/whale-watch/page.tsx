import React from 'react';
import { getWhaleTransfers } from '@/lib/dune';

export const metadata = { title: '🐋 Whale Watch' };
export const revalidate = 300;

function shortenAddress(addr: string | number | null | undefined): string {
  const s = String(addr ?? '');
  if (!s || s.length < 10) return s || '—';
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function formatUsd(value: string | number | null | undefined): string {
  const numValue = Number(value) || 0;
  if (numValue === 0) return '$0';
  if (numValue >= 1_000_000) return `$${(numValue / 1_000_000).toFixed(1)}M`;
  if (numValue >= 1_000) return `$${(numValue / 1_000).toFixed(0)}K`;
  return `$${numValue.toFixed(0)}`;
}

export default async function WhaleWatchPage() {
  const transfers = await getWhaleTransfers();

  const totalVolume = transfers.reduce((s, t) => s + (Number(t.amount_usd) || 0), 0);
  const uniqueWhales = new Set(
    transfers.map((t) => String(t.whale_address ?? t.sender ?? ''))
  ).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter mb-1">
          🐋 Whale <span className="text-[#FABF2C]">Watch</span>
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          Large on-chain transfers (last 24h)
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Transfers</p>
          <p className="text-2xl font-black text-[#FABF2C]">{transfers.length}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Total Volume</p>
          <p className="text-2xl font-black text-[#FABF2C]">{formatUsd(totalVolume)}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Unique Whales</p>
          <p className="text-2xl font-black text-[#FABF2C]">{uniqueWhales}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Data Source</p>
          <p className="text-2xl font-black text-[#FABF2C]">Dune</p>
        </div>
      </div>

      {transfers.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-12 text-center">
          <div className="text-4xl mb-4">🐋</div>
          <p className="text-[#555] font-mono text-xs uppercase">
            No whale transfers found. Dune API key may not be configured.
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
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">USD Value</th>
                  <th className="px-6 py-3">Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a0a0a]">
                {transfers.slice(0, 50).map((tx, i) => {
                  const blockTime = String(tx.block_time ?? '');
                  const timeStr = blockTime
                    ? new Date(blockTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : '—';
                  const fromAddr = tx.whale_address ?? tx.sender;
                  const toAddr = tx.recipient ?? tx.to;
                  const txHash = String(tx.tx_hash ?? '');

                  return (
                    <tr
                      key={`${txHash}-${i}`}
                      className={`hover:bg-[#111] transition-colors ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0b0b0b]'}`}
                    >
                      <td className="px-6 py-3 text-[#555] font-mono whitespace-nowrap">{timeStr}</td>
                      <td className="px-6 py-3 font-semibold text-white">
                        {String(tx.token_symbol ?? 'ETH')}
                      </td>
                      <td className="px-6 py-3 text-[#555] font-mono">
                        <a
                          href={`https://etherscan.io/address/${String(fromAddr ?? '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FABF2C]"
                        >
                          {shortenAddress(fromAddr)}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-[#555] font-mono">
                        <a
                          href={`https://etherscan.io/address/${String(toAddr ?? '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FABF2C]"
                        >
                          {shortenAddress(toAddr)}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-white">
                        {Number(tx.amount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
                          View ↗
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
    </div>
  );
}
