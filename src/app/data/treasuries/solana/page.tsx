import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import { getCoinPrice }     from "@/lib/api";

export const metadata = { title: "Solana Treasuries | CryptoBrainNews" };
export const revalidate = 300;

// Publicly known SOL treasury companies - Q1 2026 disclosed holdings
const KNOWN_HOLDERS = [
  { name: "DeFi Development Corp", symbol: "DFDV", country: "US", solHoldings: 600_000, note: "Formerly Janover" },
  { name: "Sol Strategies",        symbol: "HODL", country: "CA", solHoldings: 170_000, note: "TSX listed" },
  { name: "Upexi",                  symbol: "UPXI", country: "US", solHoldings:  75_000, note: "Nasdaq listed" },
];

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

async function SolTreasuryData() {
  const solPrice = await getCoinPrice("solana").catch(() => 0);

  const holdersWithUsd = KNOWN_HOLDERS.map((h) => ({
    ...h,
    aumUsd: solPrice > 0 ? h.solHoldings * solPrice : null,
  }));

  const totalSol = KNOWN_HOLDERS.reduce((s, h) => s + h.solHoldings, 0);
  const totalUsd = solPrice > 0 ? totalSol * solPrice : null;

  return (
    <div className="space-y-8 pb-20">
      <DataHeader
        title="Solana Treasuries"
        description="Public companies holding SOL on their balance sheet - disclosed holdings as of Q1 2026."
      />

      {/* Source badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Price - CoinGecko live
        </span>
        <span className="border border-[#FABF2C]/30 text-[#FABF2C] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Holdings - Seed Q1 2026
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          AUM = disclosed SOL x live price
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            SOL Spot Price
          </p>
          <p className="text-2xl font-black text-[#9945ff] tabular-nums">
            {solPrice > 0 ? `$${solPrice.toFixed(2)}` : "-"}
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-1">CoinGecko</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Total SOL Held
          </p>
          <p className="text-2xl font-black text-white tabular-nums">
            {totalSol.toLocaleString()}
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-1">across {KNOWN_HOLDERS.length} companies</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Total AUM (est.)
          </p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">
            {totalUsd ? fmtUsd(totalUsd) : "-"}
          </p>
          <p className="text-[9px] font-mono text-[#555] mt-1">live estimate</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
            Companies
          </p>
          <p className="text-2xl font-black text-[#888]">{KNOWN_HOLDERS.length}</p>
          <p className="text-[9px] font-mono text-[#555] mt-1">publicly disclosed</p>
        </div>
      </div>

      {/* Holdings table */}
      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#080808]">
            <tr>
              {["Company", "Ticker", "Country", "SOL Holdings", "Est. AUM", "Note"].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                    ["SOL Holdings", "Est. AUM"].includes(h) ? "text-right" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdersWithUsd.map((c, i) => (
              <tr
                key={c.name}
                className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                  i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                }`}
              >
                <td className="px-4 py-4 font-bold text-white">{c.name}</td>
                <td className="px-4 py-4 font-mono text-[#FABF2C]">{c.symbol}</td>
                <td className="px-4 py-4 text-[#888]">{c.country}</td>
                <td className="px-4 py-4 text-right font-mono font-black text-[#9945ff] tabular-nums">
                  {c.solHoldings.toLocaleString()} SOL
                </td>
                <td className="px-4 py-4 text-right font-mono text-[#FABF2C] tabular-nums">
                  {c.aumUsd ? fmtUsd(c.aumUsd) : "-"}
                </td>
                <td className="px-4 py-4 text-[#555] font-mono">{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          Holdings data from public company disclosures (Q1 2026). AUM = disclosed SOL holdings x live CoinGecko price.
          CoinGecko does not provide a public Solana treasury API equivalent to its BTC/ETH endpoints.
          Holdings updated manually as companies file. USD values refresh with live SOL price every 5 min.
        </p>
      </div>
    </div>
  );
}

export default function SolanaTreasuriesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <SolTreasuryData />
      </Suspense>
    </main>
  );
}