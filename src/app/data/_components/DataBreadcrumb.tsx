'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const LABELS: Record<string, string> = {
  data: 'Terminal',
  defi: 'DeFi',
  tvl: 'TVL',
  yields: 'Yields',
  stablecoins: 'Stablecoins',
  'whale-watch': 'Whale Watch',
  market: 'Market',
  spot: 'Spot',
  futures: 'Futures',
  volumes: 'Volumes',
  etfs: 'ETFs',
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  onchain: 'On‑Chain',
  gas: 'Gas',
  addresses: 'Addresses',
};

export function DataBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-caption mb-6">
      {segments.map((segment, idx) => {
        const href = '/' + segments.slice(0, idx + 1).join('/');
        const isLast = idx === segments.length - 1;
        const label = LABELS[segment] || segment;
        return (
          <span key={href} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-border">/</span>}
            {isLast ? (
              <span className="text-foreground font-semibold">{label}</span>
            ) : (
              <Link href={href} className="hover:text-primary transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
