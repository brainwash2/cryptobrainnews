import React, { Suspense }     from "react";
import { DataHeader }            from "../../_components/DataHeader";
import { ChartSkeleton }         from "../../_components/ChartSkeleton";
import ScalingTable              from "../_components/ScalingTable";
import TvlBars                   from "../_components/TvlBars";
import { getOptimisticRollups }  from "@/lib/scaling-data";
import { getL2GasFees }          from "@/lib/onchain-extended";

export const metadata = {
  title: "Optimistic Rollups | CryptoBrainNews",
  description: "Arbitrum, Optimism, Base, Blast, Mantle - TVL, live gas fees, and network comparison.",
};
export const revalidate = 3600;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return n > 0 ? `$${n.toLocaleString()}` : "-";
}

function fmtGwei(n: number | null | undefined): string {
  if (!n || n <= 0) return "-";
  if (n < 0.001) return `${(n * 1000).toFixed(3)} mGwei`;
  return `${n.toFixed(4)} Gwei`;
}

// Colour per L2 chain — consistent with BlockChartCard usage
const CHAIN_COLORS: Record<string, string> = {
  arbitrum: "#3b82f6",
  optimism: "#ef4444",
  base:     "#0052ff",
};

const CHAIN_LABELS: Record<string, string> = {
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  base:     "Base",
};

async function OptimisticData() {
  const [chains, gasFees] = await Promise.all([
    getOptimisticRollups(),
    // onchain-extended: calls eth_gasPrice on Arbitrum, Optimism, Base public RPCs
    // Returns one current snapshot row per chain — not a time-series
    getL2GasFees(1).catch(() => []),
  ]);

  const totalTvl = chains.reduce((s, c) => s + c.tvl, 0);

  // Build a chain → current gas map from the snapshot
  const gasMap: Record<string, number> = {};
  gasFees.forEach((row) => {
    const chain = String(row.chain ?? "").toLowerCase();
    const gwei  = Number(row.avg_gas_price_gwei ?? 0);
    if (chain && gwei > 0) gasMap[chain] = gwei;
  });

  const hasGasData = Object.keys(gasMap).length > 0;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Optimistic Rollups"
        description="Fraud-proof based rollups - Arbitrum, Optimism, Base, Blast, and Mantle. TVL and live gas fees."
      />

      {/* ── Source badges ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - DefiLlama
        </span>
        {hasGasData && (
          <span className="border border-[#3b82f6]/40 text-[#3b82f6] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
            Gas - Public RPC
          </span>
        )}
      </div>

      {/* ── KPI Strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Total Optimistic TVL
          </p>
          <p className="text-2xl font-black text-[#3b82f6] tabular-nums">{fmtUsd(totalTvl)}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Leading Network
          </p>
          <p className="text-2xl font-black text-white">{chains[0]?.name ?? "-"}</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">{fmtUsd(chains[0]?.tvl ?? 0)}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Networks Tracked
          </p>
          <p className="text-2xl font-black text-white">{chains.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Mechanism
          </p>
          <p className="text-sm font-black text-[#FABF2C]">Fraud Proofs</p>
          <p className="text-[10px] font-mono text-[#555] mt-1">7-day challenge window</p>
        </div>
      </div>

      {/* ── TVL Bars ───────────────────────────────────────────────── */}
      <TvlBars chains={chains} title="Optimistic Rollup TVL Market Share" />

      {/* ── Live Gas Price Comparison ─────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <div className="mb-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#3b82f6] pl-3">
            Current Gas Prices
          </h3>
          <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
            Live eth_gasPrice via public RPC - Arbitrum, Optimism, Base
          </p>
        </div>

        {hasGasData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["arbitrum", "optimism", "base"] as const).map((chain) => {
              const gwei  = gasMap[chain];
              const color = CHAIN_COLORS[chain];
              const label = CHAIN_LABELS[chain];
              return (
                <div
                  key={chain}
                  className="border border-[#1a1a1a] bg-[#080808] p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color }}
                    >
                      {label}
                    </span>
                  </div>
                  <p className="text-2xl font-black tabular-nums text-white">
                    {gwei ? fmtGwei(gwei) : "-"}
                  </p>
                  <p className="text-[9px] font-mono text-[#555] mt-1">
                    {gwei
                      ? gwei < 0.01
                        ? "Ultra-low — L2 congestion minimal"
                        : gwei < 1
                          ? "Low — typical L2 conditions"
                          : "Elevated — check network conditions"
                      : "RPC unavailable"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-[#1a1a1a] p-6 text-center">
            <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
              Gas data temporarily unavailable - public RPC rate limited
            </p>
          </div>
        )}

        <p className="text-[9px] text-[#333] font-mono mt-4">
          Sources: arb1.arbitrum.io/rpc &bull; mainnet.optimism.io &bull; mainnet.base.org
          &mdash; Snapshot refreshed every 5 min
        </p>
      </div>

      {/* ── Chain Table ───────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#3b82f6] rounded-full" />
          All Optimistic Rollups
        </h3>
        <ScalingTable chains={chains} />
      </div>

      {/* ── Tech Explainer ────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">
          How Optimistic Rollups Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono text-[#555] leading-relaxed">
          {[
            ["Execution",         "Transactions batch off-chain. Compressed calldata posted to Ethereum as the data availability layer."],
            ["Fraud Proofs",      "Assumed valid by default. Challengers can submit fraud proofs during the 7-day window to revert invalid state."],
            ["Withdrawals",       "Native withdrawals to L1 take 7 days. Liquidity bridges (Hop, Across, Synapse) bypass the wait for a fee."],
            ["EVM Compatibility", "Arbitrum Nitro and OP Bedrock are fully EVM-equivalent. Existing Ethereum contracts deploy unchanged."],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-[#888] font-black">{k}:</span> {v}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OptimisticPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <OptimisticData />
      </Suspense>
    </main>
  );
}