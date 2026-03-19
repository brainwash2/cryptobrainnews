'use client';

import React           from 'react';
import Link             from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const LABELS: Record<string, string> = {
  data:             'Data Terminal',
  markets:          'Markets',
  spot:             'Spot',
  futures:          'Futures',
  options:          'Options',
  indices:          'Indices',
  'cme-cots':       'CME COTs',
  prices:           'Prices',
  companies:        'Companies',
  'exchange-tokens':'Exchange Tokens',
  'sports-tokens':  'Sports Tokens',
  volumes:          'Volumes',
  etfs:             'ETFs',
  bitcoin:          'Bitcoin',
  ethereum:         'Ethereum',
  solana:           'Solana',
  xrp:              'XRP',
  crypto:           'Crypto ETFs',
  comparison:       'Comparison',
  treasuries:       'Treasuries',
  stablecoins:      'Stablecoins',
  usd:              'USD Pegged',
  'non-usd':        'Non-USD',
  'non-fiat':       'Non-Fiat',
  chains:           'By Chain',
  onchain:          'On-Chain',
  avalanche:        'Avalanche',
  aptos:            'Aptos',
  flows:            'Flows',
  gas:              'Gas Tracker',
  scaling:          'Scaling',
  'l2-comparison':  'L2 Comparison',
  'l1-evm':         'L1 EVM',
  'l1-non-evm':     'L1 Non-EVM',
  optimistic:       'Optimistic Rollups',
  zk:               'ZK Rollups',
  'data-availability': 'Data Availability',
  defi:             'DeFi',
  tvl:              'TVL Rankings',
  revenue:          'Revenue',
  'dex-volume':     'DEX Volume',
  yields:           'Yields',
  lending:          'Lending',
  restaking:        'Restaking',
  launchpads:       'Launchpads',
  prediction:       'Prediction Markets',
  derivatives:      'Derivatives',
  rwa:              'RWA',
  exploits:         'Exploits',
  social:           'Social',
  'whale-watch':    'Whale Watch',
  'large-swaps':    'Large Swaps',
  nfts:             'NFTs',
  volume:           'Volume',
  collections:      'Collections',
  art:              'Art',
  gaming:           'Gaming',
  marketplaces:     'Marketplaces',
  alternative:      'Alternative',
  funding:          'Funding',
  politics:         'Politics',
  'web-traffic':    'Web Traffic',
  'app-usage':      'App Usage',
};

export function DataBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumb items
  const crumbs = segments.map((seg, i) => ({
    label: LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href:  '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 mb-6 flex-wrap" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          {i > 0 && <ChevronRight size={12} className="text-[#333] shrink-0" />}
          {crumb.isLast ? (
            <span className="text-[10px] font-black text-[#FABF2C] uppercase tracking-widest">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-[10px] font-mono text-[#555] hover:text-[#888] uppercase tracking-widest transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default DataBreadcrumb;
