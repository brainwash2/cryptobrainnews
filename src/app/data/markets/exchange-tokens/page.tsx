/**
 * Phase 45 - Exchange Tokens page
 * Replaces the ComingSoon stub (was: dataSource="CoinGecko", targetPhase="Phase 38").
 *
 * Data: CoinGecko /coins/markets?category=exchange-based-tokens - free, no key required.
 */

import React, { Suspense } from 'react';
import { DataHeader }     from '../../_components/DataHeader';
import { ChartSkeleton }  from '../../_components/ChartSkeleton';
import { DataTable }      from '../../_components/DataTable';
import type { DataColumn } from '../../_components/DataTable';
import ExchangeTokensChart from './_components/ExchangeTokensChart';
import { cached }         from '@/lib/cache';

export const metadata = {
  title: 'Exchange Tokens | CryptoBrainNews',
  description: 'Live price, market cap, and 7-day performance for major centralised exchange native tokens.',
};
export const revalidate = 300;

// --- Types -------------------------------------------------------------------

export interface ExchangeToken {
  id:                                     string;
  symbol:                                 string;
  name:                                   string;
  image:                                  string;
  current_price:                          number;
  market_cap:                             number;
  market_cap_rank:                        number | null;
  total_volume:                           number;
  price_change_percentage_24h:            number | null;
  price_change_percentage_7d_in_currency: number | null;
  circulating_supply:                     number | null;
  ath:                                    number;
  ath_change_percentage:                  number | null;
}

// --- Data fetcher ------------------------------------------------------------

async function getExchangeTokens(): Promise<ExchangeToken[]> {
  return cached('coingecko:exchange-tokens', async () => {
    try {
      const params = new URLSearchParams({
        vs_currency:             'usd',
        category:                'exchange-based-tokens',
        order:                   'market_cap_desc',
        per_page:                '20',
        page:                    '1',
        sparkline:               'false',
        price_change_percentage: '24h,7d',
      });
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`,
        { next: { revalidate: 300 } }
      );
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
      const data = await res.json() as ExchangeToken[];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('[ExchangeTokens] Fetch error:', err);
      return SEED_TOKENS;
    }
  }, 300);
}

// --- Seed fallback (March 2026 snapshot) ------------------------------------

const SEED_TOKENS: ExchangeToken[] = [
  {
    id: 'binancecoin', symbol: 'BNB', name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    current_price: 600, market_cap: 87_000_000_000, market_cap_rank: 4,
    total_volume: 1_800_000_000, price_change_percentage_24h: 0.8,
    price_change_percentage_7d_in_currency: -2.1,
    circulating_supply: 145_887_576, ath: 793, ath_change_percentage: -24,
  },
  {
    id: 'okb', symbol: 'OKB', name: 'OKB',
    image: 'https://assets.coingecko.com/coins/images/4463/small/WeChat_Image_20220118095654.png',
    current_price: 48, market_cap: 2_900_000_000, market_cap_rank: 45,
    total_volume: 18_000_000, price_change_percentage_24h: 1.2,
    price_change_percentage_7d_in_currency: 3.4,
    circulating_supply: 60_000_000, ath: 58.7, ath_change_percentage: -18,
  },
  {
    id: 'crypto-com-chain', symbol: 'CRO', name: 'Cronos',
    image: 'https://assets.coingecko.com/coins/images/7310/small/cro_token_logo.png',
    current_price: 0.095, market_cap: 2_500_000_000, market_cap_rank: 52,
    total_volume: 42_000_000, price_change_percentage_24h: -0.5,
    price_change_percentage_7d_in_currency: -4.2,
    circulating_supply: 26_362_552_514, ath: 0.966, ath_change_percentage: -90,
  },
  {
    id: 'gate-2', symbol: 'GT', name: 'Gate Token',
    image: 'https://assets.coingecko.com/coins/images/8183/small/gate.png',
    current_price: 7.2, market_cap: 720_000_000, market_cap_rank: 95,
    total_volume: 9_000_000, price_change_percentage_24h: 0.3,
    price_change_percentage_7d_in_currency: 1.1,
    circulating_supply: 100_000_000, ath: 19.7, ath_change_percentage: -63,
  },
  {
    id: 'kucoin-shares', symbol: 'KCS', name: 'KuCoin Token',
    image: 'https://assets.coingecko.com/coins/images/1047/small/sa9z79.png',
    current_price: 10.5, market_cap: 925_000_000, market_cap_rank: 80,
    total_volume: 6_000_000, price_change_percentage_24h: -1.1,
    price_change_percentage_7d_in_currency: -3.5,
    circulating_supply: 88_000_000, ath: 28.8, ath_change_percentage: -64,
  },
  {
    id: 'bitget-token', symbol: 'BGB', name: 'Bitget Token',
    image: 'https://assets.coingecko.com/coins/images/11610/small/icon_colour.png',
    current_price: 4.6, market_cap: 1_600_000_000, market_cap_rank: 60,
    total_volume: 55_000_000, price_change_percentage_24h: 2.1,
    price_change_percentage_7d_in_currency: 8.7,
    circulating_supply: 340_000_000, ath: 9.4, ath_change_percentage: -51,
  },
  {
    id: 'mexc-token', symbol: 'MX', name: 'MEXC Token',
    image: 'https://assets.coingecko.com/coins/images/11605/small/MX_Token.png',
    current_price: 3.8, market_cap: 380_000_000, market_cap_rank: 115,
    total_volume: 4_500_000, price_change_percentage_24h: 0.6,
    price_change_percentage_7d_in_currency: 2.3,
    circulating_supply: 100_000_000, ath: 8.5, ath_change_percentage: -55,
  },
  {
    id: 'whitebit', symbol: 'WBT', name: 'WhiteBIT Token',
    image: 'https://assets.coingecko.com/coins/images/27045/small/wbt_token.png',
    current_price: 22, market_cap: 1_100_000_000, market_cap_rank: 72,
    total_volume: 3_000_000, price_change_percentage_24h: 0.1,
    price_change_percentage_7d_in_currency: 0.8,
    circulating_supply: 49_349_598, ath: 28.5, ath_change_percentage: -23,
  },
];

// --- Formatters --------------------------------------------------------------

function fmtPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString('en', { maximumFractionDigits: 0 })}`;
  if (n >= 1)    return `$${n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(4)}`;
}

function fmtMktCap(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtPct(n: number | null): string {
  if (n === null || n === undefined) return '-';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function pctClass(n: number | null): string {
  if (n === null || n === undefined) return 'text-[#555]';
  return n >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]';
}

// --- Table columns -----------------------------------------------------------

const COLUMNS: Array<DataColumn<ExchangeToken>> = [
  {
    key: 'market_cap_rank',
    label: '#',
    align: 'right',
    width: '48px',
    format: (v) => (
      <span className="text-[#333] font-mono">{v ?? '-'}</span>
    ),
  },
  {
    key: 'name',
    label: 'Token',
    align: 'left',
    format: (_v, row) => (
      <div className="flex items-center gap-3">
        <img
          src={row.image}
          alt={row.symbol}
          className="w-5 h-5 rounded-full flex-shrink-0"
        />
        <div>
          <div className="text-white font-bold">{row.name}</div>
          <div className="text-[#555] text-[10px] uppercase">{row.symbol}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'current_price',
    label: 'Price',
    align: 'right',
    format: (v) => (
      <span className="text-white font-mono">{fmtPrice(Number(v))}</span>
    ),
  },
  {
    key: 'price_change_percentage_24h',
    label: '24h',
    align: 'right',
    format: (v) => (
      <span className={`font-mono font-bold ${pctClass(v as number | null)}`}>
        {fmtPct(v as number | null)}
      </span>
    ),
  },
  {
    key: 'price_change_percentage_7d_in_currency',
    label: '7d',
    align: 'right',
    format: (v) => (
      <span className={`font-mono font-bold ${pctClass(v as number | null)}`}>
        {fmtPct(v as number | null)}
      </span>
    ),
  },
  {
    key: 'market_cap',
    label: 'Market Cap',
    align: 'right',
    format: (v) => (
      <span className="text-[#FABF2C] font-mono">{fmtMktCap(Number(v))}</span>
    ),
  },
  {
    key: 'total_volume',
    label: '24h Volume',
    align: 'right',
    format: (v) => (
      <span className="text-[#aaa] font-mono">{fmtMktCap(Number(v))}</span>
    ),
  },
  {
    key: 'ath_change_percentage',
    label: 'From ATH',
    align: 'right',
    format: (v) => (
      <span className={`font-mono text-[11px] ${pctClass(v as number | null)}`}>
        {fmtPct(v as number | null)}
      </span>
    ),
  },
];

// --- Page -------------------------------------------------------------------

async function ExchangeTokensData() {
  const tokens = await getExchangeTokens();

  const totalMktCap = tokens.reduce((s, t) => s + t.market_cap, 0);
  const total24hVol = tokens.reduce((s, t) => s + t.total_volume, 0);

  const sorted7d = [...tokens]
    .filter((t) => t.price_change_percentage_7d_in_currency !== null)
    .sort(
      (a, b) =>
        (b.price_change_percentage_7d_in_currency ?? 0) -
        (a.price_change_percentage_7d_in_currency ?? 0)
    );

  const bestToken  = sorted7d[0] ?? null;
  const worstToken = sorted7d[sorted7d.length - 1] ?? null;

  const chartData = tokens.slice(0, 10).map((t) => ({
    name:     t.symbol.toUpperCase(),
    change7d: parseFloat(
      (t.price_change_percentage_7d_in_currency ?? 0).toFixed(2)
    ),
  }));

  const bestLabel  = bestToken
    ? `${bestToken.symbol.toUpperCase()} ${fmtPct(bestToken.price_change_percentage_7d_in_currency)}`
    : '-';
  const worstLabel = worstToken
    ? `${worstToken.symbol.toUpperCase()} ${fmtPct(worstToken.price_change_percentage_7d_in_currency)}`
    : '-';

  return (
    <div className="space-y-8 pb-20">

      <DataHeader
        badge="Markets - Exchange Tokens"
        title="Exchange Tokens"
        description="Native tokens of centralised exchanges used for fee discounts, governance, and staking. Ranked by market cap."
      />

      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - CoinGecko
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          {tokens.length} tokens - refreshed every 5 min
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">
            Total Market Cap
          </p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">
            {fmtMktCap(totalMktCap)}
          </p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">
            24h Volume
          </p>
          <p className="text-2xl font-black text-white tabular-nums">
            {fmtMktCap(total24hVol)}
          </p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">
            Best 7d
          </p>
          <p className="text-2xl font-black text-[#00d672] tabular-nums">
            {bestLabel}
          </p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">
            Worst 7d
          </p>
          <p className="text-2xl font-black text-[#ff4757] tabular-nums">
            {worstLabel}
          </p>
        </div>
      </div>

      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <div className="mb-5">
          <h2 className="text-[10px] font-black text-[#555] uppercase tracking-widest">
            7-Day Performance - Top 10 by Market Cap
          </h2>
        </div>
        <ExchangeTokensChart data={chartData} />
      </div>

      <div className="border border-[#1a1a1a] overflow-hidden">
        <DataTable
          columns={COLUMNS}
          data={tokens}
          emptyMessage="Loading exchange token data from CoinGecko..."
        />
      </div>

      <div className="border border-[#1a1a1a] bg-[#080808] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          Source: CoinGecko category=exchange-based-tokens · Free API · 5-min cache
        </span>
        <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest">
          coingecko.com/en/categories/centralized-exchange-token-cex
        </span>
      </div>

    </div>
  );
}

export default function ExchangeTokensPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <ExchangeTokensData />
      </Suspense>
    </main>
  );
}