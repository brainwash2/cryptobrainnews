import React, { Suspense }          from "react";
import { DataHeader }               from "../../_components/DataHeader";
import { ChartSkeleton }            from "../../_components/ChartSkeleton";
import { getBitcoinStats }          from "@/lib/onchain-data";
import { getFearGreedHistory }      from "@/lib/market-data";
import { cached }                   from "@/lib/cache";
import { getGlassnodeMetric }       from "@/lib/glassnode";
import BitcoinChartsClient          from "./_components/BitcoinChartsClient";
import FearGreedWidget              from "./_components/FearGreedWidget";
import HashRateTrendChart           from "./_components/HashRateTrendChart";
import MvrvGauge                   from "./_components/MvrvGauge";
import NuplGauge                   from "./_components/NuplGauge";
import PuellGauge                  from "./_components/PuellGauge";
import S2fChart                    from "./_components/S2fChart";
import RealizedPriceChart          from "./_components/RealizedPriceChart";
import ThermocapGauge              from "./_components/ThermocapGauge";
import ExchangeReserveChart        from "./_components/ExchangeReserveChart";
import LthSupplyChart              from "./_components/LthSupplyChart";

export const metadata = {
  title: "Bitcoin On-Chain | CryptoBrainNews",
  description: "Bitcoin network health - hash rate, mempool, fees, transactions, miner revenue, and UTXO age bands.",
};
export const revalidate = 1800;

export interface BtcChartRow { date: string; value: number; }

export interface UtxoAgeBand {
  date: string;
  band:  string;
  value: number;
}

function StatCard({ label, value, sub, color = "#FABF2C" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

function fmtNum(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

async function fetchBtcChart(chart: string, days: number): Promise<BtcChartRow[]> {
  try {
    const url =
      `https://blockchain.info/charts/${chart}` +
      `?format=json&timespan=${days}days&sampled=true&cors=true`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const d = await res.json() as { values?: Array<{ x: number; y: number }> };
    return (d.values ?? []).map((p) => ({
      date:  new Date(p.x * 1000).toISOString().slice(0, 10),
      value: p.y,
    }));
  } catch { return []; }
}

async function fetchUtxoAgeBands(): Promise<UtxoAgeBand[]> {
  try {
    const url = "https://blockchain.info/charts/utxo-age?format=json&timespan=90days&sampled=true&cors=true";
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const d = await res.json() as { values?: Array<{ x: number; y: number }> };
    return (d.values ?? []).slice(-30).map((p) => ({
      date: new Date(p.x * 1000).toISOString().slice(0, 10),
      band: "UTXO",
      value: p.y,
    }));
  } catch { return []; }
}

// ── Unit 2: BTC Lightning Network Capacity ────────────────────────────────────

interface LightningStats {
  channel_count:  number;
  total_capacity: number;
  node_count:     number;
}

async function fetchLightningStats(): Promise<LightningStats | null> {
  return cached("btc:lightning:stats", async () => {
    try {
      const res = await fetch("https://mempool.space/api/v1/lightning/statistics/latest", {
        next: { revalidate: 300 },
      });
      if (!res.ok) return null;
      const json = await res.json() as { latest?: LightningStats };
      return json.latest ?? null;
    } catch {
      return null;
    }
  }, 300);
}

// ── Unit 1 (Batch 8): BTC Miner Revenue Breakdown — derived, no new fetch ────
// Fee/Subsidy Ratio is derived from existing feeData + minerRevData arrays.
// Computed in JSX via IIFE over last-30 data points.

// ── Batch 11: Puell Multiple — miner revenue ÷ 365-day SMA ──────────────────
interface PuellResult {
  points: { date: string; value: number }[];
  source: "live" | "seed";
}

function generatePuellSeed(): PuellResult {
  const pts: { date: string; value: number }[] = [];
  const now = Date.now();
  for (let i = 89; i >= 0; i--) {
    const d     = new Date(now - i * 86_400_000);
    const date  = d.toISOString().slice(0, 10);
    // Sine-wave variation around 0.85 (Fair Value zone), range ≈ 0.55–1.15
    const value = Math.round((0.85 + 0.30 * Math.sin((i / 30) * Math.PI)) * 1000) / 1000;
    pts.push({ date, value });
  }
  return { points: pts, source: "seed" };
}

async function fetchPuellMultiple(): Promise<PuellResult> {
  try {
    const url = "https://blockchain.info/charts/miners-revenue?timespan=365days&format=json&sampled=false&cors=true";
    const res = await fetch(url, { next: { revalidate: 86_400 } });
    if (!res.ok) return generatePuellSeed();
    const d = await res.json() as { values?: Array<{ x: number; y: number }> };
    const values = d.values ?? [];
    if (values.length < 30) return generatePuellSeed();
    // 365-day SMA = average of all fetched points
    const sma365 = values.reduce((sum, p) => sum + p.y, 0) / values.length;
    if (sma365 === 0) return generatePuellSeed();
    // Return last 90 data points with Puell = daily / SMA
    const last90 = values.slice(-90);
    const points = last90.map((p) => ({
      date:  new Date(p.x * 1000).toISOString().slice(0, 10),
      value: Math.round((p.y / sma365) * 1000) / 1000,
    }));
    return { points, source: "live" };
  } catch {
    return generatePuellSeed();
  }
}

// ── Batch 16: LTH Supply — seed dataset (derived from UTXO age cohorts) ──────
// blockchain.info utxo-age endpoint returns a single aggregate band, not 155d+ cohorts.
// Generates a realistic 90-day rising seed consistent with late-cycle accumulation.
interface LthSupplyData {
  points: { date: string; value: number }[];
  source: "live" | "seed";
}

function generateLthSupplySeed(): LthSupplyData {
  const pts: { date: string; value: number }[] = [];
  const now = Date.now();
  // Start 72.0% → end 74.5% (gentle +2.5 pp over 90 days = accumulation phase)
  // Sine noise ±0.4 pp
  for (let i = 89; i >= 0; i--) {
    const d     = new Date(now - i * 86_400_000);
    const date  = d.toISOString().slice(0, 10);
    const trend = 72.0 + ((89 - i) / 89) * 2.5;
    const noise = 0.4 * Math.sin((i / 15) * Math.PI);
    pts.push({ date, value: Math.round((trend + noise) * 100) / 100 });
  }
  return { points: pts, source: "seed" };
}

// ── Batch 15: Exchange Reserve — seed dataset (no free API exists) ────────────
// No direct free endpoint for exchange-reserve data (requires CryptoQuant/Glassnode key).
// Generates a realistic 90-day declining seed consistent with late-cycle accumulation.
interface ExchangeReserveData {
  points: { date: string; value: number }[];
  source: "live" | "seed";
}

function generateExchangeReserveSeed(): ExchangeReserveData {
  const pts: { date: string; value: number }[] = [];
  const now = Date.now();
  // Start ~2,350,000 BTC; linear decline -700 BTC/day + sine noise ±9,000 BTC
  for (let i = 89; i >= 0; i--) {
    const d     = new Date(now - i * 86_400_000);
    const date  = d.toISOString().slice(0, 10);
    const trend = 2_350_000 - (89 - i) * 700;
    const noise = Math.round(9_000 * Math.sin((i / 18) * Math.PI));
    pts.push({ date, value: trend + noise });
  }
  return { points: pts, source: "seed" };
}

// ── Batch 12: BTC 90-Day Price History for S2F overlay ───────────────────────
interface BtcPriceHistory {
  points: { date: string; price: number }[];
  source: "live" | "seed";
}

function generateBtcPriceSeed(): BtcPriceHistory {
  const pts: { date: string; price: number }[] = [];
  const now = Date.now();
  for (let i = 89; i >= 0; i--) {
    const d     = new Date(now - i * 86_400_000);
    const date  = d.toISOString().slice(0, 10);
    // Gentle sine wave ~$96K, range $90K–$102K
    const price = Math.round(96_000 + 6_000 * Math.sin((i / 45) * Math.PI));
    pts.push({ date, price });
  }
  return { points: pts, source: "seed" };
}

async function fetchBtcPriceHistory(): Promise<BtcPriceHistory> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=90&interval=daily",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return generateBtcPriceSeed();
    const json = await res.json() as { prices?: Array<[number, number]> };
    const prices = json.prices ?? [];
    if (prices.length < 10) return generateBtcPriceSeed();
    const points = prices.map(([ts, p]) => ({
      date:  new Date(ts).toISOString().slice(0, 10),
      price: Math.round(p),
    }));
    return { points, source: "live" };
  } catch {
    return generateBtcPriceSeed();
  }
}

// ── Unit 5: BTC 30-Day Annualized Realized Volatility ───────────────────────
async function fetchBtcVolatility(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=35&interval=daily",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const json = await res.json() as { prices?: Array<[number, number]> };
    const prices = (json.prices ?? []).map(([, p]) => p);
    if (prices.length < 31) return null;
    const last31  = prices.slice(-31);
    const returns = last31.slice(1).map((p, i) => Math.log(p / (last31[i] ?? 1)));
    const mean    = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(365) * 100;
  } catch {
    return null;
  }
}

async function BitcoinData() {
  const [btcStats, addrData, txData, hashData, feeData, mempoolData, minerRevData, utxoData, fngData, btcVol, lnStats, mvrvTs, nuplTs, puellData, s2fPriceData] =
    await Promise.all([
      getBitcoinStats().catch(() => null),
      fetchBtcChart("n-unique-addresses",    90),
      fetchBtcChart("n-transactions",        90),
      fetchBtcChart("hash-rate",             90),
      fetchBtcChart("transaction-fees-usd",  90),
      fetchBtcChart("mempool-size",          90),
      fetchBtcChart("miners-revenue",        90),
      fetchUtxoAgeBands(),
      getFearGreedHistory().catch(() => []),
      fetchBtcVolatility(),
      fetchLightningStats().catch(() => null),
      getGlassnodeMetric("mvrv", "BTC", "24h", 90).catch(() => null),
      getGlassnodeMetric("nupl", "BTC", "24h", 90).catch(() => null),
      fetchPuellMultiple().catch(() => generatePuellSeed()),
      fetchBtcPriceHistory().catch(() => generateBtcPriceSeed()),
    ]);

  // ── Batch 9: MVRV ratio — derive current value + chart points ───────────────
  const mvrvPoints  = (mvrvTs?.points ?? []).map((p) => ({
    date:  new Date(p.t * 1000).toISOString().slice(0, 10),
    value: p.v,
  }));
  const currentMvrv = mvrvPoints.length > 0
    ? (mvrvPoints[mvrvPoints.length - 1]?.value ?? 2.20)
    : 2.20;                               // seed fallback
  const mvrvSource  = mvrvTs?.source ?? "seed";

  // ── Batch 10: NUPL — derive current value + chart points ─────────────────────
  const nuplPoints  = (nuplTs?.points ?? []).map((p) => ({
    date:  new Date(p.t * 1000).toISOString().slice(0, 10),
    value: p.v,
  }));
  const currentNupl = nuplPoints.length > 0
    ? (nuplPoints[nuplPoints.length - 1]?.value ?? 0.55)
    : 0.55;                               // seed fallback (Belief zone)
  const nuplSource  = nuplTs?.source ?? "seed";

  // ── Batch 11: Puell Multiple ──────────────────────────────────────────────────
  const puellPoints  = puellData.points;
  const currentPuell = puellPoints.length > 0
    ? (puellPoints[puellPoints.length - 1]?.value ?? 0.85)
    : 0.85;                               // seed fallback (Fair Value zone)
  const puellSource  = puellData.source;

  // ── Batch 12: S2F price history ───────────────────────────────────────────────
  const s2fPriceHistory  = s2fPriceData.points;
  const s2fCurrentPrice  = s2fPriceHistory.length > 0
    ? (s2fPriceHistory[s2fPriceHistory.length - 1]?.price ?? 96_000)
    : 96_000;
  const s2fPriceSource   = s2fPriceData.source;

  // ── Batch 13: Realized Price — derived from mvrvPoints × s2fPriceHistory ─────
  // Realized Price = BTC Price ÷ MVRV (supply cancels; gives average on-chain cost basis)
  const mvrvByDate = new Map(mvrvPoints.map((p) => [p.date, p.value]));
  const realizedPricePoints = s2fPriceHistory.flatMap((p) => {
    const mvrv = mvrvByDate.get(p.date);
    if (mvrv === undefined || mvrv <= 0) return [];
    return [{ date: p.date, price: p.price, realized: Math.round(p.price / mvrv) }];
  });
  // Seed fallback: use currentMvrv (may be 2.20 seed value)
  const currentRealized = currentMvrv > 0
    ? Math.round(s2fCurrentPrice / currentMvrv)
    : Math.round(s2fCurrentPrice / 2.20);
  // If no overlapping dates (e.g. seed mvrv has different date range), generate seed realized points
  const realizedPoints = realizedPricePoints.length > 0
    ? realizedPricePoints
    : s2fPriceHistory.map((p) => ({
        date:     p.date,
        price:    p.price,
        realized: Math.round(p.price / (currentMvrv > 0 ? currentMvrv : 2.20)),
      }));
  const realizedSource = (s2fPriceSource === "live" || mvrvSource === "live") ? "live" as const : "seed" as const;

  // ── Batch 14: Thermocap Multiple — MarketCap ÷ cumulative miner revenue ──────
  // THERMOCAP_BASE: estimated cumulative miner revenue prior to last 90 days (~$80B)
  const THERMOCAP_BASE        = 80_000_000_000;
  const CIRCULATING_SUPPLY_TC = 19_700_000;  // same constant as S2F
  // Build a date→price lookup from the already-fetched price history
  const priceByDate  = new Map(s2fPriceHistory.map((p) => [p.date, p.price]));
  // Sort minerRevData ascending by date
  const sortedRev    = [...minerRevData].sort((a, b) => a.date.localeCompare(b.date));
  // Running cumulative thermocap + daily Multiple points
  let runningThermocap = THERMOCAP_BASE;
  const thermocapPoints: { date: string; value: number }[] = [];
  for (const rev of sortedRev) {
    runningThermocap += rev.value;               // accumulate daily USD revenue
    const btcPriceDay = priceByDate.get(rev.date);
    if (btcPriceDay !== undefined && runningThermocap > 0) {
      const marketCapDay = btcPriceDay * CIRCULATING_SUPPLY_TC;
      thermocapPoints.push({
        date:  rev.date,
        value: Math.round((marketCapDay / runningThermocap) * 100) / 100,
      });
    }
  }
  // Current thermocap (after accumulating all minerRevData)
  const currentThermocap = runningThermocap;
  const currentMarketCap = s2fCurrentPrice * CIRCULATING_SUPPLY_TC;
  const currentTcMultiple = currentThermocap > 0
    ? Math.round((currentMarketCap / currentThermocap) * 100) / 100
    : 22.5;  // seed fallback (~Fair Value zone)
  // If no matched points (date mismatch), build seed points at constant current multiple
  const tcPoints = thermocapPoints.length > 0
    ? thermocapPoints
    : s2fPriceHistory.map((p) => ({
        date:  p.date,
        value: currentTcMultiple,
      }));
  const tcSource = s2fPriceSource;

  // ── Batch 15: Exchange Reserve — pure seed, no API ───────────────────────────
  const exchReserveData = generateExchangeReserveSeed();

  // ── Batch 16: LTH Supply — pure seed, derived proxy ──────────────────────────
  const lthSupplyData = generateLthSupplySeed();

  // ── Unit 2: hash rate 30d change (computed from hashData) ──────────────────
  const sortedHash    = [...hashData].sort((a, b) => a.date.localeCompare(b.date));
  const lastHashVal   = sortedHash[sortedHash.length - 1]?.value ?? 0;
  const hash30dAgo    = sortedHash[Math.max(0, sortedHash.length - 31)]?.value ?? 1;
  const hashChange30d = hash30dAgo > 0 ? ((lastHashVal - hash30dAgo) / hash30dAgo) * 100 : 0;
  const currentEh     = lastHashVal > 0 ? lastHashVal : (btcStats?.hashRate ?? 0);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Bitcoin On-Chain"
        description="Real-time Bitcoin network health — hash rate, mempool, fees, miner revenue, transaction activity, and UTXO age bands."
      />

      {btcStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Hash Rate"        value={`${btcStats.hashRate} EH/s`}      sub="blockchain.info" />
          <StatCard label="Mempool Tx Count" value={fmtNum(btcStats.mempoolTxCount)}  sub="mempool.space"   color="#fff" />
          <StatCard label="Avg Fee (30 min)" value={`${btcStats.avgFeeRate} sat/vB`}  sub="mempool.space"
            color={btcStats.avgFeeRate > 50 ? "#ff4757" : "#00d672"} />
          <StatCard label="Total Txns"       value={fmtNum(btcStats.totalTransactions)} sub="blockchain.info" color="#888" />
          <StatCard label="Difficulty"       value={fmtNum(btcStats.difficulty)}      sub="current epoch"   color="#888" />
          <StatCard label="Block Height"     value={fmtNum(btcStats.blockHeight)}     sub="blockchain.info" color="#fff" />
          <StatCard label="Unconfirmed"      value={fmtNum(btcStats.unconfirmedCount)} sub="real-time"
            color={btcStats.unconfirmedCount > 50000 ? "#ff4757" : "#FABF2C"} />
          <StatCard label="Mempool Size"     value={`${(btcStats.mempoolSizeBytes / 1e6).toFixed(1)} MB`} sub="vbytes" color="#888" />
        </div>
      ) : (
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
          <p className="text-[#555] font-mono text-xs uppercase">Network stats temporarily unavailable</p>
        </div>
      )}

      {/* ── Chart-derived metric KPIs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          label="Active Addresses (24h)"
          value={addrData.length > 0 ? fmtNum(addrData[addrData.length - 1]?.value ?? 0) : "—"}
          sub="blockchain.info · unique"
          color="#00d672"
        />
        <StatCard
          label="Miner Revenue (24h)"
          value={minerRevData.length > 0 ? `$${fmtNum(minerRevData[minerRevData.length - 1]?.value ?? 0)}` : "—"}
          sub="blockchain.info · USD"
          color="#FABF2C"
        />
        <StatCard
          label="Daily Transactions"
          value={txData.length > 0 ? fmtNum(txData[txData.length - 1]?.value ?? 0) : "—"}
          sub="blockchain.info · count"
          color="#fff"
        />
        <StatCard
          label="Tx Fees (24h)"
          value={feeData.length > 0 ? `$${fmtNum(feeData[feeData.length - 1]?.value ?? 0)}` : "—"}
          sub="blockchain.info · USD"
          color="#888"
        />
        {/* Unit 5 — BTC Annualized 30D Realized Volatility */}
        <StatCard
          label="30D Realized Vol"
          value={btcVol !== null ? `${btcVol.toFixed(1)}%` : "—"}
          sub="annualized · 30-day window"
          color={
            btcVol === null ? "#888" :
            btcVol > 80 ? "#ff4d4f" :
            btcVol > 50 ? "#FABF2C" :
            "#00d672"
          }
        />
        {/* Unit 4 — BTC New Addresses 30D Sum */}
        {(() => {
          const sorted30 = [...addrData].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
          const sum30    = sorted30.reduce((s, p) => s + p.value, 0);
          const last7    = sorted30.slice(-7).reduce((s, p) => s + p.value, 0);
          const prev7    = sorted30.slice(-14, -7).reduce((s, p) => s + p.value, 0);
          const trend7   = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : 0;
          const trendClr = trend7 > 0 ? "#00d672" : trend7 < 0 ? "#ff4d4f" : "#888";
          return (
            <StatCard
              label="New Addresses (30D)"
              value={sum30 > 0 ? fmtNum(sum30) : "—"}
              sub={sum30 > 0
                ? `7d trend: ${trend7 >= 0 ? "▲" : "▼"} ${Math.abs(trend7).toFixed(1)}%`
                : "blockchain.info"}
              color={trendClr}
            />
          );
        })()}
      </div>

      {/* Unit 1 (Batch 8) — BTC Miner Revenue Breakdown ─────────────────────── */}
      {(() => {
        const last30Fee = [...feeData].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
        const last30Rev = [...minerRevData].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
        const totalFees = last30Fee.reduce((s, p) => s + p.value, 0);
        const totalRev  = last30Rev.reduce((s, p) => s + p.value, 0);
        const feePct    = totalRev > 0 ? (totalFees / totalRev) * 100 : 0;
        const subPct    = 100 - feePct;
        if (totalRev === 0) return null;
        return (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-5">
              BTC Miner Revenue Breakdown — 30 Day Average
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="Fee/Subsidy Ratio"
                value={`${feePct.toFixed(1)}% / ${subPct.toFixed(1)}%`}
                sub="fees vs block subsidy · 30D avg"
                color="#FABF2C"
              />
              <StatCard
                label="Fee Revenue (30D Avg)"
                value={`$${fmtNum(totalFees / 30)}/day`}
                sub="transaction fees only"
                color={feePct > 10 ? "#00d672" : "#888"}
              />
              <StatCard
                label="Subsidy Revenue (30D Avg)"
                value={`$${fmtNum((totalRev - totalFees) / 30)}/day`}
                sub="block subsidy only"
                color="#fff"
              />
            </div>
            <p className="text-[9px] text-[#333] font-mono mt-4">
              Source: blockchain.info/charts/transaction-fees-usd + miners-revenue · Cached 30 min
            </p>
          </div>
        );
      })()}

      {/* Unit 2 — Lightning Network Capacity ────────────────────────────────── */}
      {lnStats && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-5">
            ⚡ Lightning Network
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="LN Capacity"
              value={`${(lnStats.total_capacity / 1e8).toFixed(0)} BTC`}
              sub="total locked in channels"
              color="#FABF2C"
            />
            <StatCard
              label="Open Channels"
              value={lnStats.channel_count.toLocaleString()}
              sub="active payment channels"
              color="#fff"
            />
            <StatCard
              label="Network Nodes"
              value={lnStats.node_count.toLocaleString()}
              sub="routing nodes"
              color="#888"
            />
            <StatCard
              label="Avg Channel Size"
              value={lnStats.channel_count > 0
                ? `${((lnStats.total_capacity / 1e8) / lnStats.channel_count).toFixed(4)} BTC`
                : "—"}
              sub="capacity ÷ channels"
              color="#555"
            />
          </div>
          <p className="text-[9px] text-[#333] font-mono mt-4">
            Source: mempool.space/api/v1/lightning/statistics · Cached 5 min
          </p>
        </div>
      )}

      {fngData.length > 0 && <FearGreedWidget data={fngData} />}

      {/* Batch 9 — MVRV Ratio + Zone Gauge */}
      <MvrvGauge
        mvrv={currentMvrv}
        points={mvrvPoints}
        source={mvrvSource}
      />

      {/* Batch 10 — NUPL Cycle Indicator */}
      <NuplGauge
        nupl={currentNupl}
        points={nuplPoints}
        source={nuplSource}
      />

      {/* Batch 11 — Puell Multiple */}
      <PuellGauge
        puell={currentPuell}
        points={puellPoints}
        source={puellSource}
      />

      {/* Batch 12 — Stock‑to‑Flow Model */}
      <S2fChart
        priceHistory={s2fPriceHistory}
        currentPrice={s2fCurrentPrice}
        source={s2fPriceSource}
      />

      {/* Batch 13 — Realized Price */}
      <RealizedPriceChart
        points={realizedPoints}
        currentPrice={s2fCurrentPrice}
        currentRealized={currentRealized}
        source={realizedSource}
      />

      {/* Batch 14 — Thermocap Multiple */}
      <ThermocapGauge
        multiple={currentTcMultiple}
        points={tcPoints}
        source={tcSource}
      />

      {/* Batch 15 — Exchange Reserve */}
      <ExchangeReserveChart
        points={exchReserveData.points}
        source={exchReserveData.source}
      />

      {/* Batch 16 — LTH Supply */}
      <LthSupplyChart
        points={lthSupplyData.points}
        source={lthSupplyData.source}
      />

      {/* Unit 2 — Hash Rate Trend Chart */}
      {hashData.length > 0 && (
        <HashRateTrendChart
          data={hashData}
          currentEh={currentEh}
          change30d={hashChange30d}
        />
      )}

      <BitcoinChartsClient
        addrData={addrData}
        txData={txData}
        hashData={hashData}
        feeData={feeData}
        mempoolData={mempoolData}
        minerRevData={minerRevData}
        utxoData={utxoData}
      />

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">About These Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono text-[#555] leading-relaxed">
          {[
            ["Hash Rate (EH/s)",       "Total computational power securing the Bitcoin network. Higher = more secure."],
            ["Mempool Tx Count",       "Transactions waiting to be confirmed. Spike = network congestion."],
            ["Miner Revenue",          "Total USD value earned by miners per day (block subsidy + fees)."],
            ["30D Realized Volatility","Annualized standard deviation of daily log-returns over 30 days. Higher = riskier."],
            ["UTXO Age Bands",         "Distribution of when coins last moved. Rising old coins = HODLing, falling = distribution."],
            ["Difficulty",             "Auto-adjusts every 2016 blocks (~2 weeks) to maintain 10-min block times."],
            ["MVRV Ratio",             "Market Value ÷ Realized Value. <1 = undervalued; 1–3 = fair; >3 = overvalued; >4.5 = extreme. Source: Glassnode."],
            ["NUPL",                   "Net Unrealized Profit/Loss = (Market Cap − Realized Cap) ÷ Market Cap. <0 Capitulation; 0–0.25 Hope; 0.25–0.5 Optimism; 0.5–0.75 Belief; >0.75 Euphoria."],
            ["Puell Multiple",         "Daily miner revenue ÷ 365-day SMA. <0.5 historically strong buy; 0.5–1.0 fair; 1.0–2.0 caution; >2.0 extreme overvaluation. Source: blockchain.info."],
            ["Stock‑to‑Flow (S2F)",    "Circulating supply ÷ annual new issuance. Model price = S2F³ × $0.40 (PlanB). Constant between halvings; next update at 2028 halving. Current S2F ≈ 120."],
            ["Realized Price",         "Average on-chain cost basis of all BTC weighted by last movement. Derived as BTC Price ÷ MVRV. Trading below Realized Price = deep bear accumulation zone."],
            ["Thermocap Multiple",     "Market Cap ÷ cumulative all-time miner revenue. <5× historically undervalued; 5–15× fair; 15–30× overvalued; >30× cycle top territory. Derived from blockchain.info."],
            ["Exchange Reserve",       "Total BTC held in known exchange wallets. Falling = coins withdrawn to self-custody (accumulation, bullish). Rising = inflow to exchanges (sell pressure, bearish)."],
            ["LTH Supply",             "% of circulating supply unmoved 155+ days (Long-Term Holder threshold). Rising = strong-hand accumulation (supply contraction, bullish). Falling = LTH distribution (late-cycle signal)."],
          ].map(([k, v]) => (
            <div key={k}><span className="text-[#888] font-black">{k}:</span> {v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BitcoinOnChainPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <BitcoinData />
      </Suspense>
    </main>
  );
}
