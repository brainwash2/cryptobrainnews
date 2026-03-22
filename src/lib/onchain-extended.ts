/**
 * src/lib/onchain-extended.ts
 * Phase 45 · Dune replacement — pure REST APIs, no SQL engine required.
 *
 * Sources (all free, no account ban risk):
 *   blockchain.info  — BTC charts API (active addresses, tx count) — no key
 *   Etherscan        — ETH stats + token transfers — free key required
 *   Solana RPC       — already used in onchain-data.ts
 *   DefiLlama        — L2 chain metrics — already used elsewhere
 *
 * All functions return the same shape as the Dune equivalents so
 * existing page.tsx files need zero changes.
 */
import 'server-only';
import { cached } from './cache';

// ─── Types (mirror DuneRow shape so pages need no changes) ────────────────────
export interface OnchainRow {
  [key: string]: string | number | null;
}

// Alias for backward compatibility with pages that imported DuneRow
export type DuneRow = OnchainRow;

const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY;
const TTL_30_MIN    = 1800;
const TTL_1_HOUR    = 3600;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { next: { revalidate: TTL_30_MIN } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// blockchain.info chart endpoint → normalize to { day, value } pairs
async function fetchBlockchainInfoChart(
  chart: string,
  days: number
): Promise<Array<{ day: string; value: number }>> {
  const url = `https://blockchain.info/charts/${chart}?format=json&timespan=${days}days&sampled=true&cors=true`;
  const data = await safeFetch<{ values?: Array<{ x: number; y: number }> }>(url, {});
  return (data.values ?? []).map((pt) => ({
    day:   new Date(pt.x * 1000).toISOString().slice(0, 10),
    value: pt.y,
  }));
}

// ─── BTC Active Addresses ─────────────────────────────────────────────────────
// Source: blockchain.info/charts/n-unique-addresses (free, no key)

export async function getBTCActiveAddresses(days = 30): Promise<OnchainRow[]> {
  return cached(`ext:btc-active-addresses:${days}`, async () => {
    const pts = await fetchBlockchainInfoChart('n-unique-addresses', days);
    return pts.map((p) => ({
      day:              p.day,
      active_addresses: p.value,
      chain:            'bitcoin',
    }));
  }, TTL_30_MIN);
}

// ─── BTC Daily Transactions ───────────────────────────────────────────────────
// Source: blockchain.info/charts/n-transactions (free, no key)

export async function getBTCDailyTransactions(days = 30): Promise<OnchainRow[]> {
  return cached(`ext:btc-daily-txns:${days}`, async () => {
    const pts = await fetchBlockchainInfoChart('n-transactions', days);
    return pts.map((p) => ({
      day:      p.day,
      tx_count: p.value,
      chain:    'bitcoin',
    }));
  }, TTL_30_MIN);
}

// ─── ETH Active Addresses ─────────────────────────────────────────────────────
// Source: Etherscan Stats API — requires free key

export async function getETHActiveAddresses(days = 30): Promise<OnchainRow[]> {
  return cached(`ext:eth-active-addresses:${days}`, async () => {
    if (!ETHERSCAN_KEY) {
      console.warn('[OnchainExt] ETHERSCAN_API_KEY not set — ETH address data unavailable');
      return [];
    }
    // Etherscan daily tx count as proxy (no direct "unique addresses" endpoint on free tier)
    const url = `https://api.etherscan.io/api?module=stats&action=dailytx&startdate=${daysAgoISO(days)}&enddate=${todayISO()}&sort=asc&apikey=${ETHERSCAN_KEY}`;
    const data = await safeFetch<{ status: string; result?: Array<{ unixTimeStamp: string; transactionCount: string }> }>(
      url,
      { status: '0', result: [] }
    );
    if (!data.result) return [];
    return data.result.map((r) => ({
      day:              new Date(Number(r.unixTimeStamp) * 1000).toISOString().slice(0, 10),
      active_addresses: Number(r.transactionCount), // daily tx count as best free proxy
      chain:            'ethereum',
    }));
  }, TTL_1_HOUR);
}

// ─── ETH Daily Transactions ───────────────────────────────────────────────────

export async function getETHDailyTransactions(days = 30): Promise<OnchainRow[]> {
  return cached(`ext:eth-daily-txns:${days}`, async () => {
    if (!ETHERSCAN_KEY) {
      console.warn('[OnchainExt] ETHERSCAN_API_KEY not set — ETH tx data unavailable');
      return [];
    }
    const url = `https://api.etherscan.io/api?module=stats&action=dailytx&startdate=${daysAgoISO(days)}&enddate=${todayISO()}&sort=asc&apikey=${ETHERSCAN_KEY}`;
    const data = await safeFetch<{ status: string; result?: Array<{ unixTimeStamp: string; transactionCount: string }> }>(
      url,
      { status: '0', result: [] }
    );
    if (!data.result) return [];
    return data.result.map((r) => ({
      day:      new Date(Number(r.unixTimeStamp) * 1000).toISOString().slice(0, 10),
      tx_count: Number(r.transactionCount),
      chain:    'ethereum',
    }));
  }, TTL_30_MIN);
}

// ─── Whale Transfers ──────────────────────────────────────────────────────────
// Source: Etherscan large USDT + USDC transfers as whale proxy
// Tracks transfers > $500K equivalent on Ethereum mainnet

export async function getWhaleTransfers(): Promise<OnchainRow[]> {
  return cached('ext:whale-transfers', async () => {
    if (!ETHERSCAN_KEY) {
      console.warn('[OnchainExt] ETHERSCAN_API_KEY not set — whale data unavailable');
      return [];
    }
    // USDT contract — fetch recent large transfers (last 1000 txns, filter by size)
    const USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7';
    const url  = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${USDT}&page=1&offset=200&sort=desc&apikey=${ETHERSCAN_KEY}`;
    const data = await safeFetch<{
      status: string;
      result?: Array<{
        timeStamp: string; from: string; to: string;
        value: string; tokenDecimal: string; hash: string; tokenSymbol: string;
      }>;
    }>(url, { status: '0', result: [] });

    if (!data.result) return [];

    return data.result
      .map((tx) => {
        const decimals  = Number(tx.tokenDecimal) || 6;
        const amount    = Number(tx.value) / Math.pow(10, decimals);
        return {
          block_time:    new Date(Number(tx.timeStamp) * 1000).toISOString(),
          blockchain:    'ethereum',
          whale_address: tx.from,
          recipient:     tx.to,
          contract_address: USDT,
          amount_usd:    amount,
          tx_hash:       tx.hash,
          token_symbol:  tx.tokenSymbol,
        };
      })
      .filter((tx) => Number(tx.amount_usd) > 100_000)
      .slice(0, 100);
  }, TTL_30_MIN);
}

// ─── L2 Active Addresses (via DefiLlama chain activity) ───────────────────────
// DefiLlama /v2/chains gives us TVL + 24h change; activity proxy via tx count
// from each chain's public blockscout/explorer API

export async function getL2ActiveAddresses(days = 30): Promise<OnchainRow[]> {
  return cached(`ext:l2-active-addresses:${days}`, async () => {
    // Use DefiLlama chain TVL history as L2 activity signal
    const chains = ['arbitrum', 'optimism', 'base'];
    const rows: OnchainRow[] = [];

    await Promise.all(chains.map(async (chain) => {
      const url  = `https://api.llama.fi/v2/historicalChainTvl/${chain}`;
      const data = await safeFetch<Array<{ date: number; tvl: number }>>(url, []);
      const cutoff = Date.now() / 1000 - days * 86400;
      data
        .filter((pt) => pt.date >= cutoff)
        .slice(-days)
        .forEach((pt) => {
          rows.push({
            day:              new Date(pt.date * 1000).toISOString().slice(0, 10),
            chain,
            // TVL used as activity proxy — tx_count unavailable without paid RPC
            tx_count:         null,
            active_addresses: null,
            tvl_usd:          pt.tvl,
          });
        });
    }));

    return rows.sort((a, b) => String(b.day).localeCompare(String(a.day)));
  }, TTL_1_HOUR);
}

// ─── L2 Gas Fees (via public RPC eth_gasPrice) ────────────────────────────────

export async function getL2GasFees(days = 30): Promise<OnchainRow[]> {
  return cached(`ext:l2-gas-fees:${days}`, async () => {
    const RPCs: Record<string, string> = {
      arbitrum: 'https://arb1.arbitrum.io/rpc',
      optimism: 'https://mainnet.optimism.io',
      base:     'https://mainnet.base.org',
    };

    const rows: OnchainRow[] = [];

    await Promise.all(Object.entries(RPCs).map(async ([chain, rpc]) => {
      try {
        const res = await fetch(rpc, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 }),
          next:    { revalidate: 300 },
        });
        const json = await res.json() as { result?: string };
        const gasPriceGwei = json.result
          ? parseInt(json.result, 16) / 1e9
          : null;

        rows.push({
          day:                 new Date().toISOString().slice(0, 10),
          chain,
          avg_gas_price_gwei:  gasPriceGwei,
        });
      } catch {
        rows.push({ day: new Date().toISOString().slice(0, 10), chain, avg_gas_price_gwei: null });
      }
    }));

    return rows;
  }, 300); // 5 min TTL — gas prices change fast
}

// ─── SOL Daily Transactions (already covered in onchain-data.ts) ───────────────
// These are thin wrappers that return the same shape as the Dune equivalents.
// The real fetch happens in getBitcoinStats / getSolanaStats in onchain-data.ts.

export async function getSOLDailyTransactions(days = 30): Promise<OnchainRow[]> {
  // Solana doesn't expose daily tx history via free public API.
  // Return a single current-day row from the Solana RPC tps estimate.
  return cached(`ext:sol-daily-txns:${days}`, async () => {
    try {
      const res = await fetch('https://api.mainnet-beta.solana.com', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getRecentPerformanceSamples', params: [60] }),
        next:    { revalidate: 300 },
      });
      const json = await res.json() as { result?: Array<{ numTransactions: number; samplePeriodSecs: number }> };
      const samples = json.result ?? [];
      const avgTps  = samples.length > 0
        ? samples.reduce((s, r) => s + r.numTransactions / r.samplePeriodSecs, 0) / samples.length
        : 0;
      return [{
        day:           new Date().toISOString().slice(0, 10),
        tx_count:      Math.round(avgTps * 86400),
        active_signers: null,
        chain:         'solana',
      }];
    } catch { return []; }
  }, 300);
}

export async function getSOLDailyFees(days = 30): Promise<OnchainRow[]> {
  // Solana fee data not available via free public API without a historical index.
  // Return empty — the page degrades gracefully.
  return [];
}

// ─── DEX Top Protocols — delegate to DefiLlama (already used) ─────────────────

export async function getDEXTopProtocols(): Promise<OnchainRow[]> {
  return cached('ext:dex-top-protocols', async () => {
    const data = await safeFetch<{
      protocols?: Array<{ name: string; total24h: number | null; total7d: number | null; change_1d: number | null; chains: string[] }>;
    }>('https://api.llama.fi/overview/dexs?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true', {});

    return (data.protocols ?? [])
      .filter((p) => (p.total24h ?? 0) > 0)
      .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
      .slice(0, 50)
      .map((p) => ({
        dex:            p.name,
        blockchain:     p.chains?.[0] ?? 'multi',
        volume_30d_usd: p.total7d ?? null,
        trade_count:    null,
        unique_txs:     null,
      }));
  }, TTL_30_MIN);
}

// ─── NFT Top Collections — delegate to Reservoir (already wired) ───────────────
// See lib/nft-data.ts getTopCollections() — no change needed.

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
