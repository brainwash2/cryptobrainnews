import React, { Suspense }               from "react";
import { DataHeader }                      from "../../_components/DataHeader";
import { ChartSkeleton }                   from "../../_components/ChartSkeleton";
import { getEthereumStats, getChainTvlHistory } from "@/lib/onchain-data";
import { getCoinPrice }                    from "@/lib/api";
import OnchainAreaChart                    from "../_components/OnchainAreaChart";

export const metadata = {
  title: "Ethereum On-Chain | CryptoBrainNews",
  description: "Ethereum network health - staking, gas, TVL, transactions, and active addresses.",
};
export const revalidate = 1800;

function StatCard({ label, value, sub, color = "#3b82f6" }: {
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
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

async function EthData() {
  const [ethStats, ethPrice, tvlHistory] = await Promise.all([
    getEthereumStats().catch(() => null),
    getCoinPrice("ethereum").catch(() => 0),
    getChainTvlHistory("Ethereum", 90).catch(() => []),
  ]);

  const stakedUsd = ethStats && ethPrice ? ethStats.totalStaked * ethPrice : 0;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Ethereum On-Chain"
        description="Ethereum network health - staking statistics, gas, TVL, and on-chain activity."
      />

      <div className="flex items-center gap-3 flex-wrap">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - beaconcha.in + DefiLlama
        </span>
      </div>

      {ethStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="ETH Price"        value={ethPrice > 0 ? `$${ethPrice.toLocaleString()}` : "-"} sub="CoinGecko" />
          <StatCard label="Total ETH Staked" value={`${fmtNum(ethStats.totalStaked)} ETH`}
            sub={stakedUsd > 0 ? `$${(stakedUsd / 1e9).toFixed(1)}B` : "beaconcha.in"} />
          <StatCard label="Validators"       value={fmtNum(ethStats.validatorCount)} sub="active + pending" color="#fff" />
          <StatCard label="Staking APR"      value={`${ethStats.stakingApr.toFixed(2)}%`} sub="beaconcha.in" color="#00d672" />
          <StatCard label="Avg Gas (gwei)"   value={`${ethStats.avgGasGwei.toFixed(1)} Gwei`} sub="estimate"
            color={ethStats.avgGasGwei > 50 ? "#ff4757" : "#FABF2C"} />
          <StatCard label="DeFi TVL"         value={ethStats.tvlUsd > 0 ? `$${(ethStats.tvlUsd / 1e9).toFixed(1)}B` : "-"} sub="DefiLlama" color="#FABF2C" />
          <StatCard label="% ETH Staked"     value={`${((ethStats.totalStaked / 120_000_000) * 100).toFixed(1)}%`} sub="of ~120M supply" color="#888" />
          <StatCard label="ETH Burned"       value={ethStats.burnedTotal > 0 ? `${fmtNum(ethStats.burnedTotal)} ETH` : "4.4M+ ETH"} sub="since EIP-1559" color="#ff4757" />
        </div>
      ) : (
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
          <p className="text-[#555] font-mono text-xs uppercase">Network stats temporarily unavailable</p>
        </div>
      )}

      <OnchainAreaChart
        title="Ethereum DeFi TVL (90D)"
        subtitle="Source: DefiLlama - total value locked in Ethereum-native protocols"
        data={tvlHistory}
        dataKey="tvl"
        color="#3b82f6"
        yFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`}
        height={220}
      />

      <div className="border border-dashed border-[#1a1a1a] p-6 text-center">
        <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
          Daily tx + active address charts require{" "}
          <code className="text-[#3b82f6]">ETHERSCAN_API_KEY</code>
          {" "}- free at etherscan.io/myapikey
        </p>
      </div>

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">EIP-1559 Burn Mechanics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono text-[#555] leading-relaxed">
          {[
            ["Base Fee Burn", "Since August 2021, Ethereum burns the base fee on every transaction."],
            ["Net Issuance",  "At high gas prices ETH becomes net deflationary. Staking issuance offset by burn."],
            ["Staking APR",   "Validators earn ~3-4% APR from block rewards + MEV. Merge ended PoW issuance."],
            ["Track burns",   "Live cumulative burn at ultrasound.money."],
          ].map(([k, v]) => (
            <div key={k}><span className="text-[#888] font-black">{k}:</span> {v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EthereumOnChainPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <EthData />
      </Suspense>
    </main>
  );
}
