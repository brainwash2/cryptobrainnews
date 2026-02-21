import React from 'react';

export const metadata = { title: 'Large DEX Swaps' };

interface DexSwap {
  tx_hash: string;
  block_time: string;
  project: string;
  token_a_symbol: string;
  token_b_symbol: string;
  usd_amount: number;
}

// NOTE: Add your large DEX swaps API integration here
async function getLargeDexSwaps(): Promise<DexSwap[]> {
  try {
    // TODO: Replace with your actual API call
    // Example from Dune Analytics:
    // const res = await fetch('https://api.dune.com/api/v1/query/{QUERY_ID}/results', {
    //   headers: { 'X-DUNE-API-KEY': process.env.DUNE_API_KEY }
    // });
    // return res.json().data.rows;
    return [];
  } catch (error) {
    console.error('Failed to fetch large swaps:', error);
    return [];
  }
}

function formatUsd(val: number | null | undefined) {
  if (!val) return '$0';
  return val >= 1e6 ? `$${(val / 1e6).toFixed(2)}M` : `$${(val / 1e3).toFixed(0)}K`;
}

export default async function LargeSwapsPage() {
  const swaps = await getLargeDexSwaps();

  const totalVolume = swaps.reduce((acc, s) => acc + (s.usd_amount || 0), 0);
  const avgSwap = swaps.length > 0 ? totalVolume / swaps.length : 0;

  // Find top active pair
  const pairCounts: Record<string, number> = {};
  swaps.forEach((s) => {
    const pair = `${s.token_a_symbol}/${s.token_b_symbol}`;
    pairCounts[pair] = (pairCounts[pair] || 0) + 1;
  });
  const topPair = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground font-heading mb-1">
          DEX <span className="text-[#FABF2C]">Flow</span>
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em]">
          Live trades &gt; $100k on Uniswap, Curve, Balancer
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">24h Volume (Sample)</p>
          <p className="text-2xl font-black text-[#FABF2C]">{formatUsd(totalVolume)}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Avg Trade Size</p>
          <p className="text-2xl font-black text-[#FABF2C]">{formatUsd(avgSwap)}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Top Active Pair</p>
          <p className="text-2xl font-black text-[#FABF2C]">{topPair}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Source</p>
          <p className="text-2xl font-black text-[#FABF2C]">Dune</p>
        </div>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/50 text-[#555] uppercase tracking-wider font-mono border-b border-[#1a1a1a]">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">DEX</th>
                <th className="px-6 py-3">Pair</th>
                <th className="px-6 py-3 text-right">Value (USD)</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3 text-center">Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {swaps.map((swap, i) => (
                <tr key={`${swap.tx_hash}-${i}`} className={`hover:bg-primary/5 transition-colors group ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0b0b0b]'}`}>
                  <td className="px-6 py-3 text-[#555] font-data whitespace-nowrap">
                    {new Date(swap.block_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-3 font-bold text-white capitalize">
                    {swap.project}
                  </td>
                  <td className="px-6 py-3 text-[#555] font-data">
                    <span className="text-white font-bold">{swap.token_a_symbol}</span>
                    <span className="mx-1 text-[#444]">/</span>
                    <span>{swap.token_b_symbol}</span>
                  </td>
                  <td className="px-6 py-3 text-right font-data font-bold text-[#FABF2C]">
                    {formatUsd(swap.usd_amount)}
                  </td>
                  <td className="px-6 py-3 text-right text-xs font-mono text-[#00d672]">
                    SWAP
                  </td>
                  <td className="px-6 py-3 text-center">
                    <a
                      href={`https://etherscan.io/tx/${swap.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#555] hover:text-white transition-colors"
                    >
                      ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {swaps.length === 0 && (
        <div className="py-20 text-center border border-dashed border-[#1a1a1a]">
          <p className="text-[#555] font-mono text-xs uppercase">No large swaps data available • Add your Dune API integration</p>
        </div>
      )}
    </div>
  );
}
