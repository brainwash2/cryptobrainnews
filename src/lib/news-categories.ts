// Pure constants — no server imports. Safe to use in Client Components.
export const NEWS_CATEGORIES = [
  { slug: 'market',     label: 'Markets' },
  { slug: 'bitcoin',    label: 'Bitcoin' },
  { slug: 'ethereum',   label: 'Ethereum' },
  { slug: 'defi',       label: 'DeFi' },
  { slug: 'nft',        label: 'NFTs' },
  { slug: 'regulation', label: 'Regulation' },
  { slug: 'research',   label: 'Research' },
  { slug: 'layer2',     label: 'Layer 2' },
] as const;

export type CategorySlug = (typeof NEWS_CATEGORIES)[number]['slug'];
