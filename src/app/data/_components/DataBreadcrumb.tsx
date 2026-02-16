'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const LABELS: Record<string, string> = {
  data: 'Terminal',
  markets: 'Markets',
  spot: 'Spot',
  futures: 'Futures',
  indices: 'Crypto Indices',
  options: 'Options',
  prices: 'Prices',
  volumes: 'Exchange Volumes',
  etfs: 'ETFs',
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  comparison: 'Comparison',
  stablecoins: 'Stablecoins',
  usd: 'USD Pegged',
  chains: 'By Chain',
  onchain: 'On-Chain',
  solana: 'Solana',
  flows: 'CEX Flows',
  gas: 'Gas Tracker',
  scaling: 'Scaling',
  'l2-comparison': 'L2 Comparison',
  optimistic: 'Optimistic Rollups',
  zk: 'ZK Rollups',
  defi: 'DeFi',
  'dex-volume': 'DEX Volume',
  tvl: 'TVL Rankings',
  yields: 'Yields',
  lending: 'Lending',
  revenue: 'Protocol Revenue',
  'whale-watch': 'Whale Watch',
  'large-swaps': 'Large Swaps',
  nfts: 'NFTs',
  volume: 'Sales Volume',
  collections: 'Top Collections',
};

export function DataBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-caption mb-6">
      {segments.map((segment, idx) => {
        const href = '/' + segments.slice(0, idx + 1).join('/');
        const isLast = idx === segments.length - 1;
        const label = LABELS[segment] || segment.replace(/-/g, ' ');
        return (
          <span key={href} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-border">/</span>}
            {isLast ? (
              <span className="text-foreground font-semibold capitalize">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-primary transition-colors capitalize"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
