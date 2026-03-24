import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";

export const metadata = {
  title: "CME COTs | CryptoBrainNews",
  description: "CFTC Commitments of Traders for Bitcoin and Ether CME futures - institutional positioning.",
};
export const revalidate = 86400; // 24h — CFTC updates once per week on Friday

// ─── Types ───────────────────────────────────────────────────────────────────

interface CotRow {
  market_and_exchange_names:     string;
  report_date_as_yyyy_mm_dd:     string;
  open_interest_all:             string;
  prod_merc_positions_long_all:  string;
  prod_merc_positions_short_all: string;
  swap_positions_long_all:       string;
  swap__positions_short_all:     string;
  m_money_positions_long_all:    string;
  m_money_positions_short_all:   string;
  other_rept_positions_long_all: string;
  other_rept_positions_short_all:string;
  nonrept_positions_long_all:    string;
  nonrept_positions_short_all:   string;
}

interface ParsedCot {
  market:       string;
  reportDate:   string;
  openInterest: number;
  categories: Array<{
    name:        string;
    description: string;
    long:        number;
    short:       number;
    net:         number;
  }>;
}

// ─── CFTC Socrata API fetcher ─────────────────────────────────────────────────
// Disaggregated Futures Only dataset: publicreporting.cftc.gov/resource/72hh-3qpy.json
// Filter to BTC + ETH CME futures, latest report only.
// Free, no key, no IP restrictions.

async function fetchCotData(): Promise<ParsedCot[]> {
  const BASE = "https://publicreporting.cftc.gov/resource/72hh-3qpy.json";
  const MARKETS = [
    { key: "BITCOIN",           label: "Bitcoin (CME)" },
    { key: "ETHER",             label: "Ether (CME)" },
    { key: "MICRO BITCOIN",     label: "Micro Bitcoin (CME)" },
  ];

  const results: ParsedCot[] = [];

  for (const { key, label } of MARKETS) {
    try {
      // $where filter + $order to get latest report first + $limit 1
      const url =
        `${BASE}?$where=upper(market_and_exchange_names)%20like%20'%25${encodeURIComponent(key)}%25'` +
        `&$order=report_date_as_yyyy_mm_dd%20DESC&$limit=1`;

      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) continue;
      const rows = await res.json() as CotRow[];
      if (!rows.length) continue;

      const r = rows[0];
      const n = (s: string) => parseInt(s.replace(/,/g, ""), 10) || 0;

      results.push({
        market:       label,
        reportDate:   r.report_date_as_yyyy_mm_dd?.slice(0, 10) ?? "",
        openInterest: n(r.open_interest_all),
        categories: [
          {
            name: "Managed Money",
            description: "Hedge funds, CTAs, and commodity pools — speculative sentiment proxy.",
            long:  n(r.m_money_positions_long_all),
            short: n(r.m_money_positions_short_all),
            net:   n(r.m_money_positions_long_all) - n(r.m_money_positions_short_all),
          },
          {
            name: "Swap Dealers",
            description: "Financial institutions managing swap exposure — often opposite to Managed Money.",
            long:  n(r.swap_positions_long_all),
            short: n(r.swap__positions_short_all),
            net:   n(r.swap_positions_long_all) - n(r.swap__positions_short_all),
          },
          {
            name: "Producer / Merchant",
            description: "Commercial entities hedging physical exposure to Bitcoin via futures.",
            long:  n(r.prod_merc_positions_long_all),
            short: n(r.prod_merc_positions_short_all),
            net:   n(r.prod_merc_positions_long_all) - n(r.prod_merc_positions_short_all),
          },
          {
            name: "Other Reportables",
            description: "Large traders not classified above — family offices and smaller funds.",
            long:  n(r.other_rept_positions_long_all),
            short: n(r.other_rept_positions_short_all),
            net:   n(r.other_rept_positions_long_all) - n(r.other_rept_positions_short_all),
          },
          {
            name: "Non-Reportable",
            description: "Retail traders and small speculators below CFTC reporting thresholds.",
            long:  n(r.nonrept_positions_long_all),
            short: n(r.nonrept_positions_short_all),
            net:   n(r.nonrept_positions_long_all) - n(r.nonrept_positions_short_all),
          },
        ],
      });
    } catch { /* skip this market */ }
  }

  return results;
}

// ─── Page component ───────────────────────────────────────────────────────────

function fmtContracts(n: number): string {
  if (!n) return "—";
  return n.toLocaleString();
}

async function CotsData() {
  const markets = await fetchCotData().catch(() => []);
  const isLive  = markets.length > 0;
  const latestDate = markets[0]?.reportDate ?? null;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="CME Commitments of Traders (COT)"
        description="Institutional positioning data for Bitcoin, Ether, and Micro Bitcoin CME futures."
      />

      {/* Source badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={"border font-mono text-[10px] px-3 py-1 uppercase tracking-widest " +
          (isLive
            ? "border-[#00d672]/40 text-[#00d672]"
            : "border-[#FABF2C]/40 text-[#FABF2C]")}>
          {isLive ? "Live - CFTC Socrata API" : "CFTC API Unavailable"}
        </span>
        {latestDate && (
          <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
            Report date: {latestDate} - Published every Friday - Refreshed daily
          </span>
        )}
      </div>

      {/* Metadata cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Report Frequency", value: "Weekly",    sub: "Released every Friday" },
          { label: "Data Lag",         value: "3 Days",    sub: "Tuesday close to Friday release" },
          { label: "Source",           value: "CFTC",      sub: "publicreporting.cftc.gov" },
          { label: "Contracts",        value: "BTC / ETH", sub: "CME + Micro CME" },
        ].map((s) => (
          <div key={s.label} className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-black text-[#FABF2C]">{s.value}</p>
            <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* One section per market */}
      {!isLive ? (
        <div className="border border-dashed border-[#1a1a1a] p-12 text-center">
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest mb-2">
            CFTC API temporarily unavailable
          </p>
          <p className="text-[9px] text-[#333] font-mono">
            Source: publicreporting.cftc.gov/resource/72hh-3qpy.json
          </p>
        </div>
      ) : (
        markets.map((m) => (
          <div key={m.market} className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
                {m.market}
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-mono text-[#555]">
                <span>Report date: <span className="text-[#888]">{m.reportDate}</span></span>
                <span>Open interest: <span className="text-[#FABF2C] font-black">{fmtContracts(m.openInterest)}</span> contracts</span>
              </div>
            </div>

            <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                    {["Category", "Description", "Long OI", "Short OI", "Net Position", "Sentiment"].map((h) => (
                      <th key={h} className={"px-4 py-3 font-black text-[#555] uppercase tracking-widest whitespace-nowrap " +
                        (["Category","Description"].includes(h) ? "text-left" : "text-right")}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {m.categories.map((cat, i) => {
                    const ratio = cat.short > 0 ? cat.long / cat.short : null;
                    const sentiment =
                      cat.net > 0 ? "Bullish" :
                      cat.net < 0 ? "Bearish" : "Neutral";
                    const sentColor =
                      cat.net > 0 ? "#00d672" :
                      cat.net < 0 ? "#ff4757" : "#555";

                    return (
                      <tr key={cat.name}
                        className={"border-b border-[#111] " + (i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]")}>
                        <td className="px-4 py-4 font-bold text-white whitespace-nowrap">{cat.name}</td>
                        <td className="px-4 py-4 text-[#555] font-mono text-[10px] max-w-xs">{cat.description}</td>
                        <td className="px-4 py-4 text-right font-mono text-[#00d672] tabular-nums">
                          {fmtContracts(cat.long)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-[#ff4757] tabular-nums">
                          {fmtContracts(cat.short)}
                        </td>
                        <td className={"px-4 py-4 text-right font-mono font-black tabular-nums " +
                          (cat.net > 0 ? "text-[#00d672]" : cat.net < 0 ? "text-[#ff4757]" : "text-[#555]")}>
                          {cat.net > 0 ? "+" : ""}{fmtContracts(cat.net)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-mono text-[10px] font-black" style={{ color: sentColor }}>
                            {sentiment}
                            {ratio !== null && cat.name === "Managed Money" &&
                              <span className="text-[#555] font-normal ml-1">({ratio.toFixed(1)}x)</span>
                            }
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* How to read */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-6 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-white">How to Read This Data</h3>
        <ul className="space-y-2 text-[10px] font-mono text-[#888] leading-relaxed">
          {[
            "Managed Money Long/Short Ratio: a high long ratio (greater than 3x) suggests speculative optimism. Historically reversal-prone at extremes.",
            "Net Position = Long OI minus Short OI. Positive = net long (bullish bias). Negative = net short (bearish bias).",
            "Swap Dealers are typically delta-neutral, but their net position signals hedging flow direction.",
            "Open Interest is total outstanding contracts. A rising OI with rising price confirms trend strength.",
          ].map((tip, i) => (
            <li key={i}>{i + 1}. {tip}</li>
          ))}
        </ul>
      </div>

      <p className="text-[9px] text-[#333] font-mono text-right">
        Source: CFTC Disaggregated Futures Only - publicreporting.cftc.gov/resource/72hh-3qpy.json - Free, no key - Cached 24h
      </p>
    </div>
  );
}

export default function CmeCotsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <CotsData />
      </Suspense>
    </main>
  );
}
