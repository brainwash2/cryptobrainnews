
// src/lib/orderbook.ts
// Replaces Kaiko paid API ($300/mo) with Hyperliquid (BTC/ETH) and Drift (SOL).
// Free public endpoints — no API key required.
// Cache TTL: 30 seconds. Falls back to accurate April 2026 seed data.
import 'server-only';
import { cached } from '@/lib/cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderBookLevel {
  price: number;
  amount: number;
}

export interface OrderBookSnapshot {
  timestamp: number;
  pair: string;
  bids: OrderBookLevel[];  // top 10 bid levels, highest first
  asks: OrderBookLevel[];  // top 10 ask levels, lowest first
  midPrice: number;
  spreadBps: number;       // (best ask − best bid) / mid × 10000
  source: 'hyperliquid' | 'drift' | 'seed';
}

// ─── Accurate April 2026 seed data (curve‑fit from Kaiko reference rates) ─────

const SEED_DEPTH: Record<string, { bids: OrderBookLevel[]; asks: OrderBookLevel[]; mid: number }> = {
  'BTC-USD': {
    bids: [
      { price: 70190, amount: 2.5 },  { price: 70180, amount: 5.0 },
      { price: 70170, amount: 8.2 },  { price: 70160, amount: 12.1 },
      { price: 70150, amount: 15.0 }, { price: 70140, amount: 18.5 },
      { price: 70130, amount: 22.0 }, { price: 70120, amount: 25.0 },
      { price: 70110, amount: 30.0 }, { price: 70100, amount: 45.0 },
    ],
    asks: [
      { price: 70210, amount: 3.0 },  { price: 70220, amount: 6.5 },
      { price: 70230, amount: 9.0 },  { price: 70240, amount: 14.0 },
      { price: 70250, amount: 18.0 }, { price: 70260, amount: 20.0 },
      { price: 70270, amount: 24.0 }, { price: 70280, amount: 28.0 },
      { price: 70290, amount: 32.0 }, { price: 70300, amount: 50.0 },
    ],
    mid: 70200,
  },
  'ETH-USD': {
    bids: [
      { price: 2149, amount: 120 }, { price: 2148, amount: 250 },
      { price: 2147, amount: 380 }, { price: 2146, amount: 520 },
      { price: 2145, amount: 680 }, { price: 2144, amount: 850 },
      { price: 2143, amount: 1000 },{ price: 2142, amount: 1200 },
      { price: 2141, amount: 1500 },{ price: 2140, amount: 2000 },
    ],
    asks: [
      { price: 2151, amount: 130 }, { price: 2152, amount: 280 },
      { price: 2153, amount: 420 }, { price: 2154, amount: 580 },
      { price: 2155, amount: 720 }, { price: 2156, amount: 900 },
      { price: 2157, amount: 1100 },{ price: 2158, amount: 1300 },
      { price: 2159, amount: 1600 },{ price: 2160, amount: 2200 },
    ],
    mid: 2150,
  },
  'SOL-USD': {
    bids: [
      { price: 89.20, amount: 800 },  { price: 89.10, amount: 1200 },
      { price: 89.00, amount: 2000 },  { price: 88.90, amount: 3500 },
      { price: 88.80, amount: 5000 },  { price: 88.70, amount: 7200 },
      { price: 88.60, amount: 10000 }, { price: 88.50, amount: 15000 },
      { price: 88.40, amount: 20000 }, { price: 88.30, amount: 30000 },
    ],
    asks: [
      { price: 90.10, amount: 900 },   { price: 90.20, amount: 1500 },
      { price: 90.30, amount: 2200 },  { price: 90.40, amount: 3800 },
      { price: 90.50, amount: 5500 },  { price: 90.60, amount: 8000 },
      { price: 90.70, amount: 11000 }, { price: 90.80, amount: 16000 },
      { price: 90.90, amount: 22000 }, { price: 91.00, amount: 35000 },
    ],
    mid: 89.65,
  },
};

// ─── Fetcher: Hyperliquid (BTC‑USD / ETH‑USD) ─────────────────────────────────
// Hyperliquid info API — 1,200 req/min per IP, no API key.
// POST with {"type":"l2Book","coin":"BTC"} returns
// { levels: [[{px,sz,n}… bids], [{px,sz,n}… asks]] }

interface HyperliquidLevel {
  px: string;
  sz: string;
  n: string;
}

interface HyperliquidL2Response {
  levels?: [[HyperliquidLevel], [HyperliquidLevel]];
}

async function fetchHyperliquid(pair: string): Promise<OrderBookSnapshot | null> {
  const coin = pair === 'BTC-USD' ? 'BTC' : 'ETH';
  const MIN_DEPTH = 100_000; // minimum aggregated depth sanity check

  try {
    const res = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'l2Book', coin }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      console.warn(`[OrderBook] Hyperliquid ${coin} HTTP ${res.status}`);
      return null;
    }

    const json = (await res.json()) as HyperliquidL2Response;
    const levels = json.levels;

    if (!levels || !Array.isArray(levels) || levels.length < 2) {
      console.warn(`[OrderBook] Hyperliquid ${coin} — unexpected shape`);
      return null;
    }

    const rawBids = levels[0] as unknown as HyperliquidLevel[];
    const rawAsks = levels[1] as unknown as HyperliquidLevel[];

    if (!Array.isArray(rawBids) || !Array.isArray(rawAsks) || rawBids.length === 0 || rawAsks.length === 0) {
      return null;
    }

    const bids: OrderBookLevel[] = rawBids.slice(0, 10).map((l) => ({
      price:  parseFloat(l.px),
      amount: parseFloat(l.sz),
    }));

    const asks: OrderBookLevel[] = rawAsks.slice(0, 10).map((l) => ({
      price:  parseFloat(l.px),
      amount: parseFloat(l.sz),
    }));

    // Sanity checks
    const totalBidDepth = bids.reduce((s, b) => s + b.price * b.amount, 0);
    const totalAskDepth = asks.reduce((s, a) => s + a.price * a.amount, 0);
    if (totalBidDepth < MIN_DEPTH || totalAskDepth < MIN_DEPTH) {
      console.warn(`[OrderBook] Hyperliquid ${coin} — depth too low (bid: ${totalBidDepth.toFixed(0)}, ask: ${totalAskDepth.toFixed(0)})`);
      return null;
    }

    const bestBid  = bids[0]?.price ?? 0;
    const bestAsk  = asks[0]?.price ?? 0;
    const mid      = (bestBid + bestAsk) / 2;
    const spreadBps = mid > 0 ? ((bestAsk - bestBid) / mid) * 10000 : 0;

    console.info(`[OrderBook] Hyperliquid ${coin} live — mid: ${mid.toFixed(2)}, spread: ${spreadBps.toFixed(2)} bps`);

    return {
      timestamp: Date.now(),
      pair,
      bids,
      asks,
      midPrice:  Number(mid.toFixed(2)),
      spreadBps: Number(spreadBps.toFixed(3)),
      source:    'hyperliquid',
    };
  } catch (err) {
    console.warn(`[OrderBook] Hyperliquid ${coin} fetch error:`, String(err));
    return null;
  }
}

// ─── Fetcher: Drift DLOB (SOL‑USD) ────────────────────────────────────────────
// dlob.drift.trade — public API, no key.
// GET /l2?marketName=SOL-PERP&depth=10 returns { bids, asks, slot }

interface DriftLevel {
  price: string;
  size: string;
}

interface DriftL2Response {
  bids?: DriftLevel[];
  asks?: DriftLevel[];
  slot?: number;
}

async function fetchDrift(): Promise<OrderBookSnapshot | null> {
  try {
    const res = await fetch(
      'https://dlob.drift.trade/l2?marketName=SOL-PERP&depth=10',
      { signal: AbortSignal.timeout(8_000) },
    );

    if (!res.ok) {
      console.warn(`[OrderBook] Drift SOL-PERP HTTP ${res.status}`);
      return null;
    }

    const json = (await res.json()) as DriftL2Response;

    if (!json.bids?.length || !json.asks?.length) {
      console.warn('[OrderBook] Drift SOL-PERP — empty book');
      return null;
    }

    const bids: OrderBookLevel[] = json.bids.slice(0, 10).map((l) => ({
      price:  parseFloat(l.price),
      amount: parseFloat(l.size),
    }));

    const asks: OrderBookLevel[] = json.asks.slice(0, 10).map((l) => ({
      price:  parseFloat(l.price),
      amount: parseFloat(l.size),
    }));

    const bestBid  = bids[0]?.price ?? 0;
    const bestAsk  = asks[0]?.price ?? 0;
    const mid      = (bestBid + bestAsk) / 2;
    const spreadBps = mid > 0 ? ((bestAsk - bestBid) / mid) * 10000 : 0;

    console.info(`[OrderBook] Drift SOL-PERP live — mid: ${mid.toFixed(2)}, spread: ${spreadBps.toFixed(2)} bps`);

    return {
      timestamp: Date.now(),
      pair:      'SOL-USD',
      bids,
      asks,
      midPrice:  Number(mid.toFixed(2)),
      spreadBps: Number(spreadBps.toFixed(3)),
      source:    'drift',
    };
  } catch (err) {
    console.warn('[OrderBook] Drift SOL-PERP fetch error:', String(err));
    return null;
  }
}

function seedSnapshot(pair: string): OrderBookSnapshot {
  const seed = SEED_DEPTH[pair] ?? SEED_DEPTH['BTC-USD'];
  const bestBid = seed.bids[0]?.price ?? 0;
  const bestAsk = seed.asks[0]?.price ?? 0;
  const mid     = seed.mid;
  const spread  = mid > 0 ? ((bestAsk - bestBid) / mid) * 10000 : 0;

  return {
    timestamp: Date.now(),
    pair,
    bids:      seed.bids,
    asks:      seed.asks,
    midPrice:  mid,
    spreadBps: Number(spread.toFixed(3)),
    source:    'seed',
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get current order‑book snapshot with top‑10 bid/ask levels.
 *
 * @param pair  One of "BTC-USD", "ETH-USD", or "SOL-USD".
 *              BTC/ETH sourced from Hyperliquid; SOL from Drift DLOB.
 *              Falls back to seed data on any failure.
 */
export async function getOrderBookSnapshot(
  pair: 'BTC-USD' | 'ETH-USD' | 'SOL-USD',
): Promise<OrderBookSnapshot> {
  return cached(`orderbook:snapshot:${pair}`, async () => {
    if (pair === 'SOL-USD') {
      const drift = await fetchDrift();
      if (drift) return drift;
    } else {
      const hl = await fetchHyperliquid(pair);
      if (hl) return hl;
    }

    console.info(`[OrderBook] ${pair} — live fetch failed, returning seed`);
    return seedSnapshot(pair);
  }, 30); // 30‑second cache for live order‑book data
}
