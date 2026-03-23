/**
 * src/lib/scaling-data.ts
 * Phase 41: Scaling solutions data from DefiLlama.
 *
 * All data comes from DefiLlama public endpoints — no API key required.
 * Chain names must match DefiLlama's identifier exactly (case-sensitive).
 *
 * TVL history per chain: /v2/historicalChainTvl/{chain}
 * All chains summary:    /v2/chains
 * Protocol fees:         /overview/fees
 */
import { cached } from '@/lib/cache';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScalingChain {
  name:        string;
  slug:        string;         // DefiLlama chain identifier
  type:        'optimistic' | 'zk' | 'l1-evm' | 'l1-non-evm' | 'validium' | 'da';
  tvl:         number;
  change1d:    number | null;
  change7d:    number | null;
  protocols:   number | null;
  color:       string;
  description: string;
}

export interface TvlPoint {
  date: string;
  tvl:  number;
}

interface DefiLlamaChain {
  name:      string;
  tvl:       number;
  change_1d: number | null;
  change_7d: number | null;
  protocols: number | null;
}

// ─── Chain catalogue ─────────────────────────────────────────────────────────

const OPTIMISTIC_CHAINS = [
  { name: 'Arbitrum',    slug: 'Arbitrum',    color: '#3b82f6', description: 'Nitro-powered optimistic rollup, largest L2 by TVL' },
  { name: 'OP Mainnet',  slug: 'Optimism',    color: '#ef4444', description: 'Bedrock-upgraded Optimism mainnet, OP Stack base layer' },
  { name: 'Base',        slug: 'Base',        color: '#0052ff', description: 'Coinbase L2 on OP Stack, fast-growing consumer chain' },
  { name: 'Blast',       slug: 'Blast',       color: '#fcfc03', description: 'Native yield-bearing optimistic rollup by Blur team' },
  { name: 'Mantle',      slug: 'Mantle',      color: '#00d1d1', description: 'Modular L2 with EigenLayer data availability' },
  { name: 'Mode',        slug: 'Mode',        color: '#dffe00', description: 'OP Stack L2 with DeFi-native sequencer rewards' },
];

const ZK_CHAINS = [
  { name: 'zkSync Era',     slug: 'zkSync Era',        color: '#8b5cf6', description: 'ZK-EVM by Matter Labs, EVM-compatible native account abstraction' },
  { name: 'Starknet',       slug: 'Starknet',          color: '#ec4899', description: 'STARK-based ZK rollup using Cairo VM, high throughput' },
  { name: 'Scroll',         slug: 'Scroll',            color: '#f97316', description: 'EVM-equivalent ZK rollup with bytecode compatibility' },
  { name: 'Linea',          slug: 'Linea',             color: '#6366f1', description: 'ConsenSys ZK-EVM, deep MetaMask and Infura integration' },
  { name: 'Polygon zkEVM',  slug: 'Polygon zkEVM',     color: '#7c3aed', description: 'Polygon\'s EVM-equivalent ZK rollup, CDK framework' },
  { name: 'Manta Pacific',  slug: 'Manta Pacific',     color: '#06b6d4', description: 'Modular ZK L2 with Celestia data availability' },
];

const L1_EVM_CHAINS = [
  { name: 'Ethereum',   slug: 'Ethereum',  color: '#3b82f6', description: 'Proof-of-Stake L1, largest smart contract platform' },
  { name: 'BNB Chain',  slug: 'BSC',       color: '#f3ba2f', description: 'Binance-operated EVM chain, high throughput low fees' },
  { name: 'Polygon',    slug: 'Polygon',   color: '#8247e5', description: 'PoS commit chain and zkEVM L2 ecosystem' },
  { name: 'Avalanche',  slug: 'Avalanche', color: '#e84142', description: 'Subnet architecture, sub-second finality' },
  { name: 'Cronos',     slug: 'Cronos',    color: '#002d74', description: 'Crypto.com EVM chain with IBC connectivity' },
  { name: 'Fantom',     slug: 'Fantom',    color: '#1969ff', description: 'DAG-based Lachesis consensus, migrating to Sonic' },
  { name: 'Gnosis',     slug: 'Gnosis',    color: '#04795b', description: 'Community-owned PoS chain, xDAI stable transactions' },
  { name: 'Celo',       slug: 'Celo',      color: '#35d07f', description: 'Mobile-first EVM chain, migrating to L2 on OP Stack' },
  { name: 'Moonbeam',   slug: 'Moonbeam',  color: '#53cbc9', description: 'Polkadot parachain with full EVM compatibility' },
  { name: 'Metis',      slug: 'Metis',     color: '#00dacc', description: 'Hybrid optimistic rollup with decentralised sequencer' },
];

const L1_NON_EVM_CHAINS = [
  { name: 'Solana',    slug: 'Solana',    color: '#9945ff', description: 'High-throughput PoH + PoS, ~65K TPS theoretical max' },
  { name: 'Tron',      slug: 'Tron',      color: '#ef4444', description: 'DPoS chain, largest USDT transfer volume globally' },
  { name: 'TON',       slug: 'TON',       color: '#0098ea', description: 'Telegram-integrated, sharded PoS blockchain' },
  { name: 'Cardano',   slug: 'Cardano',   color: '#0033ad', description: 'Academic-driven PoS, UTxO extended model' },
  { name: 'NEAR',      slug: 'Near',      color: '#00c08b', description: 'Sharded PoS with Aurora EVM compatibility' },
  { name: 'Cosmos Hub',slug: 'CosmosHub', color: '#6f7390', description: 'IBC hub, proof-of-stake with ATOM governance' },
  { name: 'Algorand',  slug: 'Algorand',  color: '#00b4d8', description: 'Pure PoS, instant finality, carbon-negative' },
  { name: 'Aptos',     slug: 'Aptos',     color: '#00bfad', description: 'Move VM, parallel execution, Meta-backed team' },
];

// ─── Helper: fetch all chains once and filter ────────────────────────────────

/**
 * Phase 45 · H4 — Slug alias map.
 *
 * DefiLlama sometimes renames chains (e.g. Optimism → OP Mainnet) while our
 * catalogue slugs stay stable. After building the primary name→chain map we
 * inject aliases so that lookups by our catalogue slug always resolve.
 *
 * Key   = our catalogue slug (lowercased)
 * Value = DefiLlama chain name (lowercased) as it appears in /v2/chains
 */
const SLUG_ALIASES: Record<string, string> = {
  'optimism':    'op mainnet',    // DefiLlama renamed Optimism → OP Mainnet
  'cosmoshub':   'cosmos hub',    // Catalogue uses CosmosHub, DefiLlama uses "Cosmos Hub"
  'polygon zkevm': 'polygon zkevm', // Explicit no-op; here for documentation
  'bsc':         'bsc',           // Stable — no rename needed
};

async function getAllChainsMap(): Promise<Map<string, DefiLlamaChain>> {
  return cached('scaling:allchains:map', async () => {
    try {
      const res = await fetch('https://api.llama.fi/v2/chains');
      if (!res.ok) return new Map();
      const data = await res.json() as DefiLlamaChain[];
      const map  = new Map<string, DefiLlamaChain>();

      // Primary index: DefiLlama name → chain data
      data.forEach((c) => map.set(c.name.toLowerCase(), c));

      // Inject aliases: catalogue slug → same chain data as the aliased name
      // This lets map.get('optimism') resolve even when DefiLlama calls it 'op mainnet'
      for (const [catalogueSlug, llamaName] of Object.entries(SLUG_ALIASES)) {
        if (!map.has(catalogueSlug) && map.has(llamaName)) {
          map.set(catalogueSlug, map.get(llamaName)!);
        }
      }

      return map;
    } catch {
      return new Map();
    }
  }, 3600);
}

// ─── Public fetchers ─────────────────────────────────────────────────────────

export async function getOptimisticRollups(): Promise<ScalingChain[]> {
  return cached('scaling:optimistic', async () => {
    const map = await getAllChainsMap();
    return OPTIMISTIC_CHAINS.map((c) => {
      const live = map.get(c.slug.toLowerCase());
      return {
        ...c,
        type:      'optimistic' as const,
        tvl:       live?.tvl       ?? 0,
        change1d:  live?.change_1d ?? null,
        change7d:  live?.change_7d ?? null,
        protocols: live?.protocols ?? null,
      };
    }).sort((a, b) => b.tvl - a.tvl);
  }, 3600);
}

export async function getZkRollups(): Promise<ScalingChain[]> {
  return cached('scaling:zk', async () => {
    const map = await getAllChainsMap();
    return ZK_CHAINS.map((c) => {
      const live = map.get(c.slug.toLowerCase());
      return {
        ...c,
        type:      'zk' as const,
        tvl:       live?.tvl       ?? 0,
        change1d:  live?.change_1d ?? null,
        change7d:  live?.change_7d ?? null,
        protocols: live?.protocols ?? null,
      };
    }).sort((a, b) => b.tvl - a.tvl);
  }, 3600);
}

export async function getL1EvmChains(): Promise<ScalingChain[]> {
  return cached('scaling:l1evm', async () => {
    const map = await getAllChainsMap();
    return L1_EVM_CHAINS.map((c) => {
      const live = map.get(c.slug.toLowerCase());
      return {
        ...c,
        type:      'l1-evm' as const,
        tvl:       live?.tvl       ?? 0,
        change1d:  live?.change_1d ?? null,
        change7d:  live?.change_7d ?? null,
        protocols: live?.protocols ?? null,
      };
    }).sort((a, b) => b.tvl - a.tvl);
  }, 3600);
}

export async function getL1NonEvmChains(): Promise<ScalingChain[]> {
  return cached('scaling:l1nonevm', async () => {
    const map = await getAllChainsMap();
    return L1_NON_EVM_CHAINS.map((c) => {
      const live = map.get(c.slug.toLowerCase());
      return {
        ...c,
        type:      'l1-non-evm' as const,
        tvl:       live?.tvl       ?? 0,
        change1d:  live?.change_1d ?? null,
        change7d:  live?.change_7d ?? null,
        protocols: live?.protocols ?? null,
      };
    }).sort((a, b) => b.tvl - a.tvl);
  }, 3600);
}

// ─── TVL history for a single chain (for sparkline charts) ───────────────────

export async function getChainTvlSeries(
  slug: string,
  days = 90
): Promise<TvlPoint[]> {
  return cached(`scaling:tvl:series:${slug}:${days}`, async () => {
    try {
      const res = await fetch(
        `https://api.llama.fi/v2/historicalChainTvl/${encodeURIComponent(slug)}`
      );
      if (!res.ok) return [];
      const data = await res.json() as Array<{ date: number; tvl: number }>;
      if (!Array.isArray(data)) return [];
      return data.slice(-days).map((d) => ({
        date: new Date(d.date * 1000).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        }),
        tvl: d.tvl,
      }));
    } catch {
      return [];
    }
  }, 3600);
}

// ─── L2 fees from DefiLlama overview/fees ────────────────────────────────────

export interface L2FeeRow {
  name:      string;
  total24h:  number | null;
  total7d:   number | null;
  change_1d: number | null;
}

export async function getL2FeeData(): Promise<L2FeeRow[]> {
  return cached('scaling:l2fees', async () => {
    try {
      const res = await fetch(
        'https://api.llama.fi/overview/fees?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true'
      );
      if (!res.ok) return [];
      const data = await res.json() as {
        protocols?: Array<{
          name: string;
          total24h: number | null;
          total7d:  number | null;
          change_1d: number | null;
          category?: string;
        }>;
      };
      const L2_NAMES = new Set([
        'arbitrum', 'optimism', 'base', 'blast', 'mantle', 'mode',
        'zksync era', 'starknet', 'scroll', 'linea', 'polygon zkevm', 'manta pacific',
      ]);
      return (data.protocols ?? [])
        .filter((p) => L2_NAMES.has(p.name.toLowerCase()))
        .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
        .map((p) => ({
          name:      p.name,
          total24h:  p.total24h,
          total7d:   p.total7d,
          change_1d: p.change_1d,
        }));
    } catch {
      return [];
    }
  }, 3600);
}

// ─── Combined L2 overview (optimistic + ZK merged, sorted by TVL) ─────────────

export async function getAllL2s(): Promise<ScalingChain[]> {
  return cached('scaling:all-l2s', async () => {
    const [opt, zk] = await Promise.all([
      getOptimisticRollups(),
      getZkRollups(),
    ]);
    return [...opt, ...zk].sort((a, b) => b.tvl - a.tvl);
  }, 3600);
}
