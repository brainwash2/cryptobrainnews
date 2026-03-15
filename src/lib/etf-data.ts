/**
 * src/lib/etf-data.ts
 * Phase 39: ETF data fetchers.
 *
 * Strategy for AUM:
 *   - Store known BTC/ETH on-chain holdings (from public filings/on-chain data)
 *   - Multiply by live CoinGecko price → always-current AUM estimate
 *   - This is more accurate than hardcoded USD figures that go stale
 *
 * Flow data: Farside Investors does not expose a public API.
 *   Daily flow integration is planned when a reliable free source is confirmed.
 */
import { cached } from '@/lib/cache';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EtfProduct {
  ticker:       string;
  issuer:       string;
  type:         'spot' | 'futures';
  region:       'US' | 'HK' | 'EU';
  fee:          string;          // sponsor fee e.g. "0.12%"
  feeNum:       number;          // numeric fee for sorting
  holdings:     number;          // native coin holdings
  inception:    string;          // "Jan 2024"
  url:          string;
}

export interface EtfWithAum extends EtfProduct {
  aumUsd:       number;
  marketShare:  number;          // 0–100 %
}

export interface EtfOverview {
  products:     EtfWithAum[];
  totalAumUsd:  number;
  coinPrice:    number;
  totalHoldings:number;
  pctOfSupply:  number;
  totalSupply:  number;          // approximate circulating supply used
}

// ─── Seed data ───────────────────────────────────────────────────────────────
// Holdings sourced from public on-chain attestations / SEC filings.
// Updated to approximate Q1 2026 figures.

const BTC_ETF_SEED: EtfProduct[] = [
  { ticker: 'IBIT',  issuer: 'BlackRock',   type: 'spot',    region: 'US', fee: '0.12%', feeNum: 0.0012, holdings: 570_000, inception: 'Jan 2024', url: 'https://www.ishares.com/us/products/333011/' },
  { ticker: 'GBTC',  issuer: 'Grayscale',   type: 'spot',    region: 'US', fee: '1.50%', feeNum: 0.0150, holdings: 195_000, inception: 'Sep 2013', url: 'https://grayscale.com/products/grayscale-bitcoin-trust/' },
  { ticker: 'FBTC',  issuer: 'Fidelity',    type: 'spot',    region: 'US', fee: '0.25%', feeNum: 0.0025, holdings: 195_000, inception: 'Jan 2024', url: 'https://www.fidelity.com/etfs/fbtc' },
  { ticker: 'ARKB',  issuer: 'ARK Invest',  type: 'spot',    region: 'US', fee: '0.21%', feeNum: 0.0021, holdings:  48_000, inception: 'Jan 2024', url: 'https://ark-funds.com/funds/arkb/' },
  { ticker: 'BITB',  issuer: 'Bitwise',     type: 'spot',    region: 'US', fee: '0.20%', feeNum: 0.0020, holdings:  37_000, inception: 'Jan 2024', url: 'https://bitwiseinvestments.com/etfs/bitb/' },
  { ticker: 'HODL',  issuer: 'VanEck',      type: 'spot',    region: 'US', fee: '0.20%', feeNum: 0.0020, holdings:  13_000, inception: 'Jan 2024', url: 'https://www.vaneck.com/us/en/investments/bitcoin-etf-hodl/' },
  { ticker: 'BTCO',  issuer: 'Invesco',     type: 'spot',    region: 'US', fee: '0.25%', feeNum: 0.0025, holdings:  14_000, inception: 'Jan 2024', url: 'https://www.invesco.com/us/financial-products/etfs/product-detail?audienceType=Investor&ticker=BTCO' },
  { ticker: 'EZBC',  issuer: 'Franklin',    type: 'spot',    region: 'US', fee: '0.19%', feeNum: 0.0019, holdings:  16_000, inception: 'Jan 2024', url: 'https://www.franklintempleton.com/investments/options/exchange-traded-funds/products/38848/' },
  { ticker: 'BRRR',  issuer: 'Valkyrie',    type: 'spot',    region: 'US', fee: '0.25%', feeNum: 0.0025, holdings:   8_500, inception: 'Jan 2024', url: 'https://www.valkyrie-funds.com/bitcoin-fund/' },
  { ticker: 'BTCW',  issuer: 'WisdomTree',  type: 'spot',    region: 'US', fee: '0.30%', feeNum: 0.0030, holdings:   5_500, inception: 'Jan 2024', url: 'https://www.wisdomtree.com/investments/etfs/cryptocurrency/btcw' },
];

const ETH_ETF_SEED: EtfProduct[] = [
  { ticker: 'ETHA',  issuer: 'BlackRock',   type: 'spot',    region: 'US', fee: '0.12%', feeNum: 0.0012, holdings: 350_000, inception: 'Jul 2024', url: 'https://www.ishares.com/us/products/333011/' },
  { ticker: 'ETHE',  issuer: 'Grayscale',   type: 'spot',    region: 'US', fee: '2.50%', feeNum: 0.0250, holdings: 920_000, inception: 'Nov 2017', url: 'https://grayscale.com/products/grayscale-ethereum-trust/' },
  { ticker: 'FETH',  issuer: 'Fidelity',    type: 'spot',    region: 'US', fee: '0.25%', feeNum: 0.0025, holdings: 220_000, inception: 'Jul 2024', url: 'https://www.fidelity.com/etfs/feth' },
  { ticker: 'ETHW',  issuer: 'Bitwise',     type: 'spot',    region: 'US', fee: '0.20%', feeNum: 0.0020, holdings: 110_000, inception: 'Jul 2024', url: 'https://bitwiseinvestments.com/etfs/ethw/' },
  { ticker: 'QETH',  issuer: '21Shares',    type: 'spot',    region: 'US', fee: '0.21%', feeNum: 0.0021, holdings:  85_000, inception: 'Jul 2024', url: 'https://www.21shares.com/en-us/product/qeth' },
  { ticker: 'CETH',  issuer: 'Franklin',    type: 'spot',    region: 'US', fee: '0.19%', feeNum: 0.0019, holdings:  55_000, inception: 'Jul 2024', url: 'https://www.franklintempleton.com' },
  { ticker: 'ETHV',  issuer: 'VanEck',      type: 'spot',    region: 'US', fee: '0.20%', feeNum: 0.0020, holdings:  70_000, inception: 'Jul 2024', url: 'https://www.vaneck.com/us/en/investments/ethereum-etf-ethv/' },
  { ticker: 'EZET',  issuer: 'Invesco',     type: 'spot',    region: 'US', fee: '0.25%', feeNum: 0.0025, holdings:  42_000, inception: 'Jul 2024', url: 'https://www.invesco.com' },
];

// ─── CoinGecko price helper ───────────────────────────────────────────────────

async function fetchCoinPrice(coinId: string): Promise<number> {
  return cached(`coingecko:simple:${coinId}`, async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      if (!res.ok) return 0;
      const json = await res.json() as Record<string, { usd: number }>;
      return json[coinId]?.usd ?? 0;
    } catch {
      return 0;
    }
  }, 300);
}

// ─── Public ETF overview builders ────────────────────────────────────────────

export async function getBtcEtfOverview(): Promise<EtfOverview> {
  return cached('etf:btc:overview', async () => {
    const price = await fetchCoinPrice('bitcoin');
    const livePrice = price > 0 ? price : 85_000; // fallback

    const products: EtfWithAum[] = BTC_ETF_SEED.map((e) => ({
      ...e,
      aumUsd:      e.holdings * livePrice,
      marketShare: 0,
    }));
    const totalAumUsd   = products.reduce((s, p) => s + p.aumUsd, 0);
    const totalHoldings = products.reduce((s, p) => s + p.holdings, 0);

    products.forEach((p) => {
      p.marketShare = totalAumUsd > 0 ? (p.aumUsd / totalAumUsd) * 100 : 0;
    });

    products.sort((a, b) => b.aumUsd - a.aumUsd);

    return {
      products,
      totalAumUsd,
      coinPrice:    livePrice,
      totalHoldings,
      pctOfSupply:  (totalHoldings / 21_000_000) * 100,
      totalSupply:  21_000_000,
    };
  }, 300);
}

export async function getEthEtfOverview(): Promise<EtfOverview> {
  return cached('etf:eth:overview', async () => {
    const price = await fetchCoinPrice('ethereum');
    const livePrice = price > 0 ? price : 2_500;

    const products: EtfWithAum[] = ETH_ETF_SEED.map((e) => ({
      ...e,
      aumUsd:      e.holdings * livePrice,
      marketShare: 0,
    }));
    const totalAumUsd   = products.reduce((s, p) => s + p.aumUsd, 0);
    const totalHoldings = products.reduce((s, p) => s + p.holdings, 0);

    products.forEach((p) => {
      p.marketShare = totalAumUsd > 0 ? (p.aumUsd / totalAumUsd) * 100 : 0;
    });

    products.sort((a, b) => b.aumUsd - a.aumUsd);

    // ETH circulating supply ~120M
    return {
      products,
      totalAumUsd,
      coinPrice:    livePrice,
      totalHoldings,
      pctOfSupply:  (totalHoldings / 120_000_000) * 100,
      totalSupply:  120_000_000,
    };
  }, 300);
}
