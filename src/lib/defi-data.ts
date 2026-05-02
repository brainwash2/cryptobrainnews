/**
 * src/lib/defi-data.ts
 * Phase 42: DeFi subsection data from DefiLlama public APIs.
 * All endpoints are free, no API key required.
 */
import 'server-only';
import { cached } from '@/lib/cache';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProtocolRow {
  name:       string;
  category:   string;
  tvl:        number;
  change_1d:  number | null;
  change_7d:  number | null;
  chains:     string[];
  symbol:     string | null;
  logo:       string | null;
}

export interface FeeProtocol {
  name:         string;
  category:     string;
  total24h:     number | null;
  total7d:      number | null;
  total30d:     number | null;
  totalAllTime: number | null;
  change_1d:    number | null;
  chains:       string[];
}

export interface StablecoinData {
  id:               string;
  name:             string;
  symbol:           string;
  pegType:          string;
  price:            number;
  circulatingUsd:   number;
  change_1d:        number | null;
  change_7d:        number | null;
  chains:           string[];
}

export interface LendingProtocol {
  name:       string;
  tvl:        number;
  borrowed:   number | null;
  category:   string;
  chains:     string[];
  change_1d:  number | null;
}

export interface RwaProtocol {
  name:       string;
  tvl:        number;
  category:   string;
  chains:     string[];
  change_1d:  number | null;
  change_7d:  number | null;
}

export interface DexVolumeRow {
  name:       string;
  total24h:   number | null;
  total7d:    number | null;
  change_1d:  number | null;
  chains:     string[];
}

export interface YieldPool {
  pool:       string;
  project:    string;
  chain:      string;
  symbol:     string;
  tvlUsd:     number;
  apy:        number;
  apyPct1D:   number | null;
  stablecoin: boolean;
}

export interface DerivativeProtocol {
  name:       string;
  total24h:   number | null;
  totalOI:    number | null;
  change_1d:  number | null;
  chains:     string[];
}

// ─── 1. TVL rankings ─────────────────────────────────────────────────────────

export async function getTopProtocolsByTvl(limit = 50): Promise<ProtocolRow[]> {
  return cached(`defi:tvl:top:${limit}`, async () => {
    const data = await safeFetch<Array<{
      name: string; category: string; tvl: number;
      change_1d: number | null; change_7d: number | null;
      chains: string[]; symbol: string | null; logo: string | null;
    }>>('https://api.llama.fi/protocols', []);

    return data
      .filter((p) => p.tvl > 1_000_000)
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, limit)
      .map((p) => ({
        name:      p.name,
        category:  p.category ?? '—',
        tvl:       p.tvl,
        change_1d: p.change_1d ?? null,
        change_7d: p.change_7d ?? null,
        chains:    p.chains ?? [],
        symbol:    p.symbol ?? null,
        logo:      p.logo ?? null,
      }));
  }, 3600);
}

export async function getTvlByCategory(): Promise<Array<{ category: string; tvl: number; share: number }>> {
  return cached('defi:tvl:by-category', async () => {
    const protocols = await getTopProtocolsByTvl(500);
    const map = new Map<string, number>();
    protocols.forEach((p) => {
      map.set(p.category, (map.get(p.category) ?? 0) + p.tvl);
    });
    const total = [...map.values()].reduce((s, v) => s + v, 0);
    return [...map.entries()]
      .map(([category, tvl]) => ({ category, tvl, share: total > 0 ? (tvl / total) * 100 : 0 }))
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 15);
  }, 3600);
}

// ─── 2. Protocol Revenue / Fees ───────────────────────────────────────────────

export async function getProtocolFees(limit = 40): Promise<FeeProtocol[]> {
  return cached(`defi:fees:top:${limit}`, async () => {
    const data = await safeFetch<{
      protocols?: Array<{
        name: string; category: string; chains?: string[];
        total24h: number | null; total7d: number | null; total30d?: number | null;
        totalAllTime: number | null; change_1d: number | null;
      }>;
    }>('https://api.llama.fi/overview/fees?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true', {});

    return (data.protocols ?? [])
      .filter((p) => (p.total24h ?? 0) > 0)
      .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
      .slice(0, limit)
      .map((p) => ({
        name:         p.name,
        category:     p.category ?? '—',
        total24h:     p.total24h ?? null,
        total7d:      p.total7d ?? null,
        total30d:     p.total30d ?? null,
        totalAllTime: p.totalAllTime ?? null,
        change_1d:    p.change_1d ?? null,
        chains:       p.chains ?? [],
      }));
  }, 3600);
}

export async function getProtocolRevenue(limit = 40): Promise<FeeProtocol[]> {
  return cached(`defi:revenue:top:${limit}`, async () => {
    const data = await safeFetch<{
      protocols?: Array<{
        name: string; category: string; chains?: string[];
        total24h: number | null; total7d: number | null; total30d?: number | null;
        totalAllTime: number | null; change_1d: number | null;
      }>;
    }>('https://api.llama.fi/overview/revenue?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true', {});

    return (data.protocols ?? [])
      .filter((p) => (p.total24h ?? 0) > 0)
      .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
      .slice(0, limit)
      .map((p) => ({
        name:         p.name,
        category:     p.category ?? '—',
        total24h:     p.total24h ?? null,
        total7d:      p.total7d ?? null,
        total30d:     p.total30d ?? null,
        totalAllTime: p.totalAllTime ?? null,
        change_1d:    p.change_1d ?? null,
        chains:       p.chains ?? [],
      }));
  }, 3600);
}

// ─── 3. Stablecoins ───────────────────────────────────────────────────────────

export async function getStablecoinsOverview(): Promise<StablecoinData[]> {
  return cached('defi:stablecoins:overview', async () => {
    const data = await safeFetch<{
      peggedAssets?: Array<{
        id: string; name: string; symbol: string; pegType: string;
        price: number | null;
        circulating: { peggedUSD?: number } | null;
        change_1d: number | null; change_7d: number | null;
        chains: string[];
      }>;
    }>('https://stablecoins.llama.fi/stablecoins?includePrices=true', {});

    return (data.peggedAssets ?? [])
      .filter((s) => (s.circulating?.peggedUSD ?? 0) > 1_000_000)
      .sort((a, b) => (b.circulating?.peggedUSD ?? 0) - (a.circulating?.peggedUSD ?? 0))
      .slice(0, 30)
      .map((s) => ({
        id:             s.id,
        name:           s.name,
        symbol:         s.symbol,
        pegType:        s.pegType,
        price:          s.price ?? 1,
        circulatingUsd: s.circulating?.peggedUSD ?? 0,
        change_1d:      s.change_1d ?? null,
        change_7d:      s.change_7d ?? null,
        chains:         s.chains ?? [],
      }));
  }, 3600);
}

// ─── 3a. Stablecoin 90-day Supply History (USDT + USDC) ──────────────────────

export interface StablecoinHistoryPoint {
  date:  string; // "YYYY-MM-DD"
  usdt:  number; // circulating supply in $B
  usdc:  number; // circulating supply in $B
}

export async function getStablecoinTrendData(): Promise<StablecoinHistoryPoint[]> {
  return cached('defi:stablecoins:trend:90d', async () => {
    interface LlamaStablecoinHistory {
      tokens?: Array<{ date: number; totalCirculating: { peggedUSD?: number } }>;
    }

    const [usdtRes, usdcRes] = await Promise.all([
      safeFetch<LlamaStablecoinHistory>('https://stablecoins.llama.fi/stablecoin/1', {}),
      safeFetch<LlamaStablecoinHistory>('https://stablecoins.llama.fi/stablecoin/3', {}),
    ]);

    const toMap = (tokens: Array<{ date: number; totalCirculating: { peggedUSD?: number } }>) =>
      new Map(
        tokens.map((t) => [
          new Date(t.date * 1000).toISOString().slice(0, 10),
          (t.totalCirculating.peggedUSD ?? 0) / 1e9,
        ])
      );

    const usdtMap = toMap(usdtRes.tokens ?? []);
    const usdcMap = toMap(usdcRes.tokens ?? []);

    // 90 days so the client-side timeframe selector can slice to 7D / 30D / 90D
    const points: StablecoinHistoryPoint[] = [];
    const now = Date.now();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
      const usdt = usdtMap.get(d) ?? 0;
      const usdc = usdcMap.get(d) ?? 0;
      if (usdt > 0 || usdc > 0) points.push({ date: d, usdt, usdc });
    }
    return points;
  }, 3600);
}

// ─── 3b. Stablecoins by Chain ─────────────────────────────────────────────────

export interface StablecoinChainRow {
  name:                string;
  totalCirculatingUsd: number;
}

export async function getStablecoinsByChain(): Promise<StablecoinChainRow[]> {
  return cached('defi:stablecoins:chains', async () => {
    const data = await safeFetch<Array<{
      name: string;
      totalCirculatingUSD?: { peggedUSD?: number };
    }>>('https://stablecoins.llama.fi/chains', []);

    if (!Array.isArray(data)) return [];
    return data
      .map((c) => ({
        name:                c.name,
        totalCirculatingUsd: c.totalCirculatingUSD?.peggedUSD ?? 0,
      }))
      .filter((c) => c.totalCirculatingUsd > 0)
      .sort((a, b) => b.totalCirculatingUsd - a.totalCirculatingUsd)
      .slice(0, 8);
  }, 3600);
}

// ─── 3c. DeFi Protocol Fees (24h aggregate) ──────────────────────────────────

export async function getDefiTotalFees24h(): Promise<number> {
  return cached('defi:fees:24h', async () => {
    const data = await safeFetch<{ total24h?: number }>(
      'https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true',
      {},
    );
    return data.total24h ?? 0;
  }, 3600);
}

// ─── 3d. Global DEX Volume (24h) — for stablecoin velocity ───────────────────

export async function getGlobalDexVolume24h(): Promise<number> {
  return cached('defi:dex:vol24h:global', async () => {
    const data = await safeFetch<{ total24h?: number }>(
      'https://api.llama.fi/overview/dexs?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true',
      {},
    );
    return data.total24h ?? 0;
  }, 1800);
}

// ─── 4. Lending ───────────────────────────────────────────────────────────────

export async function getLendingProtocols(): Promise<LendingProtocol[]> {
  return cached('defi:lending', async () => {
    const protocols = await getTopProtocolsByTvl(500);
    const lendingCategories = new Set(['Lending', 'CDP', 'Yield Aggregator']);
    return protocols
      .filter((p) => lendingCategories.has(p.category))
      .slice(0, 30)
      .map((p) => ({
        name:      p.name,
        tvl:       p.tvl,
        borrowed:  null,
        category:  p.category,
        chains:    p.chains,
        change_1d: p.change_1d,
      }));
  }, 3600);
}

// ─── 5. RWA ───────────────────────────────────────────────────────────────────

export async function getRwaProtocols(): Promise<RwaProtocol[]> {
  return cached('defi:rwa', async () => {
    const protocols = await getTopProtocolsByTvl(500);
    return protocols
      .filter((p) => p.category === 'RWA' || p.category === 'RWA Lending')
      .slice(0, 25)
      .map((p) => ({
        name:      p.name,
        tvl:       p.tvl,
        category:  p.category,
        chains:    p.chains,
        change_1d: p.change_1d,
        change_7d: p.change_7d,
      }));
  }, 3600);
}

// ─── 6. DEX Volume ────────────────────────────────────────────────────────────

export async function getDexVolumes(limit = 30): Promise<DexVolumeRow[]> {
  return cached(`defi:dex:volumes:${limit}`, async () => {
    const data = await safeFetch<{
      protocols?: Array<{
        name: string; total24h: number | null; total7d: number | null;
        change_1d: number | null; chains: string[];
      }>;
    }>('https://api.llama.fi/overview/dexs?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true', {});

    return (data.protocols ?? [])
      .filter((p) => (p.total24h ?? 0) > 0)
      .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
      .slice(0, limit)
      .map((p) => ({
        name:      p.name,
        total24h:  p.total24h ?? null,
        total7d:   p.total7d ?? null,
        change_1d: p.change_1d ?? null,
        chains:    p.chains ?? [],
      }));
  }, 1800);
}

// ─── 7. Restaking ─────────────────────────────────────────────────────────────

export async function getRestakingProtocols(): Promise<ProtocolRow[]> {
  return cached('defi:restaking', async () => {
    const protocols = await getTopProtocolsByTvl(500);
    return protocols
      .filter((p) =>
        p.category === 'Restaking' ||
        p.name.toLowerCase().includes('eigenlayer') ||
        p.name.toLowerCase().includes('symbiotic') ||
        p.name.toLowerCase().includes('karak')
      )
      .slice(0, 20);
  }, 3600);
}

// ─── 8. Derivatives ───────────────────────────────────────────────────────────

export async function getDerivativesProtocols(limit = 25): Promise<DerivativeProtocol[]> {
  return cached(`defi:derivatives:${limit}`, async () => {
    const data = await safeFetch<{
      protocols?: Array<{
        name: string; total24h: number | null; openInterest: number | null;
        change_1d: number | null; chains: string[];
      }>;
    }>('https://api.llama.fi/overview/derivatives?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true', {});

    return (data.protocols ?? [])
      .filter((p) => (p.total24h ?? 0) > 0)
      .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
      .slice(0, limit)
      .map((p) => ({
        name:      p.name,
        total24h:  p.total24h ?? null,
        totalOI:   p.openInterest ?? null,
        change_1d: p.change_1d ?? null,
        chains:    p.chains ?? [],
      }));
  }, 1800);
}

// ─── 9. Yields ────────────────────────────────────────────────────────────────

export async function getTopYieldPools(limit = 50): Promise<YieldPool[]> {
  return cached(`defi:yields:top:${limit}`, async () => {
    const data = await safeFetch<{
      data?: Array<{
        pool: string; project: string; chain: string; symbol: string;
        tvlUsd: number; apy: number; apyPct1D: number | null; stablecoin: boolean;
      }>;
    }>('https://yields.llama.fi/pools', {});

    return (data.data ?? [])
      .filter((p) => p.apy > 0 && p.tvlUsd > 100_000)
      .sort((a, b) => b.tvlUsd - a.tvlUsd)
      .slice(0, limit)
      .map((p) => ({
        pool:       p.pool,
        project:    p.project,
        chain:      p.chain,
        symbol:     p.symbol,
        tvlUsd:     p.tvlUsd,
        apy:        p.apy,
        apyPct1D:   p.apyPct1D ?? null,
        stablecoin: p.stablecoin ?? false,
      }));
  }, 1800);
}

// ─── 10. Prediction markets (Polymarket public) ────────────────────────────────

export interface PredictionMarket {
  id:       string;
  title:    string;
  volume:   number;
  openInt:  number;
  slug:     string;
  yesPrice: number;
}

export async function getPolymarketTop(limit = 20): Promise<PredictionMarket[]> {
  return cached(`defi:polymarket:top:${limit}`, async () => {
    const data = await safeFetch<Array<{
      id: string; title: string; volume: number; openInterest: number;
      slug: string; markets: Array<{ outcomePrices: string[] }>;
    }>>('https://gamma-api.polymarket.com/events?closed=false&limit=50&order=volume&ascending=false', []);

    return data.slice(0, limit).map((e) => ({
      id:       e.id,
      title:    e.title,
      volume:   e.volume ?? 0,
      openInt:  e.openInterest ?? 0,
      slug:     e.slug ?? '',
      yesPrice: parseFloat(e.markets?.[0]?.outcomePrices?.[0] ?? '0'),
    }));
  }, 600);
}

// Phase B: Token unlocks from DefiLlama /unlocks
export interface TokenUnlock {
  token: string;
  amount: number;
  amountUsd: number;
  pctOfSupply: number | null;
  unlockDate: string;
}

export async function getNextUnlocks(): Promise<TokenUnlock[]> {
  return cached('defi:unlocks:next', async () => {
    try {
      const res = await fetch('https://api.llama.fi/unlocks', {
        next: { revalidate: 86400 },
      });
      if (!res.ok) return [];
      const data = await res.json() as {
        data?: Array<{
          name: string;
          date: number;
          amount: number;
          amountUsd: number;
          supply: number;
        }>;
      };
      if (!data.data) return [];
      return data.data
        .filter((u) => u.date * 1000 >= Date.now())
        .map((u) => ({
          token: u.name,
          amount: u.amount ?? 0,
          amountUsd: u.amountUsd ?? 0,
          pctOfSupply: u.supply > 0 ? (u.amount / u.supply) * 100 : null,
          unlockDate: new Date(u.date * 1000).toISOString().slice(0, 10),
        }))
        .sort((a, b) => a.unlockDate.localeCompare(b.unlockDate));
    } catch {
      return [];
    }
  }, 86400);
}
