import React from "react";
import { DataHeader } from "../../_components/DataHeader";
import type { EtfOverview } from "@/lib/etf-data";

interface Props { coin: "BTC" | "ETH"; overview: EtfOverview; }

function fmtUsd(n: number, compact = true): string {
  if (compact) {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  }
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtNum(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function PctCell({ val }: { val: number }) {
  const pos = val >= 0;
  return (
    <span className="font-mono font-bold tabular-nums text-xs" style={{ color: pos ? "#00d672" : "#ff4757" }}>
      {pos ? "+" : ""}{val.toFixed(2)}%
    </span>
  );
}

export function EtfPageLayout({ coin, overview }: Props) {
  const accent = coin === "BTC" ? "#FABF2C" : "#3b82f6";
  const { products, totalAumUsd, coinPrice, totalHoldings, pctOfSupply } = overview;

  const maxShare = Math.max(...products.map((p) => p.marketShare));

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title={`${coin === "BTC" ? "Bitcoin" : "Ethereum"} Spot ETFs`}
        description={`US-listed spot ${coin} ETFs — live AUM (holdings × spot price), fees, premium/discount, and market share.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `Total ${coin} ETF AUM`, value: fmtUsd(totalAumUsd), color: accent },
          { label: `${coin} Spot Price`, value: `$${coinPrice.toLocaleString()}`, color: "#fff" },
          { label: `Total ${coin} Held`, value: `${fmtNum(totalHoldings)} ${coin}`, color: "#fff" },
          { label: "% of Supply Held", value: `${pctOfSupply.toFixed(2)}%`, color: "#00d672" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 pl-3 mb-6"
            style={{ borderColor: accent }}>
          AUM Market Share
        </h3>
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.ticker} className="flex items-center gap-4">
              <span className="w-12 text-right font-black text-white text-xs shrink-0">{p.ticker}</span>
              <div className="flex-1 h-5 bg-[#111] relative overflow-hidden">
                <div className="h-full transition-all duration-500"
                  style={{ width: `${(p.marketShare / maxShare) * 100}%`, background: accent, opacity: 0.8 }} />
              </div>
              <span className="w-16 text-right font-mono text-xs text-[#888] tabular-nums shrink-0">
                {p.marketShare.toFixed(1)}%
              </span>
              <span className="w-20 text-right font-mono text-xs tabular-nums shrink-0" style={{ color: accent }}>
                {fmtUsd(p.aumUsd)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full" style={{ background: accent }} />All Products
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {[
                  "Ticker", "Issuer", `${coin} Holdings`, "AUM (Live)",
                  "Share", "Prem/Disc", "Sponsor Fee", "Inception",
                ].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest whitespace-nowrap ${
                    h === "Ticker" || h === "Issuer" ? "text-left" : "text-right"
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const navPerShare = p.holdings > 0 ? p.aumUsd / p.holdings : coinPrice;
                const premiumPct  = coinPrice > 0 ? ((navPerShare - coinPrice) / coinPrice) * 100 : 0;

                return (
                  <tr key={p.ticker}
                    className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                      i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                    }`}>
                    <td className="px-4 py-3 font-black text-white">{p.ticker}</td>
                    <td className="px-4 py-3 font-bold text-[#ccc]">{p.issuer}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {p.holdings.toLocaleString()} {coin}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black tabular-nums" style={{ color: accent }}>
                      {fmtUsd(p.aumUsd)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {p.marketShare.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PctCell val={premiumPct} />
                    </td>
                    <td className={`px-4 py-3 text-right font-mono tabular-nums ${
                      p.feeNum <= 0.002 ? "text-[#00d672]" : p.feeNum >= 0.015 ? "text-[#ff4757]" : "text-[#FABF2C]"
                    }`}>{p.fee}</td>
                    <td className="px-4 py-3 text-right text-[#555] font-mono">{p.inception}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          <span className="text-[#888] font-black">Methodology:</span>{" "}
          AUM = on-chain / public filing {coin} holdings × live CoinGecko spot price (updated every 5 minutes).
          Premium/Discount = (AUM per share — spot price) / spot price × 100. Positive = fund trades above NAV.
          Holdings sourced from SEC 13-F filings and on-chain attestations.
        </p>
      </div>
    </div>
  );
}

export default EtfPageLayout;
