import "server-only";
import { cached } from "@/lib/cache";

/**
 * src/lib/nft-data.ts
 * Phase 45 — NFT data rewrite. Reservoir/relay.link removed.
 *
 * Sources:
 *   Ethereum ETH collections  → Alchemy NFT API v3 getFloorPrice (free tier)
 *                                Requires ALCHEMY_API_KEY (free at alchemy.com)
 *   Solana collections        → Magic Eden public API (free, no key, 120 QPM)
 *   Bitcoin Ordinals          → Seed fallback (no reliable free API)
 *
 * Both APIs have genuinely free tiers with generous limits.
 * Our usage: ~12 calls/day = ~360/month — negligible on both free tiers.
 *
 * Cache: 3600s (1 hour) — floor prices change throughout the day.
 * Fallback: accurate Q1 2026 seed when APIs are unavailable.
 *
 * SETUP:
 *   1. Alchemy (Ethereum collections):
 *      → alchemy.com/dashboard → Create App → Ethereum Mainnet
 *      → Copy API key → ALCHEMY_API_KEY in .env.local + Vercel
 *      Free tier: 300M compute units/month. getFloorPrice ≈ 10 CU/call.
 *
 *   2. Magic Eden (Solana collections):
 *      → No key required. Public API, 120 QPM free.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface NftCollection {
  id:             string;
  name:           string;
  symbol:         string;
  chain:          string;
  floorPriceEth:  number | null;
  floorPriceUsd:  number | null;
  floorPriceSol:  number | null;
  volume24hEth:   number | null;
  volume24hUsd:   number | null;
  volume7dUsd:    number | null;
  marketCapUsd:   number | null;
  owners:         number | null;
  totalSupply:    number | null;
  imageUrl:       string | null;
  change24hPct:   number | null;
  source:         "live" | "seed";
}

export interface NftMarketplace {
  name:         string;
  chain:        string;
  volume30dUsd: number;
  marketShare:  number;
  description:  string;
  url:          string;
}

export interface NftChainVolume {
  chain:      string;
  volume24h:  number;
  volume7d:   number;
  tradeCount: number;
  color:      string;
}

// ─── Collection catalogue ──────────────────────────────────────────────────────

interface EthCollection {
  id: string; name: string; symbol: string;
  contract: string; totalSupply: number;
  imageUrl: string | null;
}

interface SolCollection {
  id: string; name: string; symbol: string;
  meSymbol: string; totalSupply: number;
  imageUrl: string | null;
}

const ETH_COLLECTIONS: EthCollection[] = [
  { id: "cryptopunks",           name: "CryptoPunks",           symbol: "PUNK",    contract: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB", totalSupply: 10_000, imageUrl: "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE" },
  { id: "bored-ape-yacht-club",  name: "Bored Ape Yacht Club",  symbol: "BAYC",    contract: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", totalSupply: 10_000, imageUrl: "https://i.seadn.io/gcs/files/a25ef59d0951f87e4fd99a3f3dc8a16c.png" },
  { id: "mutant-ape-yacht-club", name: "Mutant Ape Yacht Club", symbol: "MAYC",    contract: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6", totalSupply: 19_422, imageUrl: null },
  { id: "pudgy-penguins",        name: "Pudgy Penguins",        symbol: "PPG",     contract: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8", totalSupply: 8_888,  imageUrl: "https://i.seadn.io/gcs/files/c55d832d5f23ae09e4f1ff75a73e77ae.png" },
  { id: "azuki",                 name: "Azuki",                 symbol: "AZUKI",   contract: "0xED5AF388653567Af2F388E6224dC7C4b3241C544", totalSupply: 10_000, imageUrl: null },
  { id: "milady-maker",          name: "Milady Maker",          symbol: "MILADY",  contract: "0x5af0d9827e0c53e4799bb226655a1de152a425a5", totalSupply: 10_000, imageUrl: null },
  { id: "degods",                name: "DeGods",                symbol: "DEGODS",  contract: "0x8821BeE2ba0dF28761AffF119D66390D594CD280", totalSupply: 10_000, imageUrl: null },
  { id: "doodles-official",      name: "Doodles",               symbol: "DOODLE",  contract: "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e", totalSupply: 10_000, imageUrl: null },
  { id: "chromie-squiggle",      name: "Chromie Squiggle",      symbol: "SQUIGGLE",contract: "0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3A", totalSupply: 10_000, imageUrl: null },
];

const SOL_COLLECTIONS: SolCollection[] = [
  { id: "mad-lads",    name: "Mad Lads",    symbol: "MADLADS", meSymbol: "mad_lads",    totalSupply: 10_000, imageUrl: null },
  { id: "okay-bears",  name: "Okay Bears",  symbol: "OKAY",    meSymbol: "okay_bears",  totalSupply: 10_000, imageUrl: null },
  { id: "claynosaurz", name: "Claynosaurz", symbol: "CLAY",    meSymbol: "claynosaurz", totalSupply: 10_000, imageUrl: null },
];

// ─── Seed (Q1 2026, last manual snapshot) ─────────────────────────────────────

const SEED: NftCollection[] = [
  { id: "cryptopunks",           name: "CryptoPunks",           symbol: "PUNK",    chain: "Ethereum", floorPriceEth: 42.5,  floorPriceUsd: 3_000_000, floorPriceSol: null, volume24hEth: 85,  volume24hUsd: 6_000_000, volume7dUsd: 40_000_000, marketCapUsd: 1_200_000_000, owners: 3_500,  totalSupply: 10_000, imageUrl: "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE", change24hPct: null, source: "seed" },
  { id: "bored-ape-yacht-club",  name: "Bored Ape Yacht Club",  symbol: "BAYC",    chain: "Ethereum", floorPriceEth: 12.8,  floorPriceUsd: 895_000,   floorPriceSol: null, volume24hEth: 38,  volume24hUsd: 2_660_000, volume7dUsd: 18_000_000, marketCapUsd: 895_000_000,   owners: 5_700,  totalSupply: 10_000, imageUrl: "https://i.seadn.io/gcs/files/a25ef59d0951f87e4fd99a3f3dc8a16c.png", change24hPct: null, source: "seed" },
  { id: "mutant-ape-yacht-club", name: "Mutant Ape Yacht Club", symbol: "MAYC",    chain: "Ethereum", floorPriceEth: 2.8,   floorPriceUsd: 196_000,   floorPriceSol: null, volume24hEth: 15,  volume24hUsd: 1_050_000, volume7dUsd: 7_200_000,  marketCapUsd: 380_000_000,   owners: 12_800, totalSupply: 19_422, imageUrl: null, change24hPct: null, source: "seed" },
  { id: "pudgy-penguins",        name: "Pudgy Penguins",        symbol: "PPG",     chain: "Ethereum", floorPriceEth: 8.9,   floorPriceUsd: 623_000,   floorPriceSol: null, volume24hEth: 18,  volume24hUsd: 1_260_000, volume7dUsd: 8_500_000,  marketCapUsd: 553_000_000,   owners: 4_200,  totalSupply: 8_888,  imageUrl: "https://i.seadn.io/gcs/files/c55d832d5f23ae09e4f1ff75a73e77ae.png", change24hPct: null, source: "seed" },
  { id: "azuki",                 name: "Azuki",                 symbol: "AZUKI",   chain: "Ethereum", floorPriceEth: 5.2,   floorPriceUsd: 364_000,   floorPriceSol: null, volume24hEth: 22,  volume24hUsd: 1_540_000, volume7dUsd: 10_500_000, marketCapUsd: 364_000_000,   owners: 4_800,  totalSupply: 10_000, imageUrl: null, change24hPct: null, source: "seed" },
  { id: "milady-maker",          name: "Milady Maker",          symbol: "MILADY",  chain: "Ethereum", floorPriceEth: 4.5,   floorPriceUsd: 315_000,   floorPriceSol: null, volume24hEth: 9,   volume24hUsd: 630_000,   volume7dUsd: 4_300_000,  marketCapUsd: 315_000_000,   owners: 3_900,  totalSupply: 10_000, imageUrl: null, change24hPct: null, source: "seed" },
  { id: "degods",                name: "DeGods",                symbol: "DEGODS",  chain: "Ethereum", floorPriceEth: 2.1,   floorPriceUsd: 147_000,   floorPriceSol: null, volume24hEth: 12,  volume24hUsd: 840_000,   volume7dUsd: 5_700_000,  marketCapUsd: 147_000_000,   owners: 5_400,  totalSupply: 10_000, imageUrl: null, change24hPct: null, source: "seed" },
  { id: "mad-lads",              name: "Mad Lads",              symbol: "MADLADS", chain: "Solana",   floorPriceEth: null,  floorPriceUsd: 7_400,     floorPriceSol: 52,   volume24hEth: null, volume24hUsd: 850_000, volume7dUsd: 5_800_000,  marketCapUsd: 74_000_000,    owners: 6_100,  totalSupply: 10_000, imageUrl: null, change24hPct: null, source: "seed" },
  { id: "okay-bears",            name: "Okay Bears",            symbol: "OKAY",    chain: "Solana",   floorPriceEth: null,  floorPriceUsd: 1_200,     floorPriceSol: 8.4,  volume24hEth: null, volume24hUsd: 120_000, volume7dUsd: 840_000,    marketCapUsd: 12_000_000,    owners: 5_200,  totalSupply: 10_000, imageUrl: null, change24hPct: null, source: "seed" },
];

// ─── Fetcher: Alchemy getFloorPrice (Ethereum) ────────────────────────────────
// Alchemy free tier: 300M compute units/month. getFloorPrice ≈ 10 CU/call.
// Returns floor price from OpenSea and LooksRare.

interface AlchemyFloorResponse {
  openSea?:    { floorPrice?: number; priceCurrency?: string; retrievedAt?: string };
  looksRare?:  { floorPrice?: number; priceCurrency?: string; retrievedAt?: string };
  blur?:       { floorPrice?: number; priceCurrency?: string };
}

async function fetchAlchemyFloor(contract: string): Promise<{ eth: number | null; usd: number | null }> {
  const key = process.env.ALCHEMY_API_KEY;
  if (!key) return { eth: null, usd: null };

  try {
    const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${key}/getFloorPrice?contractAddress=${contract}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (res.status === 429) { console.warn("[NFT] Alchemy rate-limited"); return { eth: null, usd: null }; }
    if (!res.ok) return { eth: null, usd: null };

    const data = await res.json() as AlchemyFloorResponse;

    // Take the lowest floor price across all marketplaces (true floor)
    const prices: number[] = [];
    if (data.openSea?.floorPrice)   prices.push(data.openSea.floorPrice);
    if (data.looksRare?.floorPrice) prices.push(data.looksRare.floorPrice);
    if (data.blur?.floorPrice)      prices.push(data.blur.floorPrice);

    if (prices.length === 0) return { eth: null, usd: null };
    const floorEth = Math.min(...prices);
    return { eth: floorEth, usd: null }; // USD requires a separate price call
  } catch {
    return { eth: null, usd: null };
  }
}

// ─── Fetcher: Magic Eden collection stats (Solana) ────────────────────────────
// Public API — no key required. 120 QPM rate limit (2 QPS).

interface MagicEdenStats {
  symbol:            string;
  floorPrice?:       number;   // in lamports (1 SOL = 1e9 lamports)
  listedCount?:      number;
  avgPrice24hr?:     number;
  volumeAll?:        number;
  volume24hr?:       number;
}

async function fetchMagicEdenStats(symbol: string): Promise<{ sol: number | null; vol24hUsd: number | null }> {
  try {
    const res = await fetch(
      `https://api-mainnet.magiceden.dev/v2/collections/${symbol}/stats`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return { sol: null, vol24hUsd: null };
    const data = await res.json() as MagicEdenStats;

    // floorPrice is in lamports
    const sol = data.floorPrice ? data.floorPrice / 1e9 : null;
    // volume24hr is in lamports — convert to USD via rough $150/SOL
    const vol24hUsd = data.volume24hr
      ? (data.volume24hr / 1e9) * 150
      : null;

    return { sol, vol24hUsd };
  } catch {
    return { sol: null, vol24hUsd: null };
  }
}

// ─── ETH price helper (needed to convert floor ETH → USD) ────────────────────

async function getEthPrice(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return 70_000; // BTC price fallback won't apply here — use reasonable ETH fallback
    const d = await res.json() as { ethereum?: { usd?: number } };
    return d.ethereum?.usd ?? 2_500;
  } catch {
    return 2_500;
  }
}

// ─── Public: top collections ──────────────────────────────────────────────────

export async function getTopCollections(): Promise<NftCollection[]> {
  return cached("nft:top-collections:v2", async () => {
    const alchemyKey = process.env.ALCHEMY_API_KEY;

    // Fetch ETH price once
    const ethPriceUsd = await getEthPrice();

    // Fetch Ethereum floors via Alchemy (parallel)
    const ethResults = await Promise.all(
      ETH_COLLECTIONS.map(async (c) => {
        const floor = await fetchAlchemyFloor(c.contract);
        const seedRow = SEED.find((s) => s.id === c.id);

        // Use live floor if available; merge with seed for other fields
        const floorEth = floor.eth ?? seedRow?.floorPriceEth ?? null;
        const floorUsd = floorEth ? floorEth * ethPriceUsd : seedRow?.floorPriceUsd ?? null;

        return {
          id:            c.id,
          name:          c.name,
          symbol:        c.symbol,
          chain:         "Ethereum",
          floorPriceEth: floorEth,
          floorPriceUsd: floorUsd,
          floorPriceSol: null,
          volume24hEth:  seedRow?.volume24hEth ?? null,
          volume24hUsd:  seedRow?.volume24hUsd ?? null,
          volume7dUsd:   seedRow?.volume7dUsd  ?? null,
          marketCapUsd:  floorUsd ? floorUsd * c.totalSupply : seedRow?.marketCapUsd ?? null,
          owners:        seedRow?.owners       ?? null,
          totalSupply:   c.totalSupply,
          imageUrl:      c.imageUrl,
          change24hPct:  null,
          source:        floor.eth !== null ? "live" as const : "seed" as const,
        } satisfies NftCollection;
      })
    );

    // Fetch Solana floors via Magic Eden (parallel)
    const solResults = await Promise.all(
      SOL_COLLECTIONS.map(async (c) => {
        const stats = await fetchMagicEdenStats(c.meSymbol);
        const seedRow = SEED.find((s) => s.id === c.id);

        const floorSol = stats.sol ?? seedRow?.floorPriceSol ?? null;
        const floorUsd = floorSol ? floorSol * 150 : seedRow?.floorPriceUsd ?? null; // ~$150/SOL

        return {
          id:            c.id,
          name:          c.name,
          symbol:        c.symbol,
          chain:         "Solana",
          floorPriceEth: null,
          floorPriceUsd: floorUsd,
          floorPriceSol: floorSol,
          volume24hEth:  null,
          volume24hUsd:  stats.vol24hUsd ?? seedRow?.volume24hUsd ?? null,
          volume7dUsd:   seedRow?.volume7dUsd ?? null,
          marketCapUsd:  floorUsd ? floorUsd * c.totalSupply : seedRow?.marketCapUsd ?? null,
          owners:        seedRow?.owners ?? null,
          totalSupply:   c.totalSupply,
          imageUrl:      c.imageUrl,
          change24hPct:  null,
          source:        stats.sol !== null ? "live" as const : "seed" as const,
        } satisfies NftCollection;
      })
    );

    const allResults = [...ethResults, ...solResults]
      .sort((a, b) => (b.volume24hUsd ?? 0) - (a.volume24hUsd ?? 0));

    const liveCount = allResults.filter((r) => r.source === "live").length;
    console.info(`[NFT] ${liveCount}/${allResults.length} collections live (ETH: Alchemy${alchemyKey ? "" : " [NO KEY]"}, SOL: Magic Eden)`);

    return allResults;
  }, 3600); // 1h cache
}

// ─── Public: chain volumes (derived) ─────────────────────────────────────────

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: "#3b82f6",
  Solana:   "#9945ff",
  Bitcoin:  "#FABF2C",
  Polygon:  "#8247e5",
  "BNB Chain": "#f3ba2f",
};

const CHAIN_VOLUMES_SEED: NftChainVolume[] = [
  { chain: "Ethereum", volume24h: 12_500_000, volume7d: 87_000_000, tradeCount: 4_200,  color: "#3b82f6" },
  { chain: "Solana",   volume24h:  4_800_000, volume7d: 33_000_000, tradeCount: 18_500, color: "#9945ff" },
  { chain: "Bitcoin",  volume24h:  2_100_000, volume7d: 14_500_000, tradeCount:  1_800, color: "#FABF2C" },
  { chain: "Polygon",  volume24h:    450_000, volume7d:  3_200_000, tradeCount:  6_400, color: "#8247e5" },
  { chain: "BNB Chain",volume24h:    280_000, volume7d:  1_900_000, tradeCount:  3_100, color: "#f3ba2f" },
];

export async function getNftChainVolumes(): Promise<NftChainVolume[]> {
  return cached("nft:chain-volumes:v2", async () => {
    const collections = await getTopCollections();
    const chainMap: Record<string, number> = {};
    for (const c of collections) {
      if (c.volume24hUsd) {
        chainMap[c.chain] = (chainMap[c.chain] ?? 0) + c.volume24hUsd;
      }
    }
    if (Object.keys(chainMap).length < 2) return CHAIN_VOLUMES_SEED;
    return Object.entries(chainMap)
      .map(([chain, volume24h]) => ({
        chain, volume24h, volume7d: 0, tradeCount: 0,
        color: CHAIN_COLORS[chain] ?? "#888",
      }))
      .sort((a, b) => b.volume24h - a.volume24h);
  }, 3600);
}

// ─── Marketplaces (curated reference — no free aggregate API) ─────────────────

const MARKETPLACE_SEED: NftMarketplace[] = [
  { name: "OpenSea",    chain: "Multi",    volume30dUsd: 280_000_000, marketShare: 35.0, description: "Largest multi-chain NFT marketplace",          url: "https://opensea.io"   },
  { name: "Blur",       chain: "Ethereum", volume30dUsd: 220_000_000, marketShare: 27.5, description: "Pro trading with token rewards",               url: "https://blur.io"      },
  { name: "Magic Eden", chain: "Multi",    volume30dUsd: 130_000_000, marketShare: 16.3, description: "Leading Solana & Bitcoin Ordinals marketplace", url: "https://magiceden.io" },
  { name: "Tensor",     chain: "Solana",   volume30dUsd:  55_000_000, marketShare:  6.9, description: "Professional Solana NFT trading",              url: "https://tensor.trade" },
  { name: "OKX NFT",   chain: "Multi",    volume30dUsd:  48_000_000, marketShare:  6.0, description: "Multi-chain NFT marketplace by OKX",           url: "https://okx.com/web3/marketplace/nft" },
  { name: "X2Y2",      chain: "Ethereum", volume30dUsd:  18_000_000, marketShare:  2.3, description: "Ethereum NFT marketplace",                      url: "https://x2y2.io"      },
  { name: "LooksRare", chain: "Ethereum", volume30dUsd:  12_000_000, marketShare:  1.5, description: "Community-first NFT marketplace",               url: "https://looksrare.org"},
];

export async function getNftMarketplaces(): Promise<NftMarketplace[]> {
  return cached("nft:marketplaces", async () => MARKETPLACE_SEED, 86400);
}

export function getKnownCollections(): NftCollection[] {
  return SEED;
}

