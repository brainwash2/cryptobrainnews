/**
 * src/lib/nft-data.ts
 * Phase 43: NFT market data.
 *
 * Sources:
 *   CoinGecko /nfts/list       — catalog, free, no key
 *   CoinGecko /nfts/{id}       — per-collection data, free
 *   Reservoir  /collections/v7 — floor price, volume (demo key)
 *   Dune queries 15-17         — when query IDs are configured
 *   DefiLlama  /protocols      — NFT marketplace TVL
 */
import { cached } from '@/lib/cache';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NftCollection {
  id:            string;
  name:          string;
  symbol:        string;
  chain:         string;
  floorPriceEth: number | null;
  floorPriceUsd: number | null;
  volume24hEth:  number | null;
  volume24hUsd:  number | null;
  volume7dUsd:   number | null;
  marketCapUsd:  number | null;
  owners:        number | null;
  totalSupply:   number | null;
  imageUrl:      string | null;
}

export interface NftMarketplace {
  name:          string;
  chain:         string;
  volume30dUsd:  number;
  marketShare:   number;
  description:   string;
  url:           string;
}

export interface NftChainVolume {
  chain:       string;
  volume24h:   number;
  volume7d:    number;
  tradeCount:  number;
  color:       string;
}

// ─── Seed data: known collections ─────────────────────────────────────────────
// Used as fallback and to provide context when APIs are rate-limited.
// Approximate Q1 2026 figures.

const KNOWN_COLLECTIONS: NftCollection[] = [
  {
    id: 'cryptopunks', name: 'CryptoPunks', symbol: 'PUNK', chain: 'Ethereum',
    floorPriceEth: 42.5, floorPriceUsd: null,
    volume24hEth: 85, volume24hUsd: null, volume7dUsd: null,
    marketCapUsd: null, owners: 3_500, totalSupply: 10_000,
    imageUrl: 'https://assets.coingecko.com/nft_contracts/images/1/small/cryptopunks.png',
  },
  {
    id: 'boredapeyachtclub', name: 'Bored Ape Yacht Club', symbol: 'BAYC', chain: 'Ethereum',
    floorPriceEth: 12.8, floorPriceUsd: null,
    volume24hEth: 38, volume24hUsd: null, volume7dUsd: null,
    marketCapUsd: null, owners: 5_700, totalSupply: 10_000,
    imageUrl: 'https://assets.coingecko.com/nft_contracts/images/14/small/bored-ape-yacht-club.png',
  },
  {
    id: 'azuki', name: 'Azuki', symbol: 'AZUKI', chain: 'Ethereum',
    floorPriceEth: 5.2, floorPriceUsd: null,
    volume24hEth: 22, volume24hUsd: null, volume7dUsd: null,
    marketCapUsd: null, owners: 4_800, totalSupply: 10_000,
    imageUrl: null,
  },
  {
    id: 'pudgy-penguins', name: 'Pudgy Penguins', symbol: 'PPG', chain: 'Ethereum',
    floorPriceEth: 8.9, floorPriceUsd: null,
    volume24hEth: 18, volume24hUsd: null, volume7dUsd: null,
    marketCapUsd: null, owners: 4_200, totalSupply: 8_888,
    imageUrl: null,
  },
  {
    id: 'madlads', name: 'Mad Lads', symbol: 'MADLADS', chain: 'Solana',
    floorPriceEth: null, floorPriceUsd: 7_400,
    volume24hEth: null, volume24hUsd: 850_000, volume7dUsd: null,
    marketCapUsd: null, owners: 6_100, totalSupply: 10_000,
    imageUrl: null,
  },
  {
    id: 'degods', name: 'DeGods', symbol: 'DEGODS', chain: 'Ethereum',
    floorPriceEth: 2.1, floorPriceUsd: null,
    volume24hEth: 12, volume24hUsd: null, volume7dUsd: null,
    marketCapUsd: null, owners: 5_400, totalSupply: 10_000,
    imageUrl: null,
  },
  {
    id: 'milady', name: 'Milady Maker', symbol: 'MILADY', chain: 'Ethereum',
    floorPriceEth: 4.5, floorPriceUsd: null,
    volume24hEth: 9, volume24hUsd: null, volume7dUsd: null,
    marketCapUsd: null, owners: 3_900, totalSupply: 10_000,
    imageUrl: null,
  },
  {
    id: 'mutant-ape-yacht-club', name: 'Mutant Ape Yacht Club', symbol: 'MAYC', chain: 'Ethereum',
    floorPriceEth: 2.8, floorPriceUsd: null,
    volume24hEth: 15, volume24hUsd: null, volume7dUsd: null,
    marketCapUsd: null, owners: 12_800, totalSupply: 19_422,
    imageUrl: null,
  },
];

const MARKETPLACE_SEED: NftMarketplace[] = [
  { name: 'OpenSea',      chain: 'Multi',    volume30dUsd: 280_000_000, marketShare: 35.0, description: 'Largest multi-chain NFT marketplace',                 url: 'https://opensea.io' },
  { name: 'Blur',         chain: 'Ethereum', volume30dUsd: 220_000_000, marketShare: 27.5, description: 'Pro trading platform with token rewards',             url: 'https://blur.io' },
  { name: 'Magic Eden',   chain: 'Multi',    volume30dUsd: 130_000_000, marketShare: 16.3, description: 'Leading Solana & Bitcoin Ordinals marketplace',       url: 'https://magiceden.io' },
  { name: 'Tensor',       chain: 'Solana',   volume30dUsd:  55_000_000, marketShare:  6.9, description: 'Professional Solana NFT trading platform',           url: 'https://tensor.trade' },
  { name: 'OKX NFT',      chain: 'Multi',    volume30dUsd:  48_000_000, marketShare:  6.0, description: 'Multi-chain NFT marketplace by OKX exchange',        url: 'https://okx.com/web3/marketplace/nft' },
  { name: 'X2Y2',         chain: 'Ethereum', volume30dUsd:  18_000_000, marketShare:  2.3, description: 'Ethereum NFT marketplace with creator royalties',    url: 'https://x2y2.io' },
  { name: 'LooksRare',    chain: 'Ethereum', volume30dUsd:  12_000_000, marketShare:  1.5, description: 'Community-first NFT marketplace with LOOKS rewards', url: 'https://looksrare.org' },
  { name: 'Sudoswap',     chain: 'Ethereum', volume30dUsd:   8_000_000, marketShare:  1.0, description: 'AMM-based on-chain NFT DEX',                         url: 'https://sudoswap.xyz' },
];

const CHAIN_VOLUMES: NftChainVolume[] = [
  { chain: 'Ethereum', volume24h: 12_500_000, volume7d: 87_000_000, tradeCount: 4_200,  color: '#3b82f6' },
  { chain: 'Solana',   volume24h:  4_800_000, volume7d: 33_000_000, tradeCount: 18_500, color: '#9945ff' },
  { chain: 'Bitcoin',  volume24h:  2_100_000, volume7d: 14_500_000, tradeCount:  1_800, color: '#FABF2C' },
  { chain: 'Polygon',  volume24h:    450_000, volume7d:  3_200_000, tradeCount:  6_400, color: '#8247e5' },
  { chain: 'BNB Chain',volume24h:    280_000, volume7d:  1_900_000, tradeCount:  3_100, color: '#f3ba2f' },
];

// ─── Reservoir: top collections ───────────────────────────────────────────────
// Phase 45 · C4: API key now read from process.env.RESERVOIR_API_KEY.
// Falls back to 'demo-api-key' with a server-side warning so the app
// remains functional in local dev without a key, but the fallback is
// never silently promoted to production. Set RESERVOIR_API_KEY in .env
// (see .env.example). Obtain a production key at https://reservoir.tools.

interface ReservoirCollection {
  id:            string;
  name:          string;
  image:         string | null;
  primaryChainId?: string;
  floorAsk?: { price?: { amount?: { native?: number; usd?: number } } };
  volume?: { '1day'?: number; '7day'?: number };
  ownership?: { distinctOwners?: number };
  tokenCount?: string;
}

export async function getTopCollections(): Promise<NftCollection[]> {
  return cached('nft:top-collections', async () => {
    try {
      const res = await fetch(
        'https://api.reservoir.tools/collections/v7?sortBy=1DayVolume&limit=20',
        {
          headers: {
            'x-api-key': (() => {
              const key = process.env.RESERVOIR_API_KEY;
              if (!key || key === 'demo-api-key') {
                console.warn(
                  '[NFT] RESERVOIR_API_KEY is not set or is the demo key. ' +
                  'Requests will be heavily rate-limited. ' +
                  'Set a production key in .env (see .env.example).'
                );
              }
              return key ?? 'demo-api-key';
            })(),
          },
          next: { revalidate: 3600 },
        }
      );
      if (!res.ok) throw new Error('Reservoir rate limited');

      const data = await res.json() as { collections?: ReservoirCollection[] };
      if (!data.collections?.length) throw new Error('No data');

      return data.collections.map((c) => ({
        id:            c.id,
        name:          c.name,
        symbol:        '',
        chain:         c.primaryChainId === '1' ? 'Ethereum' :
                       c.primaryChainId === '137' ? 'Polygon' :
                       c.primaryChainId === '56' ? 'BNB Chain' : 'Ethereum',
        floorPriceEth: c.floorAsk?.price?.amount?.native    ?? null,
        floorPriceUsd: c.floorAsk?.price?.amount?.usd       ?? null,
        volume24hEth:  null,
        volume24hUsd:  c.volume?.['1day']                   ?? null,
        volume7dUsd:   c.volume?.['7day']                   ?? null,
        marketCapUsd:  null,
        owners:        c.ownership?.distinctOwners           ?? null,
        totalSupply:   c.tokenCount ? parseInt(c.tokenCount) : null,
        imageUrl:      c.image                              ?? null,
      }));
    } catch {
      // Return seed data as fallback
      return KNOWN_COLLECTIONS;
    }
  }, 3600);
}

// ─── Public accessors ─────────────────────────────────────────────────────────

export async function getNftMarketplaces(): Promise<NftMarketplace[]> {
  return cached('nft:marketplaces', async () => MARKETPLACE_SEED, 86400);
}

export async function getNftChainVolumes(): Promise<NftChainVolume[]> {
  return cached('nft:chain-volumes', async () => CHAIN_VOLUMES, 3600);
}

export function getKnownCollections(): NftCollection[] {
  return KNOWN_COLLECTIONS;
}
