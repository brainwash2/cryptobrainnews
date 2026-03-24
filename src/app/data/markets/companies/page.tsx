import React, { Suspense }           from "react";
import { DataHeader }                  from "../../_components/DataHeader";
import { ChartSkeleton }               from "../../_components/ChartSkeleton";
import { getBitcoinTreasuries, getEthereumTreasuries } from "@/lib/treasury-data";

export const metadata = {
  title: "Crypto Companies | CryptoBrainNews",
  description: "Public companies holding BTC and ETH on their balance sheets - live from CoinGecko.",
};
export const revalidate = 21_600; // 6h — treasury data is slow-moving

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtCoin(n: number, decimals = 0): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(decimals);
}

async function CompaniesData() {
  const [btc, eth] = await Promise.all([
    getBitcoinTreasuries().catch(() => null),
    getEthereumTreasuries().catch(() => null),
  ]);

  // Merge both lists — a company can hold both
  const btcCompanies = btc?.companies ?? [];
  const ethCompanies = eth?.companies ?? [];

  // Dedupe by company name, merging BTC and ETH holdings
  const merged = new Map<string, {
    name: string; symbol: string; country: string;
    btcHoldings: number; btcValueUsd: number;
    ethHoldings: number; ethValueUsd: number;
    totalValueUsd: number;
  }>();

  btcCompanies.forEach((c) => {
    merged.set(c.name, {
      name: c.name, symbol: c.symbol, country: c.country,
      btcHoldings: c.total_holdings, btcValueUsd: c.total_current_value_usd,
      ethHoldings: 0, ethValueUsd: 0,
      totalValueUsd: c.total_current_value_usd,
    });
  });

  ethCompanies.forEach((c) => {
    const existing = merged.get(c.name);
    if (existing) {
      existing.ethHoldings  = c.total_holdings;
      existing.ethValueUsd  = c.total_current_value_usd;
      existing.totalValueUsd += c.total_current_value_usd;
    } else {
      merged.set(c.name, {
        name: c.name, symbol: c.symbol, country: c.country,
        btcHoldings: 0, btcValueUsd: 0,
        ethHoldings: c.total_holdings, ethValueUsd: c.total_current_value_usd,
        totalValueUsd: c.total_current_value_usd,
      });
    }
  });

  const companies = [...merged.values()]
    .sort((a, b) => b.totalValueUsd - a.totalValueUsd);

  const totalBtcValue = btc?.total_value_usd ?? 0;
  const totalEthValue = eth?.total_value_usd ?? 0;
  const totalBtcHeld  = btc?.total_holdings ?? 0;
  const totalEthHeld  = eth?.total_holdings ?? 0;

  return (
    <div className="space-y-8 pb-20">
      <DataHeader
        title="Crypto Companies"
        description="Public companies holding BTC and ETH on their corporate balance sheets."
      />

      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - CoinGecko
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          {companies.length} companies tracked - refreshed every 6h
        </span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total BTC Held",   value: `${fmtCoin(totalBtcHeld)} BTC`, color: "#FABF2C" },
          { label: "Total BTC Value",  value: fmtUsd(totalBtcValue),           color: "#FABF2C" },
          { label: "Total ETH Held",   value: `${fmtCoin(totalEthHeld)} ETH`,  color: "#3b82f6" },
          { label: "Total ETH Value",  value: fmtUsd(totalEthValue),           color: "#3b82f6" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabbed view: All / BTC only / ETH only */}
      {companies.length === 0 ? (
        <div className="border border-dashed border-[#1a1a1a] p-12 text-center">
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
            Treasury data unavailable - CoinGecko rate limited
          </p>
        </div>
      ) : (
        <div className="border border-[#1a1a1a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-[#1a1a1a] bg-[#050505]">
              <tr>
                {["#", "Company", "Country", "BTC Holdings", "BTC Value", "ETH Holdings", "ETH Value", "Total Value"].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                    ["#", "Company", "Country"].includes(h) ? "text-left" : "text-right"
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => (
                <tr key={c.name} className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                  i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                }`}>
                  <td className="px-4 py-3 text-[#333] font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-white">{c.name}</div>
                    {c.symbol && <div className="text-[9px] font-mono text-[#555]">{c.symbol}</div>}
                  </td>
                  <td className="px-4 py-3 text-[#888]">{c.country || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#FABF2C]">
                    {c.btcHoldings > 0 ? `${fmtCoin(c.btcHoldings)} BTC` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {c.btcValueUsd > 0 ? fmtUsd(c.btcValueUsd) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#3b82f6]">
                    {c.ethHoldings > 0 ? `${fmtCoin(c.ethHoldings)} ETH` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                    {c.ethValueUsd > 0 ? fmtUsd(c.ethValueUsd) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black tabular-nums text-white">
                    {fmtUsd(c.totalValueUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[9px] text-[#333] font-mono text-right">
        Source: CoinGecko /companies/public_treasury/bitcoin + /ethereum - Free API - Cached 6h
      </p>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <CompaniesData />
      </Suspense>
    </main>
  );
}
