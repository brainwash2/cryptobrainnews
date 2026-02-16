// src/lib/sidebar-config.ts
// ─── Data Terminal Navigation Configuration ──────────────────────────────
import type { SidebarSection } from './types';

export const DATA_SECTIONS: SidebarSection[] = [
  {
    label: 'Markets',
    icon: 'ChartBarIcon',
    basePath: '/data/markets',
    children: [
      { label: 'Overview', href: '/data/markets' },
      { label: 'Spot', href: '/data/markets/spot' },
      { label: 'Futures', href: '/data/markets/futures' },
      { label: 'Crypto Indices', href: '/data/markets/indices' },
      { label: 'Options', href: '/data/markets/options' },
      { label: 'Prices', href: '/data/markets/prices' },
      { label: 'Exchange Volumes', href: '/data/markets/volumes' },
    ],
  },
  {
    label: 'ETFs',
    icon: 'BanknotesIcon',
    basePath: '/data/etfs',
    children: [
      { label: 'Overview', href: '/data/etfs' },
      { label: 'Bitcoin ETFs', href: '/data/etfs/bitcoin' },
      { label: 'Ethereum ETFs', href: '/data/etfs/ethereum' },
      { label: 'ETF Comparison', href: '/data/etfs/comparison' },
    ],
  },
  {
    label: 'Stablecoins',
    icon: 'CurrencyDollarIcon',
    basePath: '/data/stablecoins',
    children: [
      { label: 'Overview', href: '/data/stablecoins' },
      { label: 'USD Pegged', href: '/data/stablecoins/usd' },
      { label: 'Supply by Chain', href: '/data/stablecoins/chains' },
    ],
  },
  {
    label: 'On-Chain',
    icon: 'CubeTransparentIcon',
    basePath: '/data/onchain',
    children: [
      { label: 'Overview', href: '/data/onchain' },
      { label: 'Bitcoin', href: '/data/onchain/bitcoin' },
      { label: 'Ethereum', href: '/data/onchain/ethereum' },
      { label: 'Solana', href: '/data/onchain/solana' },
      { label: 'CEX Flows', href: '/data/onchain/flows' },
      { label: 'Gas Tracker', href: '/data/onchain/gas' },
    ],
  },
  {
    label: 'Scaling',
    icon: 'ArrowsPointingOutIcon',
    basePath: '/data/scaling',
    children: [
      { label: 'Overview', href: '/data/scaling' },
      { label: 'L2 Comparison', href: '/data/scaling/l2-comparison' },
      { label: 'Optimistic Rollups', href: '/data/scaling/optimistic' },
      { label: 'ZK Rollups', href: '/data/scaling/zk' },
    ],
  },
  {
    label: 'DeFi',
    icon: 'CircleStackIcon',
    basePath: '/data/defi',
    children: [
      { label: 'Overview', href: '/data/defi' },
      { label: 'DEX Volume', href: '/data/defi/dex-volume' },
      { label: 'TVL Rankings', href: '/data/defi/tvl' },
      { label: 'Yields', href: '/data/defi/yields' },
      { label: 'Lending', href: '/data/defi/lending' },
      { label: 'Protocol Revenue', href: '/data/defi/revenue' },
      { label: '🐋 Whale Watch', href: '/data/defi/whale-watch' },
      { label: 'Large Swaps', href: '/data/defi/large-swaps' },
    ],
  },
  {
    label: 'NFTs',
    icon: 'PhotoIcon',
    basePath: '/data/nfts',
    children: [
      { label: 'Overview', href: '/data/nfts' },
      { label: 'Sales Volume', href: '/data/nfts/volume' },
      { label: 'Top Collections', href: '/data/nfts/collections' },
    ],
  },
];
