// src/lib/zerion.ts
// Zerion API — free entity‑labelled whale transaction feed.
// Replaces the deprecated Spot On Chain integration (Phase B‑6).
//
// Free tier: 3,000 requests/day, 2 req/sec
// Sign‑up: https://dashboard.zerion.io/ → instant free developer key
// Auth: Bearer token (ZERION_API_KEY)
// Cache TTL: 1 hour (whale data is slow‑moving)
import 'server-only';
import { cached } from '@/lib/cache';

const ZERION_API = 'https://api.zerion.io/v1';
const API_KEY = process.env.ZERION_API_KEY;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ZerionTransaction {
  id:             string;
  type:           'send' | 'receive' | 'swap' | 'approve' | 'contract_execution';
  status:         'confirmed' | 'pending' | 'failed';
  hash:           string;
  blockNumber:    number;
  timestamp:      number;           // Unix ms
  chain:          string;           // 'ethereum' | 'polygon' | 'arbitrum' etc.
  feeUsd:         number | null;

  // Direction
  direction:      'outgoing' | 'incoming';

  // Asset changes
  changes:        Array<{
    asset: {
      symbol:       string;
      name:         string;
      decimals:     number;
      iconUrl?:     string;
      isVerified:   boolean;
      priceUsd?:    number;
    };
    amount:         number;         // In token units
    valueUsd:       number | null;
    direction:      'out' | 'in';
  }>;

  // Sender / recipient
  from: {
    address:       string;
    label?:        string;          // e.g. "Binance", "Uniswap V3", "Whale 0x..."
    isContract:    boolean;
    category?:     'exchange' | 'defi' | 'whale' | 'mev_bot' | 'scam' | 'unknown';
  };
  to: {
    address:       string;
    label?:        string;
    isContract:    boolean;
    category?:     'exchange' | 'defi' | 'whale' | 'mev_bot' | 'scam' | 'unknown';
  };
}

// ─── Compatible whale alert type (matches existing whale‑watch page) ───────────

export interface WhaleAlert {
  blockchain:       string;
  timestamp:        string;         // ISO‑8601
  tx_hash:          string;
  whale_address:    string;
  whale_label:      string | null;
  recipient:        string;
  recipient_label:  string | null;
  token_symbol:     string;
  amount_usd:       number;
  source:           'zerion' | 'etherscan';
  direction:        'in' | 'out';
}

// ─── API helpers ──────────────────────────────────────────────────────────────

interface ZerionTransactionsResponse {
  data?: Array<{
    id:           string;
    type:         string;
    attributes: {
      status:       string;
      hash:         string;
      mined_at_block: number;
      mined_at:     number;          // Unix seconds
      fee?:         { usd?: number };
      direction:    'out' | 'in';
      changes?:     Array<{
        asset: {
          fungible_info?: {
            symbol:    string;
            name:      string;
            decimals:  number;
            icon?:     { url?: string };
            flags?:    { verified: boolean };
          };
          price?:      { value?: number };
        };
        value:         number;
        direction:     'out' | 'in';
      }>;
    };
    relationships?: {
      from?: { data?: { id: string } };
      to?:   { data?: { id: string } };
    };
  }>;
  included?: Array<{
    id: string;
    type: string;
    attributes?: {
      address?:      string;
      label?:        string;
      is_contract?:  boolean;
      category?:     string;
    };
  }>;
  links?: { next?: string };
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function zerionFetch<T>(path: string, fallback: T): Promise<T> {
  if (!API_KEY) {
    console.warn('[Zerion] ZERION_API_KEY not set — using seed fallback');
    return fallback;
  }
  try {
    const res = await fetch(`${ZERION_API}${path}`, {
      headers: {
        'Accept':          'application/json',
        'Authorization':   `Basic ${Buffer.from(`${API_KEY}:`).toString('base64')}`,
        'User-Agent':      'CryptoBrainNews/1.0 (https://cryptobrainnews.vercel.app)',
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (res.status === 429) {
      console.warn('[Zerion] Rate limited — using seed fallback');
      return fallback;
    }
    if (!res.ok) {
      console.warn(`[Zerion] HTTP ${res.status}`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn('[Zerion] Fetch error:', String(err));
    return fallback;
  }
}

/**
 * Fetch recent whale transactions from Zerion.
 *
 * Strategy: Zerion doesn't have a "global whale feed" endpoint. Instead we
 * query recent transactions for a set of known whale‑associated addresses
 * (exchange hot wallets, large DeFi contracts) and filter by USD value.
 *
 * This gives us entity‑labelled transactions that the Etherscan feed lacks.
 */
export async function getZerionWhaleAlerts(limit = 50): Promise<WhaleAlert[]> {
  return cached('zerion:whale-alerts', async () => {
    if (!API_KEY) {
      console.info('[Zerion] ZERION_API_KEY not configured — returning empty');
      return [];
    }

    // Known high‑activity whale addresses (exchange hot wallets, MEV bots, whales)
    // Zerion labels these automatically via their entity recognition.
    const WHALE_WATCH_ADDRESSES = [
      '0x28c6c06298d51408901ae4a9b5b678fcb9eb4d4e', // Binance 7
      '0x21a31ee1afc51d94c2efccaa2092ad1028285549', // Binance 8
      '0xdfd5293d8e347dfe59e90efd55b2956a1343963d', // Coinbase 10
      '0x3cd751e6b0078be393a7d9e33e5df3e29e4a1c44', // Kraken 5
      '0x0a59649758aa4d66e25f08dd01271e891fe52199', // Maker DAO
    ];

    const allAlerts: WhaleAlert[] = [];

    // Fetch transactions for each address (parallel, capped at 5 concurrent)
    const batchSize = 5;
    for (let i = 0; i < WHALE_WATCH_ADDRESSES.length; i += batchSize) {
      const batch = WHALE_WATCH_ADDRESSES.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((addr) =>
          zerionFetch<ZerionTransactionsResponse>(
            `/wallets/${addr}/transactions?filter[transaction_types]=send,receive,swap,contract_execution&page[size]=20&page[before]=0`,
            { data: [], included: [] },
          ),
        ),
      );

      for (const result of results) {
        if (!result.data) continue;

        // Build address → label map from included resources
        const labelMap = new Map<string, ZerionTransaction['from']>();
        (result.included ?? []).forEach((inc) => {
          if (inc.type === 'address' && inc.attributes) {
            labelMap.set(inc.id, {
              address:    inc.attributes.address ?? inc.id,
              label:      inc.attributes.label ?? undefined,
              isContract: inc.attributes.is_contract ?? false,
              category:   inc.attributes.category as ZerionTransaction['from']['category'] ?? 'unknown',
            });
          }
        });

        for (const tx of result.data) {
          const attrs = tx.attributes;
          if (!attrs || attrs.status !== 'confirmed') continue;

          // Guard against missing changes array
          if (!attrs.changes || attrs.changes.length === 0) continue;

          // Find the largest asset change
          const largestChange = attrs.changes.reduce<typeof attrs.changes[number] | null>(
            (best, change) => {
              const valUsd = (change.asset.fungible_info?.symbol && change.asset.price?.value)
                ? Math.abs(change.value * (change.asset.price.value / Math.pow(10, change.asset.fungible_info.decimals)))
                : 0;
              const bestVal = best?.asset?.price?.value
                ? Math.abs(best.value * (best.asset.price.value / Math.pow(10, best.asset.fungible_info?.decimals ?? 18)))
                : 0;
              return valUsd > bestVal ? change : best;
            },
            null,
          );

          if (!largestChange?.asset.fungible_info) continue;

          const decimals = largestChange.asset.fungible_info.decimals;
          const priceUsd = largestChange.asset.price?.value ?? 0;
          const amountUsd = Math.abs(largestChange.value * (priceUsd / Math.pow(10, decimals)));

          // Filter: >$100K whale threshold
          if (amountUsd < 100_000) continue;

          const fromId = tx.relationships?.from?.data?.id ?? '';
          const toId   = tx.relationships?.to?.data?.id   ?? '';
          const from   = labelMap.get(fromId) ?? { address: fromId, isContract: false };
          const to     = labelMap.get(toId)   ?? { address: toId,   isContract: false };

          allAlerts.push({
            blockchain:      'ethereum',
            timestamp:        new Date(attrs.mined_at * 1000).toISOString(),
            tx_hash:          attrs.hash,
            whale_address:    from.address,
            whale_label:      from.label ?? null,
            recipient:        to.address,
            recipient_label:  to.label ?? null,
            token_symbol:     largestChange.asset.fungible_info.symbol,
            amount_usd:       Number(amountUsd.toFixed(2)),
            source:           'zerion',
            direction:        largestChange.direction === 'out' ? 'out' : 'in',
          });
        }
      }
    }

    // Deduplicate by tx_hash, sort by timestamp desc
    const seen = new Set<string>();
    const unique = allAlerts
      .filter((a) => {
        if (seen.has(a.tx_hash)) return false;
        seen.add(a.tx_hash);
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    console.info(`[Zerion] Fetched ${unique.length} whale alerts (live)`);
    return unique;
  }, 3600); // 1‑hour cache
}
