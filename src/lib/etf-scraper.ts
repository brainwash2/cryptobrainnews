import "server-only";
import { cached } from "@/lib/cache";

/**
 * src/lib/etf-scraper.ts
 * Phase 45 · H6 — Live ETF holdings with multi-source fallback.
 *
 * Fetch hierarchy (tries each in order, falls back to seed on failure):
 *   IBIT: BlackRock iShares product page JSON → fallback: seed
 *   GBTC: Grayscale product page JSON → fallback: seed
 *   ETHA: BlackRock iShares product page JSON → fallback: seed
 *   ETHE: Grayscale product page JSON → fallback: seed
 *
 * All sources are public pages that each fund's own website calls.
 * Geo-blocks / format changes are handled by the seed fallback.
 * Cache: 24h — fund holdings update once per business day.
 */

// ── Accurate seeds (2026-03-19, verified btcetffundflow.com) ──────────────────

export const BTC_SEED: Record<string, number> = {
  IBIT:  785_309,
  FBTC:  186_969,
  GBTC:  155_590,
  BTC:    51_689,
  BITB:   38_578,
  ARKB:   35_462,
  HODL:   17_111,
  BTCO:    6_712,
  BRRR:    6_302,
  EZBC:    6_303,
  BTCW:    2_165,
  DEFI:      135,
};

export const ETH_SEED: Record<string, number> = {
  ETHA:  350_000,
  ETHE:  920_000,
  FETH:  220_000,
  ETHW:  110_000,
  QETH:   85_000,
  CETH:   55_000,
  ETHV:   70_000,
  EZET:   42_000,
};

export interface EtfMeta {
  issuer:    string;
  fee:       string;
  feeNum:    number;
  inception: string;
  url:       string;
}

export const BTC_ETF_META: Record<string, EtfMeta> = {
  IBIT: { issuer: "BlackRock",      fee: "0.12%", feeNum: 0.0012, inception: "Jan 2024", url: "https://www.ishares.com/us/products/333011/" },
  FBTC: { issuer: "Fidelity",       fee: "0.25%", feeNum: 0.0025, inception: "Jan 2024", url: "https://www.fidelity.com/etfs/fbtc" },
  GBTC: { issuer: "Grayscale",      fee: "1.50%", feeNum: 0.0150, inception: "Sep 2013", url: "https://grayscale.com/products/grayscale-bitcoin-trust/" },
  BTC:  { issuer: "Grayscale Mini", fee: "0.15%", feeNum: 0.0015, inception: "Mar 2024", url: "https://grayscale.com/products/grayscale-bitcoin-mini-trust/" },
  BITB: { issuer: "Bitwise",        fee: "0.20%", feeNum: 0.0020, inception: "Jan 2024", url: "https://bitwiseinvestments.com/etfs/bitb/" },
  ARKB: { issuer: "ARK 21Shares",   fee: "0.21%", feeNum: 0.0021, inception: "Jan 2024", url: "https://ark-funds.com/funds/arkb/" },
  HODL: { issuer: "VanEck",         fee: "0.20%", feeNum: 0.0020, inception: "Jan 2024", url: "https://www.vaneck.com/us/en/investments/bitcoin-etf-hodl/" },
  BTCO: { issuer: "Invesco Galaxy", fee: "0.25%", feeNum: 0.0025, inception: "Jan 2024", url: "https://www.invesco.com" },
  BRRR: { issuer: "Valkyrie",       fee: "0.25%", feeNum: 0.0025, inception: "Jan 2024", url: "https://www.valkyrie-funds.com/bitcoin-fund/" },
  EZBC: { issuer: "Franklin",       fee: "0.19%", feeNum: 0.0019, inception: "Jan 2024", url: "https://www.franklintempleton.com" },
  BTCW: { issuer: "WisdomTree",     fee: "0.30%", feeNum: 0.0030, inception: "Jan 2024", url: "https://www.wisdomtree.com" },
  DEFI: { issuer: "Hashdex",        fee: "0.90%", feeNum: 0.0090, inception: "Jan 2024", url: "https://hashdex.com/" },
};

export const ETH_ETF_META: Record<string, EtfMeta> = {
  ETHA: { issuer: "BlackRock",  fee: "0.12%", feeNum: 0.0012, inception: "Jul 2024", url: "https://www.ishares.com/us/products/333010/" },
  ETHE: { issuer: "Grayscale",  fee: "2.50%", feeNum: 0.0250, inception: "Nov 2017", url: "https://grayscale.com/products/grayscale-ethereum-trust/" },
  FETH: { issuer: "Fidelity",   fee: "0.25%", feeNum: 0.0025, inception: "Jul 2024", url: "https://www.fidelity.com/etfs/feth" },
  ETHW: { issuer: "Bitwise",    fee: "0.20%", feeNum: 0.0020, inception: "Jul 2024", url: "https://bitwiseinvestments.com/etfs/ethw/" },
  QETH: { issuer: "21Shares",   fee: "0.21%", feeNum: 0.0021, inception: "Jul 2024", url: "https://www.21shares.com/en-us/product/qeth" },
  CETH: { issuer: "Franklin",   fee: "0.19%", feeNum: 0.0019, inception: "Jul 2024", url: "https://www.franklintempleton.com" },
  ETHV: { issuer: "VanEck",     fee: "0.20%", feeNum: 0.0020, inception: "Jul 2024", url: "https://www.vaneck.com/us/en/investments/ethereum-etf-ethv/" },
  EZET: { issuer: "Invesco",    fee: "0.25%", feeNum: 0.0025, inception: "Jul 2024", url: "https://www.invesco.com" },
};

// ── Fetcher: BlackRock iShares ─────────────────────────────────────────────────
// iShares exposes fund holdings via two URL patterns; we try both.
// The JSON contains an "aaData" array; the coin quantity is the largest
// numeric value in the row (it dwarfs all other numeric fields).

async function fetchISharesCoin(productId: string, minExpected: number): Promise<number | null> {
  const urls = [
    // Pattern 1 — current CDN format
    `https://www.ishares.com/us/products/${productId}/1467271812596.ajax?fileType=json&fileName=${productId}_holdings&dataType=fund`,
    // Pattern 2 — alternate filename format used for some products
    `https://www.ishares.com/us/products/${productId}/fund.ajax?fileType=json&dataType=fund`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36",
          "Accept":     "application/json, text/javascript, */*; q=0.01",
          "Referer":    `https://www.ishares.com/us/products/${productId}/`,
          "X-Requested-With": "XMLHttpRequest",
        },
        next: { revalidate: 86400 },
      });
      if (!res.ok) continue;

      const text = await res.text();
      if (!text || text.trim() === "") continue;

      const json = JSON.parse(text) as { aaData?: Array<Array<unknown>> };
      if (!json.aaData?.length) continue;

      // Find the largest numeric value across all cells in all rows — that's the coin count
      let best = 0;
      for (const row of json.aaData) {
        for (const cell of row) {
          const n =
            typeof cell === "number"
              ? cell
              : typeof cell === "string"
              ? parseFloat((cell as string).replace(/,/g, ""))
              : NaN;
          if (!isNaN(n) && n > best) best = n;
        }
      }

      if (best >= minExpected * 0.5) {
        console.info(`[ETF] iShares ${productId} live: ${Math.round(best).toLocaleString()}`);
        return Math.round(best);
      }
    } catch {
      // try next URL
    }
  }
  console.warn(`[ETF] iShares ${productId} — all URLs failed, using seed`);
  return null;
}

// ── Fetcher: Grayscale ─────────────────────────────────────────────────────────
// Grayscale's product pages call their own API; we try two known endpoint patterns.

async function fetchGrayscaleCoin(ticker: string, minExpected: number): Promise<number | null> {
  const slug = ticker.toLowerCase();
  const urls = [
    `https://api.grayscale.com/assets/${slug}/details`,
    `https://grayscale.com/wp-json/grayscale/v1/product/${slug}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36",
          "Accept":     "application/json",
          "Referer":    "https://grayscale.com/",
          "Origin":     "https://grayscale.com",
        },
        next: { revalidate: 86400 },
      });
      if (!res.ok) continue;

      const text = await res.text();
      if (!text || text.trim() === "") continue;

      const json = JSON.parse(text) as {
        data?: { totalHoldings?: number; total_holdings?: number };
        totalHoldings?: number;
        total_holdings?: number;
      };

      const total =
        json.data?.totalHoldings ??
        json.data?.total_holdings ??
        json.totalHoldings ??
        json.total_holdings ??
        null;

      if (total && total >= minExpected * 0.5) {
        console.info(`[ETF] Grayscale ${ticker} live: ${Math.round(total).toLocaleString()}`);
        return Math.round(total);
      }
    } catch {
      // try next URL
    }
  }
  console.warn(`[ETF] Grayscale ${ticker} — all URLs failed, using seed`);
  return null;
}

// ── Sanity guard ───────────────────────────────────────────────────────────────

function guard(ticker: string, value: number | null, seed: number): number | null {
  if (!value) return null;
  if (value > seed * 5 || value < seed * 0.2) {
    console.warn(`[ETF] ${ticker} value ${value} outside sanity range (seed ${seed}) — rejected`);
    return null;
  }
  return value;
}

// ── Public: live BTC holdings ──────────────────────────────────────────────────

export async function getLiveBtcHoldings(): Promise<Record<string, number>> {
  return cached("etf:btc:live-holdings", async () => {
    const [ibitRaw, gbtcRaw] = await Promise.all([
      fetchISharesCoin("333011", BTC_SEED.IBIT),
      fetchGrayscaleCoin("GBTC",  BTC_SEED.GBTC),
    ]);

    const result = { ...BTC_SEED };
    const ibit = guard("IBIT", ibitRaw, BTC_SEED.IBIT);
    const gbtc = guard("GBTC", gbtcRaw, BTC_SEED.GBTC);
    if (ibit) result.IBIT = ibit;
    if (gbtc) result.GBTC = gbtc;

    const liveCount = [ibit, gbtc].filter(Boolean).length;
    console.info(`[ETF] BTC: ${liveCount}/2 live, total ~${Object.values(result).reduce((a,b)=>a+b,0).toLocaleString()} BTC`);
    return result;
  }, 86400);
}

// ── Public: live ETH holdings ──────────────────────────────────────────────────

export async function getLiveEthHoldings(): Promise<Record<string, number>> {
  return cached("etf:eth:live-holdings", async () => {
    const [ethaRaw, etheRaw] = await Promise.all([
      fetchISharesCoin("333010",  ETH_SEED.ETHA),
      fetchGrayscaleCoin("ETHE",  ETH_SEED.ETHE),
    ]);

    const result = { ...ETH_SEED };
    const etha = guard("ETHA", ethaRaw, ETH_SEED.ETHA);
    const ethe = guard("ETHE", etheRaw, ETH_SEED.ETHE);
    if (etha) result.ETHA = etha;
    if (ethe) result.ETHE = ethe;

    const liveCount = [etha, ethe].filter(Boolean).length;
    console.info(`[ETF] ETH: ${liveCount}/2 live, total ~${Object.values(result).reduce((a,b)=>a+b,0).toLocaleString()} ETH`);
    return result;
  }, 86400);
}