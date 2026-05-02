import React, { Suspense } from "react";
import { DataHeader }    from "../../_components/DataHeader";
import { ChartSkeleton } from "../../_components/ChartSkeleton";
import { cached }        from "@/lib/cache";
import EthTvlClient      from "./_components/EthTvlClient";

export const metadata = { title: "Ethereum On-Chain | CryptoBrainNews" };
export const revalidate = 300;

async function ft(url: string, opts?: RequestInit): Promise<Response | null> {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), 6_000);
  try { return await fetch(url, { signal: ac.signal, cache: "no-store", ...(opts ?? {}) }); }
  catch { return null; }
  finally { clearTimeout(id); }
}

function Card({ label, value, sub, color = "#3b82f6" }: {
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

// ── Unit 1: ETH Staking Stats — cached 5 min via cached() ────────────────────

interface EthStakingData {
  eligibleether?:  number;
  validatorscount?: number;
  stakingapr?:      number;
}

async function getEthStakingStats(): Promise<EthStakingData | null> {
  return cached("eth:staking:v1", async () => {
    const res = await ft("https://beaconcha.in/api/v1/epoch/latest");
    if (!res?.ok) return null;
    const json = await res.json() as { data?: EthStakingData };
    return json.data ?? null;
  }, 300);
}

interface EthSupplyRow {
  date:        string;
  supply:      number;
  burned:      number;
  netEmission: number;
}

async function fetchEthSupplyGrowth(): Promise<EthSupplyRow[]> {
  const key = process.env.ETHERSCAN_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${key}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const json = await res.json() as { status: string; result?: string };
    if (json.status !== "1" || !json.result) return [];

    const currentSupply = parseFloat(json.result) / 1e18;

    const burnRes = await fetch(
      `https://api.etherscan.io/api?module=stats&action=ethburned&apikey=${key}`,
      { next: { revalidate: 3600 } }
    );
    let burned = 0;
    if (burnRes.ok) {
      const burnJson = await burnRes.json() as { status: string; result?: string };
      if (burnJson.status === "1" && burnJson.result) {
        burned = parseFloat(burnJson.result) / 1e18;
      }
    }

    return [{
      date:        new Date().toISOString().slice(0, 10),
      supply:      currentSupply,
      burned:      burned,
      netEmission: currentSupply - 120_520_000,
    }];
  } catch {
    return [];
  }
}

// ── Unit 2 (Batch 8): ETH Burn Rate Tracker ───────────────────────────────────

interface EthBurnStats {
  totalBurned:    number;  // ETH
  dailyAvgBurn:   number;  // ETH/day
  source:         "live" | "estimate";
}

// EIP-1559 launch: Aug 5 2021 00:00:00 UTC (Unix: 1628121600)
const EIP1559_TIMESTAMP = 1_628_121_600_000;

async function fetchEthBurnStats(): Promise<EthBurnStats> {
  return cached("eth:burn:stats:v1", async () => {
    const key = process.env.ETHERSCAN_API_KEY;
    const daysSinceEIP1559 = Math.floor((Date.now() - EIP1559_TIMESTAMP) / 86_400_000);

    if (key) {
      try {
        const res = await fetch(
          `https://api.etherscan.io/api?module=stats&action=ethburned&apikey=${key}`,
          { next: { revalidate: 3600 } }
        );
        if (res.ok) {
          const json = await res.json() as { status: string; result?: string };
          if (json.status === "1" && json.result) {
            const totalBurned = parseFloat(json.result) / 1e18;
            if (totalBurned > 0) {
              return {
                totalBurned,
                dailyAvgBurn: totalBurned / daysSinceEIP1559,
                source: "live",
              };
            }
          }
        }
      } catch { /* fall through */ }
    }

    // Seed fallback: ~4.4M ETH burned total as of mid-2026
    const seedTotal = 4_420_000;
    return {
      totalBurned:  seedTotal,
      dailyAvgBurn: seedTotal / daysSinceEIP1559,
      source:       "estimate",
    };
  }, 3600);
}

async function EthData() {
  const priceR = await ft("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
  const tvlR   = await ft("https://api.llama.fi/v2/historicalChainTvl/Ethereum");
  const gasR   = await ft("https://cloudflare-eth.com", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
  });

  const [priceJ, tvlJ, gasJ, supplyRows, stakingData, burnStats] = await Promise.allSettled([
    priceR?.ok ? priceR.json() : Promise.resolve(null),
    tvlR?.ok   ? tvlR.json()   : Promise.resolve(null),
    gasR?.ok   ? gasR.json()   : Promise.resolve(null),
    fetchEthSupplyGrowth(),
    getEthStakingStats(),
    fetchEthBurnStats(),
  ]);

  const priceValue   = priceJ.status    === "fulfilled" ? (priceJ.value    as Record<string, { usd: number }> | null) : null;
  const tvlValue     = tvlJ.status      === "fulfilled" ? (tvlJ.value      as Array<{ date: number; tvl: number }> | null) : null;
  const gasValue     = gasJ.status      === "fulfilled" ? (gasJ.value      as { result?: string } | null) : null;
  const beacon       = stakingData.status === "fulfilled" ? stakingData.value : null;

  const price          = priceValue?.ethereum?.usd ?? 0;
  const tvlRaw         = tvlValue ?? [];
  const gasHex         = gasValue?.result ?? null;
  const supplyData     = (supplyRows.status === "fulfilled" ? supplyRows.value : []) as EthSupplyRow[];

  const totalStaked    = beacon?.eligibleether    ? beacon.eligibleether / 1e9    : 0;
  const validatorCount = beacon?.validatorscount  ?? 0;
  const stakingApr     = beacon?.stakingapr       ? +(beacon.stakingapr * 100).toFixed(2) : 0;
  const avgGasGwei     = gasHex ? Math.round(parseInt(gasHex, 16) / 1e9) : 0;
  const latestTvl      = Array.isArray(tvlRaw) && tvlRaw.length ? tvlRaw[tvlRaw.length - 1]?.tvl ?? 0 : 0;
  const currentSupply  = supplyData[0]?.supply ?? 0;
  const burnedEth      = supplyData[0]?.burned ?? 0;
  const ethBurn        = burnStats.status === "fulfilled" ? burnStats.value : null;

  const fmtN = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toFixed(0);

  const tvlChart = Array.isArray(tvlRaw) ? tvlRaw.slice(-90).map((p) => ({
    date: new Date(p.date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tvl:  p.tvl,
  })) : [];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Ethereum On-Chain"
        description="Ethereum network health — staking, gas, TVL, supply growth, and on-chain activity."
      />
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live — beaconcha.in + DefiLlama + cloudflare-eth.com
        </span>
      </div>

      {/* ── Unit 1: ETH Staking Stats ─────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#3b82f6] pl-3 mb-5">
          ETH Staking Stats
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            label="ETH Staked"
            value={totalStaked > 0 ? `${fmtN(totalStaked)} ETH` : "—"}
            sub={price > 0 && totalStaked > 0 ? `$${((totalStaked * price) / 1e9).toFixed(1)}B locked` : "beaconcha.in"}
            color="#3b82f6"
          />
          <Card
            label="Validator Count"
            value={validatorCount > 0 ? fmtN(validatorCount) : "—"}
            sub="active validators"
            color="#fff"
          />
          <Card
            label="Staking APR"
            value={stakingApr > 0 ? `${stakingApr.toFixed(2)}%` : "—"}
            sub="beaconcha.in · annualized"
            color="#00d672"
          />
          <Card
            label="% ETH Staked"
            value={totalStaked > 0 ? `${((totalStaked / 120_000_000) * 100).toFixed(1)}%` : "—"}
            sub="of ~120M supply"
            color="#888"
          />
        </div>
        <p className="text-[9px] text-[#333] font-mono mt-4">
          Source: beaconcha.in/api/v1/epoch/latest · Cached 5 min
        </p>
      </div>

      {/* ── Main KPI Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          label="ETH Price"
          value={price > 0 ? `$${price.toLocaleString()}` : "—"}
          sub="CoinGecko"
        />
        <Card
          label="Avg Gas"
          value={avgGasGwei > 0 ? `${avgGasGwei} Gwei` : "—"}
          color={avgGasGwei > 50 ? "#ff4757" : avgGasGwei > 0 ? "#FABF2C" : "#888"}
          sub="cloudflare-eth.com"
        />
        <Card
          label="DeFi TVL"
          value={latestTvl > 0 ? `$${(latestTvl / 1e9).toFixed(1)}B` : "—"}
          sub="DefiLlama"
          color="#FABF2C"
        />
        <Card
          label="ETH Burned"
          value={burnedEth > 0 ? `${(burnedEth / 1e6).toFixed(1)}M ETH` : "4.4M+ ETH"}
          sub="since EIP-1559"
          color="#ff4757"
        />
      </div>

      {/* ── ETH Supply Growth ─────────────────────────────────────────────────── */}
      {currentSupply > 0 && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#3b82f6] pl-3 mb-5">
            ETH Supply Growth (Post-Merge)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="border border-[#1a1a1a] bg-[#080808] p-4">
              <p className="text-[9px] font-mono text-[#555] uppercase mb-2">Total ETH Supply</p>
              <p className="text-2xl font-black text-white tabular-nums">{(currentSupply / 1e6).toFixed(2)}M</p>
              <p className="text-[9px] font-mono text-[#555] mt-1">ETH</p>
            </div>
            <div className="border border-[#1a1a1a] bg-[#080808] p-4">
              <p className="text-[9px] font-mono text-[#555] uppercase mb-2">Cumulative Burned</p>
              <p className="text-2xl font-black text-[#ff4757] tabular-nums">{(burnedEth / 1e6).toFixed(2)}M</p>
              <p className="text-[9px] font-mono text-[#555] mt-1">ETH since EIP-1559</p>
            </div>
            <div className="border border-[#1a1a1a] bg-[#080808] p-4">
              <p className="text-[9px] font-mono text-[#555] uppercase mb-2">Net Since Merge</p>
              <p className={`text-2xl font-black tabular-nums ${supplyData[0]?.netEmission && supplyData[0].netEmission > 0 ? "text-[#ff4757]" : "text-[#00d672]"}`}>
                {supplyData[0]?.netEmission ? `${(supplyData[0].netEmission / 1e6).toFixed(3)}M` : "—"}
              </p>
              <p className="text-[9px] font-mono text-[#555] mt-1">ETH (inflationary)</p>
            </div>
          </div>
          <p className="text-[9px] text-[#333] font-mono mt-4">
            Source: Etherscan stats/ethsupply + stats/ethburned · Requires ETHERSCAN_API_KEY
          </p>
        </div>
      )}

      {/* ── Unit 2 (Batch 8): ETH Burn Rate Tracker ──────────────────────────── */}
      {ethBurn && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#ff4757] pl-3 mb-5">
            ETH Burn Rate Tracker
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              label="Total ETH Burned"
              value={`${(ethBurn.totalBurned / 1e6).toFixed(2)}M ETH`}
              sub="cumulative since EIP-1559"
              color="#ff4757"
            />
            <Card
              label="Daily Burn Rate"
              value={`${ethBurn.dailyAvgBurn.toFixed(0)} ETH/day`}
              sub="lifetime average since EIP-1559"
              color="#FABF2C"
            />
            <Card
              label="USD Value Burned"
              value={price > 0 ? `$${((ethBurn.totalBurned * price) / 1e9).toFixed(1)}B` : "—"}
              sub="at current ETH price"
              color="#888"
            />
            <Card
              label="Data Source"
              value={ethBurn.source === "live" ? "Etherscan" : "Estimate"}
              sub={ethBurn.source === "live" ? "stats/ethburned · live" : "seed fallback · ~4.4M ETH"}
              color={ethBurn.source === "live" ? "#00d672" : "#555"}
            />
          </div>
          <p className="text-[9px] text-[#333] font-mono mt-4">
            Source: Etherscan stats/ethburned · EIP-1559 Aug 5 2021 · Cached 1 h
          </p>
        </div>
      )}

      <EthTvlClient tvlChart={tvlChart} latestTvl={latestTvl} />
    </div>
  );
}

export default function EthereumPage() {
  return <main><Suspense fallback={<ChartSkeleton />}><EthData /></Suspense></main>;
}
