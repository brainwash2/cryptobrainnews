import { getWhaleTransfers } from '@/lib/dune';
import { MetricCard } from '../../_components/MetricCard';

export const metadata = { title: '🐋 Whale Watch' };

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || '—';
  return `${addr.slice(0,6)}…${addr.slice(-4)}`;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default async function WhaleWatchPage() {
  const transfers = await getWhaleTransfers();
  const totalVolume = transfers.reduce((s, t) => s + (t.usd_value || 0), 0);
  const uniqueWhales = new Set(transfers.map(t => t.sender)).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground font-heading mb-1">🐋 Whale <span className="text-primary">Watch</span></h1>
        <p className="text-sm text-muted-foreground font-caption">Large on‑chain transfers (last 24h)</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Transfers" value={String(transfers.length)} />
        <MetricCard label="Total Volume" value={formatUsd(totalVolume)} />
        <MetricCard label="Unique Whales" value={String(uniqueWhales)} />
        <MetricCard label="Data Source" value="Dune" />
      </div>

      {transfers.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center text-muted-foreground">
          <div className="text-4xl mb-4">🐋</div>
          <p>No whale transfers found. Dune API key may not be configured.</p>
        </div>
      ) : (
        <div className="bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/50 text-xs text-muted-foreground uppercase tracking-wider font-caption">
                <tr>
                  <th className="px-6 py-3">Time</th><th className="px-6 py-3">Token</th><th className="px-6 py-3">From</th>
                  <th className="px-6 py-3">To</th><th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">USD Value</th><th className="px-6 py-3">Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transfers.slice(0, 50).map((tx, i) => (
                  <tr key={`${tx.tx_hash}-${i}`} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-3 text-xs text-muted-foreground font-data whitespace-nowrap">
                      {new Date(tx.block_time).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-foreground">{tx.token_symbol || 'ETH'}</td>
                    <td className="px-6 py-3 text-xs font-data text-muted-foreground">
                      <a href={`https://etherscan.io/address/${tx.sender}`} target="_blank" rel="noopener" className="hover:text-primary">{shortenAddress(tx.sender)}</a>
                    </td>
                    <td className="px-6 py-3 text-xs font-data text-muted-foreground">
                      <a href={`https://etherscan.io/address/${tx.receiver}`} target="_blank" rel="noopener" className="hover:text-primary">{shortenAddress(tx.receiver)}</a>
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-data text-foreground">
                      {tx.amount?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-data font-bold text-primary">
                      {formatUsd(tx.usd_value)}
                    </td>
                    <td className="px-6 py-3 text-xs">
                      <a href={`https://etherscan.io/tx/${tx.tx_hash}`} target="_blank" rel="noopener" className="text-primary hover:underline font-data">View ↗</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
