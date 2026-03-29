
import React, { Suspense } from "react";
import { DataHeader }    from "../../_components/DataHeader";
import { ChartSkeleton } from "../../_components/ChartSkeleton";
import OnchainAreaChart  from "../_components/OnchainAreaChart";

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
  // All fetches independent — one failure can never crash others
  const priceR  = await ft("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
  const beaconR = await ft("https://beaconcha.in/api/v1/epoch/latest");
  const tvlR    = await ft("https://api.llama.fi/v2/historicalChainTvl/Ethereum");
  const gasR    = await ft("https://cloudflare-eth.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
  });

  // Parse each independently
  const ethPrice = (() => {
    if (!priceR?.ok) return 0;
    try { return (priceR.json() as Promise<any>); } catch { return 0; }
  })();

  // Use Promise.allSettled on the JSON parsing, not the fetches
  const [priceJ, beaconJ, tvlJ, gasJ] = await Promise.allSettled([
    priceR?.ok  ? priceR.json()  : Promise.resolve(null),
    beaconR?.ok ? beaconR.json() : Promise.resolve(null),
    tvlR?.ok    ? tvlR.json()    : Promise.resolve(null),
    gasR?.ok    ? gasR.json()    : Promise.resolve(null),
  ]);

  const price       = priceJ.status === "fulfilled"  ? (priceJ.value as any)?.ethereum?.usd as number ?? 0 : 0;
  const beacon      = beaconJ.status === "fulfilled" ? (beaconJ.value as any)?.data : null;
  const tvlHistory  = tvlJ.status === "fulfilled"    ? (tvlJ.value as Array<{date:number;tvl:number}>) ?? [] : [];
  const gasHex      = gasJ.status === "fulfilled"    ? (gasJ.value as any)?.result as string : null;

  const totalStaked    = beacon?.eligibleether    ? beacon.eligibleether / 1e9 : 0;
  const validatorCount = beacon?.validatorscount  ?? 0;
  const stakingApr     = beacon?.stakingapr       ? +(beacon.stakingapr * 100).toFixed(2) : 3.5;
  const avgGasGwei     = gasHex ? Math.round(parseInt(gasHex, 16) / 1e9) : 20;
  const latestTvl      = Array.isArray(tvlHistory) && tvlHistory.length ? tvlHistory[tvlHistory.length - 1]?.tvl ?? 0 : 0;
  const stakedUsd      = totalStaked * price;

  const tvlChart = Array.isArray(tvlHistory) ? tvlHistory.slice(-90).map((p) => ({
    date: new Date(p.date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tvl:  p.tvl,
  })) : [];

  function fmtN(n: number) {
    if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`;
    return n.toFixed(0);
  }

  return (
    <div className="space-y-10 pb-20">
      <DataHeader title="Ethereum On-Chain"
        description="Ethereum network health - staking statistics, gas, TVL, and on-chain activity." />
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - beaconcha.in + DefiLlama + cloudflare-eth.com
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="ETH Price"        value={price > 0 ? `$${price.toLocaleString()}` : "-"} sub="CoinGecko" />
        <Card label="Total ETH Staked" value={totalStaked > 0 ? `${fmtN(totalStaked)} ETH` : "-"}
          sub={stakedUsd > 0 ? `$${(stakedUsd/1e9).toFixed(1)}B` : "beaconcha.in"} />
        <Card label="Validators"       value={validatorCount > 0 ? fmtN(validatorCount) : "-"} sub="active + pending" color="#fff" />
        <Card label="Staking APR"      value={`${stakingApr.toFixed(2)}%`} sub="beaconcha.in" color="#00d672" />
        <Card label="Avg Gas (Gwei)"   value={`${avgGasGwei} Gwei`}
          color={avgGasGwei > 50 ? "#ff4757" : "#FABF2C"}
          sub={avgGasGwei <= 5 ? "Low congestion" : "cloudflare-eth.com"} />
        <Card label="DeFi TVL"         value={latestTvl > 0 ? `$${(latestTvl/1e9).toFixed(1)}B` : "-"} sub="DefiLlama" color="#FABF2C" />
        <Card label="% ETH Staked"     value={totalStaked > 0 ? `${((totalStaked/120_000_000)*100).toFixed(1)}%` : "-"} sub="of ~120M supply" color="#888" />
        <Card label="ETH Burned"       value="4.4M+ ETH" sub="since EIP-1559" color="#ff4757" />
      </div>
      {tvlChart.length > 0 ? (
        <OnchainAreaChart title="Ethereum DeFi TVL (90D)"
          subtitle="Source: DefiLlama"
          data={tvlChart} dataKey="tvl" color="#3b82f6"
          yFormatter={(v) => `$${(v/1e9).toFixed(1)}B`} height={220} />
      ) : (
        <div className="border border-dashed border-[#1a1a1a] p-6 text-center">
          <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">TVL chart loading...</p>
        </div>
      )}
    </div>
  );
}

export default function EthereumPage() {
  return <main><Suspense fallback={<ChartSkeleton />}><EthData /></Suspense></main>;
}

