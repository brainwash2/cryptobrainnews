// src/lib/sidebar-config.ts
// ─── Data Terminal Navigation Configuration ──────────────────────────────
// Phase 37: Complete rebuild to cover all sections from metrics.txt
import type { SidebarSection } from './types';

export const DATA_SECTIONS: SidebarSection[] = [
  // ── 1. Markets ──────────────────────────────────────────────────────────
  {
    label: 'Markets',
    icon: 'ChartBarIcon',
    basePath: '/data/markets',
    children: [
      { label: 'Spot',            href: '/data/markets/spot' },
      { label: 'Futures',         href: '/data/markets/futures' },
      { label: 'Options',         href: '/data/markets/options' },
      { label: 'Crypto Indices',  href: '/data/markets/indices' },
      { label: 'CME COTs',        href: '/data/markets/cme-cots' },
      { label: 'Prices',          href: '/data/markets/prices' },
      { label: 'Companies',       href: '/data/markets/companies' },
      { label: 'Exchange Tokens', href: '/data/markets/exchange-tokens' },
      { label: 'Sports Tokens',   href: '/data/markets/sports-tokens' },
    ],
  },

  // ── 2. ETFs ─────────────────────────────────────────────────────────────
  {
    label: 'ETFs',
    icon: 'BanknotesIcon',
    basePath: '/data/etfs',
    children: [
      { label: 'Bitcoin ETFs',   href: '/data/etfs/bitcoin' },
      { label: 'Ethereum ETFs',  href: '/data/etfs/ethereum' },
      { label: 'Solana ETFs',    href: '/data/etfs/solana' },
      { label: 'XRP ETFs',       href: '/data/etfs/xrp' },
      { label: 'Crypto ETFs',    href: '/data/etfs/crypto' },
      { label: 'ETF Comparison', href: '/data/etfs/comparison' },
    ],
  },

  // ── 3. Treasuries ────────────────────────────────────────────────────────
  {
    label: 'Treasuries',
    icon: 'BuildingLibraryIcon',
    basePath: '/data/treasuries',
    children: [
      { label: 'Bitcoin',  href: '/data/treasuries/bitcoin' },
      { label: 'Ethereum', href: '/data/treasuries/ethereum' },
      { label: 'Solana',   href: '/data/treasuries/solana' },
      { label: 'Crypto',   href: '/data/treasuries/crypto' },
    ],
  },

  // ── 4. Stablecoins ───────────────────────────────────────────────────────
  {
    label: 'Stablecoins',
    icon: 'CurrencyDollarIcon',
    basePath: '/data/stablecoins',
    children: [
      { label: 'USD Pegged',      href: '/data/stablecoins/usd' },
      { label: 'Non-USD Pegged',  href: '/data/stablecoins/non-usd' },
      { label: 'Non-Fiat Pegged', href: '/data/stablecoins/non-fiat' },
      { label: 'Supply by Chain', href: '/data/stablecoins/chains' },
    ],
  },

  // ── 5. On-Chain ──────────────────────────────────────────────────────────
  {
    label: 'On-Chain',
    icon: 'CubeTransparentIcon',
    basePath: '/data/onchain',
    children: [
      { label: 'Bitcoin',    href: '/data/onchain/bitcoin' },
      { label: 'Ethereum',   href: '/data/onchain/ethereum' },
      { label: 'Solana',     href: '/data/onchain/solana' },
      { label: 'Avalanche',  href: '/data/onchain/avalanche' },
      { label: 'Aptos',      href: '/data/onchain/aptos' },
      { label: 'Comparison', href: '/data/onchain/comparison' },
      { label: 'CEX Flows',  href: '/data/onchain/flows' },
      { label: 'Gas Tracker',href: '/data/onchain/gas' },
    ],
  },

  // ── 6. Scaling ──────────────────────────────────────────────────────────
  {
    label: 'Scaling',
    icon: 'ArrowsPointingOutIcon',
    basePath: '/data/scaling',
    children: [
      { label: 'Overview',          href: '/data/scaling' },
      { label: 'L2 Comparison',     href: '/data/scaling/l2-comparison' },
      { label: 'L1: EVM Chains',    href: '/data/scaling/l1-evm' },
      { label: 'L1: Non-EVM',       href: '/data/scaling/l1-non-evm' },
      { label: 'Optimistic Rollups',href: '/data/scaling/optimistic' },
      { label: 'ZK Rollups',        href: '/data/scaling/zk' },
      { label: 'Data Availability', href: '/data/scaling/data-availability' },
    ],
  },

  // ── 7. DeFi ─────────────────────────────────────────────────────────────
  {
    label: 'DeFi',
    icon: 'CircleStackIcon',
    basePath: '/data/defi',
    children: [
      { label: 'DEX Volume',        href: '/data/defi/dex-volume' },
      { label: 'TVL Rankings',      href: '/data/defi/tvl' },
      { label: 'Protocol Revenue',  href: '/data/defi/revenue' },
      { label: 'Yields',            href: '/data/defi/yields' },
      { label: 'Lending',           href: '/data/defi/lending' },
      { label: 'Restaking',         href: '/data/defi/restaking' },
      { label: 'Launchpads',        href: '/data/defi/launchpads' },
      { label: 'Prediction Markets',href: '/data/defi/prediction' },
      { label: 'Derivatives',       href: '/data/defi/derivatives' },
      { label: 'RWA',               href: '/data/defi/rwa' },
      { label: 'Exploits',          href: '/data/defi/exploits' },
      { label: 'Social (DeSo)',     href: '/data/defi/social' },
      { label: '🐋 Whale Watch',    href: '/data/defi/whale-watch' },
      { label: 'Large Swaps',       href: '/data/defi/large-swaps' },
    ],
  },

  // ── 8. NFTs ─────────────────────────────────────────────────────────────
  {
    label: 'NFTs',
    icon: 'PhotoIcon',
    basePath: '/data/nfts',
    children: [
      { label: 'Sales Volume',    href: '/data/nfts/volume' },
      { label: 'Top Collections', href: '/data/nfts/collections' },
      { label: 'Art & Collectibles',href: '/data/nfts/art' },
      { label: 'Gaming',          href: '/data/nfts/gaming' },
      { label: 'Marketplaces',    href: '/data/nfts/marketplaces' },
    ],
  },

  // ── 9. Alternative Metrics ───────────────────────────────────────────────
  {
    label: 'Alternative',
    icon: 'BeakerIcon',
    basePath: '/data/alternative',
    children: [
      { label: 'Venture Funding', href: '/data/alternative/funding' },
      { label: 'Politics',        href: '/data/alternative/politics' },
      { label: 'Web Traffic',     href: '/data/alternative/web-traffic' },
      { label: 'App Usage',       href: '/data/alternative/app-usage' },
      { label: 'Social Metrics',  href: '/data/alternative/social' },
    ],
  },
];
