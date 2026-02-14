import { getLargeDexSwaps } from '@/lib/dune';
import { MetricCard } from '../../_components/MetricCard';

export const metadata = { title: 'Large DEX Swaps' };

function formatUsd(val: number) {
  if (!val) return '$0';
  return val >= 1e6 
    ? `$${(val / 1e6).toFixed(2)}M` 
    : `$${(val / 1e3).toFixed(0)}K`;
}

export default async function LargeSwapsPage() {
  const swaps = await getLargeDexSwaps();
  
  // Calculate aggregate stats from the last batch
  const totalVolume = swaps.reduce((acc, s) => acc + (s.usd_amount || 0), 0);
  const avgSwap = swaps.length > 0 ? totalVolume / swaps.length : 0;
  
  // Find top active pair
  const pairCounts: Record<string, number> = {};
  swaps.forEach(s => {
    const pair = `${s.token_a_symbol}/${s.token_b_symbol}`;
    pairCounts[pair] = (pairCounts[pair] || 0) + 1;
  });
  const topPair = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground font-heading mb-1">
          DEX <span className="text-primary">Flow</span>
        </h1>
        <p className="text-sm text-muted-foreground font-caption">
          Live trades &gt; $100k on Uniswap, Curve, Balancer
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="24h Volume (Sample)" value={formatUsd(totalVolume)} />
        <MetricCard label="Avg Trade Size" value={formatUsd(avgSwap)} />
        <MetricCard label="Top Active Pair" value={topPair} />
        <MetricCard label="Source" value="Dune Dex.Trades" />
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-xs text-muted-foreground uppercase tracking-wider font-caption">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">DEX</th>
                <th className="px-6 py-3">Pair</th>
                <th className="px-6 py-3 text-right">Value (USD)</th>
                <th className="px-6 py-3 text-right">Action</th>
                <th className="px-6 py-3 text-center">Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {swaps.map((swap, i) => (
                <tr key={`${swap.tx_hash}-${i}`} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-3 text-xs text-muted-foreground font-data whitespace-nowrap">
                    {new Date(swap.block_time).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-foreground capitalize">
                    {swap.project}
                  </td>
                  <td className="px-6 py-3 text-xs font-data text-muted-foreground">
                    <span className="text-foreground font-bold">{swap.token_a_symbol}</span>
                    <span className="mx-1 text-[#444]">/</span>
                    <span>{swap.token_b_symbol}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-right font-data font-bold text-primary">
                    {formatUsd(swap.usd_amount)}
                  </td>
                  <td className="px-6 py-3 text-right text-xs font-mono text-muted-foreground">
                    <span className="text-success">SWAP</span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <a 
                      href={`https://etherscan.io/tx/${swap.tx_hash}`} 
                      target="_blank" 
                      rel="noopener"
                      className="text-[#444] hover:text-white transition-colors"
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
    </div>
  );
}
