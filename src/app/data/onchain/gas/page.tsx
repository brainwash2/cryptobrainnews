import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";

export const metadata = {
  title: "Gas Tracker | CryptoBrainNews",
  description: "Live Ethereum, Arbitrum, Optimism, and Base gas price tracker.",
};
export const revalidate = 60;

interface GasApiResponse {
  SafeGasPrice:    string;
  ProposeGasPrice: string;
  FastGasPrice:    string;
  suggestBaseFee:  string;
  gasUsedRatio:    string;
}

interface L2GasData {
  chain:      string;
  gasGwei:    number | null;
  color:      string;
  label:      string;
  rpcUrl:     string;
}

async function fetchEthGas(): Promise<GasApiResponse | null> {
  try {
    const res = await fetch("https://api.ethgasstation.info/api/fee-estimate",
      { next: { revalidate: 60 } });
    if (res.ok) {
      const d = await res.json() as { fastest: number; fast: number; average: number };
      return {
        FastGasPrice:    String(Math.round(d.fastest / 10)),
        ProposeGasPrice: String(Math.round(d.fast    / 10)),
        SafeGasPrice:    String(Math.round(d.average / 10)),
        suggestBaseFee:  "—",
        gasUsedRatio:    "—",
      };
    }
  } catch { /* fallback */ }
  try {
    const res2 = await fetch("https://mempool.space/api/v1/fees/recommended");
    if (res2.ok) {
      const d = await res2.json() as { fastestFee: number; halfHourFee: number; hourFee: number };
      return {
        FastGasPrice:    `~${d.fastestFee} sat/vB`,
        ProposeGasPrice: `~${d.halfHourFee} sat/vB`,
        SafeGasPrice:    `~${d.hourFee} sat/vB`,
        suggestBaseFee:  "BTC mempool",
        gasUsedRatio:    "—",
      };
    }
  } catch { /* return null */ }
  return null;
}

async function fetchL2Gas(): Promise<L2GasData[]> {
  const chains: Array<{ chain: string; color: string; label: string; rpcUrl: string }> = [
    { chain: "arbitrum", color: "#3b82f6", label: "Arbitrum", rpcUrl: "https://arb1.arbitrum.io/rpc" },
    { chain: "optimism", color: "#ef4444", label: "OP Mainnet", rpcUrl: "https://mainnet.optimism.io" },
    { chain: "base",     color: "#0052ff", label: "Base",      rpcUrl: "https://mainnet.base.org" },
  ];

  const results = await Promise.all(
    chains.map(async ({ chain, color, label, rpcUrl }) => {
      try {
        const res = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 1 }),
          next: { revalidate: 60 },
        });
        if (!res.ok) return { chain, gasGwei: null, color, label, rpcUrl };
        const json = await res.json() as { result?: string };
        const gwei = json.result ? parseInt(json.result, 16) / 1e9 : null;
        return { chain, gasGwei: gwei ? Number(gwei.toFixed(4)) : null, color, label, rpcUrl };
      } catch {
        return { chain, gasGwei: null, color, label, rpcUrl };
      }
    })
  );
  return results;
}

const CHAIN_FALLBACKS = [
  { name: "Ethereum",  symbol: "ETH", color: "#3b82f6", note: "Base fee + priority tip (EIP-1559)" },
  { name: "Bitcoin",   symbol: "BTC", color: "#FABF2C", note: "sat/vB — priority mempool estimate" },
  { name: "Solana",    symbol: "SOL", color: "#9945ff", note: "~0.000005 SOL per tx (fixed + priority)" },
  { name: "Avalanche", symbol: "AVAX", color: "#e84142", note: "C-Chain: EIP-1559 style (~25 nAVAX base)" },
  { name: "BNB Chain",  symbol: "BNB", color: "#f3ba2f", note: "BSC: ~3 Gwei base fee (centralised)" },
];

function fmtGwei(n: number | null): string {
  if (n === null) return "—";
  if (n < 0.001) return `${(n * 1000).toFixed(3)} mGwei`;
  return `${n.toFixed(4)} Gwei`;
}

async function GasTrackerData() {
  const [gasData, l2Gas] = await Promise.all([
    fetchEthGas(),
    fetchL2Gas(),
  ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Gas Tracker"
        description="Live Ethereum and Layer 2 gas price estimates — Ethereum, Arbitrum, Optimism, and Base."
      />

      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 border-l-2 border-[#3b82f6] pl-3">
          Ethereum Gas Estimates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tier: "Safe (slow)",  value: gasData?.SafeGasPrice    ?? "—", color: "#00d672", sub: "> 10 min" },
            { tier: "Standard",    value: gasData?.ProposeGasPrice  ?? "—", color: "#FABF2C", sub: "~3 min" },
            { tier: "Fast",        value: gasData?.FastGasPrice     ?? "—", color: "#ff4757", sub: "< 30 sec" },
          ].map((g) => (
            <div key={g.tier} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-3">{g.tier}</p>
              <p className="text-3xl font-black tabular-nums" style={{ color: g.color }}>
                {g.value} {!g.value.includes("/") && !g.value.includes("sat/vB") ? "Gwei" : ""}
              </p>
              <p className="text-[10px] font-mono text-[#555] mt-2">{g.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 border-l-2 border-[#00d672] pl-3">
          Layer 2 Gas Prices (Live · Public RPC)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {l2Gas.map((l2) => {
            const gwei = l2.gasGwei;
            const statusText = gwei === null ? "RPC unavailable" :
              gwei < 0.01 ? "Ultra-low" : gwei < 1 ? "Low" : "Elevated";
            const statusColor = gwei === null ? "#555" :
              gwei < 0.01 ? "#00d672" : gwei < 1 ? "#FABF2C" : "#ff4757";
            return (
              <div key={l2.chain} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5"
                style={{ borderLeftColor: l2.color, borderLeftWidth: 3 }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l2.color }} />
                    <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: l2.color }}>
                      {l2.label}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 border"
                    style={{ color: statusColor, borderColor: `${statusColor}40` }}>
                    {statusText}
                  </span>
                </div>
                <p className="text-2xl font-black tabular-nums text-white">{fmtGwei(gwei)}</p>
                <p className="text-[9px] font-mono text-[#555] mt-2">
                  Source: {l2.rpcUrl.replace("https://", "").split("/")[0]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />Multi-Chain Fee Reference
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {["Chain", "Token", "Fee Model", "Notes"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHAIN_FALLBACKS.map((c, i) => (
                <tr key={c.name} className={`border-b border-[#111] ${i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"}`}>
                  <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                  <td className="px-4 py-3 font-black" style={{ color: c.color }}>{c.symbol}</td>
                  <td className="px-4 py-3 text-[#888]">
                    {c.name === "Bitcoin" ? "sat/vB" : c.name === "Solana" ? "Lamports" : "Gwei"}
                  </td>
                  <td className="px-4 py-3 text-[#555] font-mono">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          <span className="text-[#888] font-black">About gas fees:</span>{" "}
          Ethereum fees follow EIP-1559: base fee (burned) + priority tip (to validator).
          L2 gas prices are typically 90-99% cheaper than Ethereum L1.
          Arbitrum, Optimism, and Base data fetched via their public eth_gasPrice RPC endpoints.
        </p>
      </div>
    </div>
  );
}

export default function GasTrackerPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <GasTrackerData />
      </Suspense>
    </main>
  );
}
