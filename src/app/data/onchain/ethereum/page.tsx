import React, { Suspense } from "react";
import { DataHeader }    from "../../_components/DataHeader";
import { ChartSkeleton } from "../../_components/ChartSkeleton";
import EthTvlClient      from "./_components/EthTvlClient";

export const metadata = { title: "Ethereum On-Chain | CryptoBrainNews" };
export const revalidate = 1800;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ft(url: string, opts?: any): Promise<Response | null> {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), 6_000);
  try { return await fetch(url, { signal: ac.signal, cache: "no-store", ...opts }); }
  catch { return null; }
  finally { clearTimeout(id); }
}

function Card({ label, value, sub, color = "#3b82f6" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

async function EthData() {
  const priceR  = await ft("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
  const beaconR = await ft("https://beaconcha.in/api/v1/epoch/latest");
  const tvlR    = await ft("https://api.llama.fi/v2/historicalChainTvl/Ethereum");
  const gasR    = await ft("https://cloudflare-eth.com", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
  });

  const [priceJ, beaconJ, tvlJ, gasJ] = await Promise.allSettled([
    priceR?.ok  ? priceR.json()  : Promise.resolve(null),
    beaconR?.ok ? beaconR.json() : Promise.resolve(null),
    tvlR?.ok    ? tvlR.json()    : Promise.resolve(null),
    gasR?.ok    ? gasR.json()    : Promise.resolve(null),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const price  = priceJ.status  === "fulfilled" ? (priceJ.value  as any)?.ethereum?.usd  as number ?? 0 : 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const beacon = beaconJ.status === "fulfilled" ? (beaconJ.value as any)?.data : null;
  const tvlRaw = tvlJ.status    === "fulfilled" ? (tvlJ.value    as Array<{date:number;tvl:number}>) ?? [] : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gasHex = gasJ.status    === "fulfilled" ? (gasJ.value    as any)?.result as string : null;

  const totalStaked    = beacon?.eligibleether   ? beacon.eligibleether / 1e9 : 0;
  const validatorCount = beacon?.validatorscount  ?? 0;
  const stakingApr     = beacon?.stakingapr       ? +(beacon.stakingapr * 100).toFixed(2) : 3.5;
  const avgGasGwei     = gasHex ? Math.round(parseInt(gasHex, 16) / 1e9) : 20;
  const latestTvl      = Array.isArray(tvlRaw) && tvlRaw.length ? tvlRaw[tvlRaw.length - 1]?.tvl ?? 0 : 0;

  const tvlChart = Array.isArray(tvlRaw) ? tvlRaw.slice(-90).map((p) => ({
    date: new Date(p.date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tvl:  p.tvl,
  })) : [];

  const fmtN = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : n.toFixed(0);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader title="Ethereum On-Chain"
        description="Ethereum network health — staking, gas, TVL, and on-chain activity." />
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live — beaconcha.in + DefiLlama + cloudflare-eth.com
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="ETH Price"        value={price > 0 ? `$${price.toLocaleString()}` : "—"} sub="CoinGecko" />
        <Card label="ETH Staked"       value={totalStaked > 0 ? `${fmtN(totalStaked)} ETH` : "—"}
          sub={price > 0 && totalStaked > 0 ? `$${((totalStaked * price)/1e9).toFixed(1)}B` : "beaconcha.in"} />
        <Card label="Validators"       value={validatorCount > 0 ? fmtN(validatorCount) : "—"} sub="active + pending" color="#fff" />
        <Card label="Staking APR"      value={`${stakingApr.toFixed(2)}%`} sub="beaconcha.in" color="#00d672" />
        <Card label="Avg Gas"          value={`${avgGasGwei} Gwei`}
          color={avgGasGwei > 50 ? "#ff4757" : "#FABF2C"} sub="cloudflare-eth.com" />
        <Card label="DeFi TVL"         value={latestTvl > 0 ? `$${(latestTvl/1e9).toFixed(1)}B` : "—"} sub="DefiLlama" color="#FABF2C" />
        <Card label="% ETH Staked"     value={totalStaked > 0 ? `${((totalStaked/120_000_000)*100).toFixed(1)}%` : "—"} sub="of ~120M supply" color="#888" />
        <Card label="ETH Burned"       value="4.4M+ ETH" sub="since EIP-1559" color="#ff4757" />
      </div>

      {/* Recharts AreaChart replaces the old CSS bar chart */}
      <EthTvlClient tvlChart={tvlChart} latestTvl={latestTvl} />
    </div>
  );
}

export default function EthereumPage() {
  return <main><Suspense fallback={<ChartSkeleton />}><EthData /></Suspense></main>;
}