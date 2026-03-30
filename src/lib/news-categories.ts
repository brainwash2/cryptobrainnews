// Single source of truth for all news categories.
// Client-safe — zero server imports.
// Updated March 2026 to reflect current market narratives.
export const NEWS_CATEGORIES = [
  // Core categories (existing)
  { slug: 'market',      label: 'Markets' },
  { slug: 'bitcoin',     label: 'Bitcoin' },
  { slug: 'ethereum',    label: 'Ethereum' },
  { slug: 'defi',        label: 'DeFi' },
  { slug: 'nft',         label: 'NFTs' },
  { slug: 'regulation',  label: 'Regulation' },
  { slug: 'research',    label: 'Research' },
  { slug: 'layer2',      label: 'Layer 2' },
  // New March 2026 narrative categories
  { slug: 'rwa',         label: 'RWA' },          // Real-world assets — #1 2026 narrative
  { slug: 'ai-crypto',   label: 'AI × Crypto' },  // DePAI, x402, agent economies
  { slug: 'stablecoins', label: 'Stablecoins' },  // USDC, USDT, yield-bearing stables
  { slug: 'institutional', label: 'Institutional' }, // ETFs, JPMorgan, BlackRock, treasuries
  { slug: 'restaking',   label: 'Restaking' },    // EigenLayer, EtherFi, liquid restaking
  { slug: 'depin',       label: 'DePIN' },        // Helium, Render, decentralized infra
  { slug: 'prediction',  label: 'Prediction' },   // Polymarket, Kalshi, onchain outcomes
  { slug: 'bitcoin-l2',  label: 'Bitcoin L2' },   // Stacks, Lightning, Rootstock, Merlin
] as const;
 
export type CategorySlug = (typeof NEWS_CATEGORIES)[number]['slug'];
