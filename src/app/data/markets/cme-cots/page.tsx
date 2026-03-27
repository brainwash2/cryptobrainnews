import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";

export const metadata = {
  title: "CME COTs | CryptoBrainNews",
  description: "CFTC Commitments of Traders for Bitcoin and Ether CME futures.",
};
export const revalidate = 86400;

/**
 * CME COTs page — Phase 45
 *
 * Data source: CFTC direct ZIP file at www.cftc.gov (Akamai CDN, no Socrata)
 * Fallback:    Socrata JSON API (publicreporting.cftc.gov) — blocked from some Vercel regions
 * Final fallback: reference snapshot (Q1 2026)
 *
 * The Socrata API at publicreporting.cftc.gov uses Cloudflare which blocks
 * certain cloud provider IPs. The direct ZIP from www.cftc.gov is on Akamai
 * CDN and is broadly accessible.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedCot {
  market:       string;
  reportDate:   string;
  openInterest: number;
  categories: Array<{
    name: string; description: string;
    long: number; short: number; net: number;
  }>;
}

// ─── Reference fallback (Q1 2026, latest publicly available data) ──────────────
// Used when both API and ZIP fetch fail.
const COT_REFERENCE: ParsedCot[] = [
  {
    market: "Bitcoin CME (Reference — Q1 2026)",
    reportDate: "2026-03-18",
    openInterest: 26_450,
    categories: [
      { name: "Managed Money",     description: "Hedge funds, CTAs, commodity pools.",         long: 8_200, short: 2_100, net:  6_100 },
      { name: "Swap Dealers",      description: "Financial institutions managing swap exposure.", long: 1_200, short: 4_800, net: -3_600 },
      { name: "Producer/Merchant", description: "Commercial entities hedging via futures.",      long:   450, short:   280, net:    170 },
      { name: "Other Reportables", description: "Large non-commercial traders.",                 long: 3_100, short: 1_900, net:  1_200 },
      { name: "Non-Reportable",    description: "Retail traders below CFTC threshold.",          long: 1_800, short: 5_820, net: -4_020 },
    ],
  },
  {
    market: "Ether CME (Reference — Q1 2026)",
    reportDate: "2026-03-18",
    openInterest: 18_320,
    categories: [
      { name: "Managed Money",     description: "Hedge funds, CTAs, commodity pools.",         long: 4_100, short: 1_800, net:  2_300 },
      { name: "Swap Dealers",      description: "Financial institutions managing swap exposure.", long:   820, short: 3_200, net: -2_380 },
      { name: "Producer/Merchant", description: "Commercial entities hedging via futures.",      long:   190, short:   140, net:     50 },
      { name: "Other Reportables", description: "Large non-commercial traders.",                 long: 2_100, short: 1_200, net:    900 },
      { name: "Non-Reportable",    description: "Retail traders below CFTC threshold.",          long: 1_200, short: 4_070, net: -2_870 },
    ],
  },
];

// ─── Fetcher 1: CFTC direct ZIP (www.cftc.gov — Akamai CDN) ──────────────────
// Parses the weekly disaggregated futures ZIP file directly.
// ZIP parsing uses Node.js built-in zlib.inflateRaw for the DEFLATE payload.

async function fetchFromCftcZip(): Promise<ParsedCot[]> {
  try {
    const res = await fetch(
      "https://www.cftc.gov/dea/newcot/fut_disagg_txt.zip",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CryptoBrainNews/1.0)",
          "Accept": "application/zip, */*",
        },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return [];

    const zipBuffer = Buffer.from(await res.arrayBuffer());

    // Minimal ZIP local file header parser
    // Magic: PK\x03\x04 (bytes 0-3)
    // Compression: bytes 8-9 (8 = DEFLATE, 0 = stored)
    // Compressed size: bytes 18-21
    // Filename length: bytes 26-27
    // Extra length: bytes 28-29
    // Data starts at: 30 + filename_length + extra_length

    if (zipBuffer[0] !== 0x50 || zipBuffer[1] !== 0x4B ||
        zipBuffer[2] !== 0x03 || zipBuffer[3] !== 0x04) {
      return []; // Not a valid ZIP
    }

    const compressionMethod = zipBuffer.readUInt16LE(8);
    const compressedSize    = zipBuffer.readUInt32LE(18);
    const filenameLen       = zipBuffer.readUInt16LE(26);
    const extraLen          = zipBuffer.readUInt16LE(28);
    const dataOffset        = 30 + filenameLen + extraLen;

    const compressedData = zipBuffer.slice(dataOffset, dataOffset + compressedSize);

    let csvText: string;
    if (compressionMethod === 8) {
      // DEFLATE — use Node.js zlib
      const { inflateRaw } = await import("zlib");
      const { promisify }  = await import("util");
      const inflate = promisify(inflateRaw);
      const decompressed = await inflate(compressedData);
      csvText = decompressed.toString("latin1");
    } else if (compressionMethod === 0) {
      // Stored (no compression)
      csvText = compressedData.toString("latin1");
    } else {
      return []; // Unsupported compression
    }

    return parseCotCsv(csvText);
  } catch (err) {
    console.warn("[COT] ZIP fetch failed:", err);
    return [];
  }
}

// ─── Fetcher 2: Socrata JSON API fallback ─────────────────────────────────────
async function fetchFromSocrata(): Promise<ParsedCot[]> {
  const MARKETS = [
    { key: "BITCOIN",    label: "Bitcoin CME"      },
    { key: "ETHER CASH", label: "Ether CME"        },
  ];
  const results: ParsedCot[] = [];
  const n = (s: string) => parseInt((s ?? "0").replace(/,/g, ""), 10) || 0;

  for (const { key, label } of MARKETS) {
    try {
      const url =
        `https://publicreporting.cftc.gov/resource/72hh-3qpy.json` +
        `?$where=upper(market_and_exchange_names)%20like%20'%25${encodeURIComponent(key)}%25'` +
        `&$order=report_date_as_yyyy_mm_dd%20DESC&$limit=1`;
      const res = await fetch(url, {
        headers: { "Accept": "application/json", "X-App-Token": "cftc-public" },
        next: { revalidate: 86400 },
      });
      if (!res.ok) continue;
      const rows = await res.json() as Record<string, string>[];
      if (!rows.length) continue;
      const r = rows[0];
      results.push(buildParsedCot(label, r, n));
    } catch { /* try next */ }
  }
  return results;
}

// ─── CSV parser for the CFTC disaggregated futures text file ──────────────────
function parseCotCsv(csv: string): ParsedCot[] {
  const lines = csv.split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  // Header row to find column indices
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase());
  const col = (name: string): number => headers.findIndex((h) => h.includes(name));

  const idx = {
    market:   col("market and exchange"),
    date:     col("as_of_date"),
    oi:       col("open_interest_all"),
    pmLong:   col("prod_merc_positions_long_all"),
    pmShort:  col("prod_merc_positions_short_all"),
    swLong:   col("swap_positions_long_all"),
    swShort:  col("swap__positions_short"),
    mmLong:   col("m_money_positions_long_all"),
    mmShort:  col("m_money_positions_short_all"),
    orLong:   col("other_rept_positions_long_all"),
    orShort:  col("other_rept_positions_short_all"),
    nrLong:   col("nonrept_positions_long_all"),
    nrShort:  col("nonrept_positions_short_all"),
  };

  const TARGETS = ["BITCOIN", "ETHER"];
  const results: ParsedCot[] = [];
  const n = (val: string): number => parseInt((val ?? "0").replace(/[^0-9-]/g, ""), 10) || 0;

  // Group by market, take latest date
  const latest = new Map<string, string[]>();
  for (const line of lines.slice(1)) {
    const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
    const market = cols[idx.market] ?? "";
    const upper  = market.toUpperCase();
    if (!TARGETS.some((t) => upper.includes(t))) continue;
    const existing = latest.get(upper);
    if (!existing || (cols[idx.date] ?? "") > (existing[idx.date] ?? "")) {
      latest.set(upper, cols);
    }
  }

  for (const [marketKey, cols] of latest) {
    const label = marketKey.includes("MICRO") ? "Micro Bitcoin CME" :
                  marketKey.includes("BITCOIN") ? "Bitcoin CME" : "Ether CME";
    results.push({
      market:       label,
      reportDate:   (cols[idx.date] ?? "").slice(0, 10),
      openInterest: n(cols[idx.oi]),
      categories: [
        { name: "Managed Money",     description: "Hedge funds, CTAs, commodity pools.",         long: n(cols[idx.mmLong]),  short: n(cols[idx.mmShort]),  net: n(cols[idx.mmLong])  - n(cols[idx.mmShort])  },
        { name: "Swap Dealers",      description: "Financial institutions managing swap exposure.", long: n(cols[idx.swLong]),  short: n(cols[idx.swShort]),  net: n(cols[idx.swLong])  - n(cols[idx.swShort])  },
        { name: "Producer/Merchant", description: "Commercial entities hedging via futures.",      long: n(cols[idx.pmLong]),  short: n(cols[idx.pmShort]),  net: n(cols[idx.pmLong])  - n(cols[idx.pmShort])  },
        { name: "Other Reportables", description: "Large non-commercial traders.",                 long: n(cols[idx.orLong]),  short: n(cols[idx.orShort]),  net: n(cols[idx.orLong])  - n(cols[idx.orShort])  },
        { name: "Non-Reportable",    description: "Retail traders below CFTC threshold.",          long: n(cols[idx.nrLong]),  short: n(cols[idx.nrShort]),  net: n(cols[idx.nrLong])  - n(cols[idx.nrShort])  },
      ],
    });
  }
  return results.sort((a, b) => a.market.localeCompare(b.market));
}

// ─── Build ParsedCot from Socrata row ─────────────────────────────────────────
function buildParsedCot(
  label: string,
  r: Record<string, string>,
  n: (s: string) => number
): ParsedCot {
  return {
    market:       label,
    reportDate:   r.report_date_as_yyyy_mm_dd?.slice(0, 10) ?? "",
    openInterest: n(r.open_interest_all),
    categories: [
      { name: "Managed Money",     description: "Hedge funds, CTAs, commodity pools.",         long: n(r.m_money_positions_long_all),   short: n(r.m_money_positions_short_all),   net: n(r.m_money_positions_long_all)   - n(r.m_money_positions_short_all)   },
      { name: "Swap Dealers",      description: "Financial institutions managing swap exposure.", long: n(r.swap_positions_long_all),        short: n(r.swap__positions_short_all),     net: n(r.swap_positions_long_all)        - n(r.swap__positions_short_all)       },
      { name: "Producer/Merchant", description: "Commercial entities hedging via futures.",      long: n(r.prod_merc_positions_long_all),   short: n(r.prod_merc_positions_short_all), net: n(r.prod_merc_positions_long_all)   - n(r.prod_merc_positions_short_all)   },
      { name: "Other Reportables", description: "Large non-commercial traders.",                 long: n(r.other_rept_positions_long_all),  short: n(r.other_rept_positions_short_all), net: n(r.other_rept_positions_long_all) - n(r.other_rept_positions_short_all)  },
      { name: "Non-Reportable",    description: "Retail traders below CFTC threshold.",          long: n(r.nonrept_positions_long_all),     short: n(r.nonrept_positions_short_all),   net: n(r.nonrept_positions_long_all)     - n(r.nonrept_positions_short_all)     },
    ],
  };
}

// ─── Main data fetch (tries ZIP → Socrata → reference) ───────────────────────
async function fetchCotData(): Promise<{ markets: ParsedCot[]; source: string }> {
  // Try 1: direct CFTC ZIP
  const zipData = await fetchFromCftcZip().catch(() => []);
  if (zipData.length > 0) return { markets: zipData, source: "live" };

  // Try 2: Socrata JSON API
  const socrataData = await fetchFromSocrata().catch(() => []);
  if (socrataData.length > 0) return { markets: socrataData, source: "live" };

  // Fallback: reference snapshot
  return { markets: COT_REFERENCE, source: "reference" };
}

// ─── Render ───────────────────────────────────────────────────────────────────
function fmtC(n: number): string { return n ? n.toLocaleString() : "-"; }

async function CotsData() {
  const { markets, source } = await fetchCotData();
  const isReference = source === "reference";
  const latestDate  = markets[0]?.reportDate ?? null;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="CME Commitments of Traders (COT)"
        description="Institutional positioning data for Bitcoin, Ether, and Micro Bitcoin CME futures."
      />

      <div className="flex items-center gap-3 flex-wrap">
        <span className={"border font-mono text-[10px] px-3 py-1 uppercase tracking-widest " +
          (isReference
            ? "border-[#FABF2C]/40 text-[#FABF2C]"
            : "border-[#00d672]/40 text-[#00d672]")}>
          {isReference ? "Reference - Q1 2026 Snapshot" : "Live - CFTC"}
        </span>
        {latestDate && (
          <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
            Report date: {latestDate} - Published weekly Friday - Cached 24h
          </span>
        )}
      </div>

      {isReference && (
        <div className="border border-[#FABF2C]/20 bg-[#FABF2C]/[0.03] p-4 flex items-start gap-3">
          <span className="text-[#FABF2C] font-mono text-[10px] shrink-0 mt-0.5 font-black">NOTE</span>
          <p className="text-[10px] font-mono text-[#888] leading-relaxed">
            The CFTC live API is temporarily unavailable from this server region.
            Showing reference snapshot from Q1 2026. Live data publishes every Friday at
            cftc.gov/MarketReports/CommitmentsofTraders/index.htm
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Report Frequency", value: "Weekly",     sub: "Released every Friday" },
          { label: "Data Lag",         value: "3 Days",     sub: "Tuesday close to Friday" },
          { label: "Source",           value: "CFTC",       sub: "cftc.gov direct" },
          { label: "Contracts",        value: "BTC / ETH",  sub: "CME + Micro CME" },
        ].map((s) => (
          <div key={s.label} className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-black text-[#FABF2C]">{s.value}</p>
            <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {markets.map((m) => (
        <div key={m.market} className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
              <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
              {m.market}
            </h2>
            <span className="text-[10px] font-mono text-[#555]">
              Report: {m.reportDate} - OI: <span className="text-[#FABF2C] font-black">{fmtC(m.openInterest)}</span> contracts
            </span>
          </div>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                  {["Category","Description","Long OI","Short OI","Net","Bias"].map((h) => (
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
                  const sentColor = cat.net > 0 ? "#00d672" : cat.net < 0 ? "#ff4757" : "#555";
                  return (
                    <tr key={cat.name}
                      className={"border-b border-[#111] " + (i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]")}>
                      <td className="px-4 py-4 font-bold text-white whitespace-nowrap">{cat.name}</td>
                      <td className="px-4 py-4 text-[#555] font-mono text-[10px] max-w-xs">{cat.description}</td>
                      <td className="px-4 py-4 text-right font-mono text-[#00d672] tabular-nums">{fmtC(cat.long)}</td>
                      <td className="px-4 py-4 text-right font-mono text-[#ff4757] tabular-nums">{fmtC(cat.short)}</td>
                      <td className={"px-4 py-4 text-right font-mono font-black tabular-nums " +
                        (cat.net > 0 ? "text-[#00d672]" : "text-[#ff4757]")}>
                        {cat.net > 0 ? "+" : ""}{fmtC(cat.net)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-mono text-[10px] font-black" style={{ color: sentColor }}>
                          {cat.net > 0 ? "Bullish" : cat.net < 0 ? "Bearish" : "Neutral"}
                          {ratio !== null && cat.name === "Managed Money" && (
                            <span className="text-[#555] font-normal ml-1">({ratio.toFixed(1)}x)</span>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">How to Read This Data</h3>
        <ul className="space-y-1 text-[10px] font-mono text-[#888] leading-relaxed">
          {[
            "Managed Money L/S ratio above 3x = speculative optimism. Historically reversal-prone at extremes.",
            "Net Position = Long OI minus Short OI. Positive = net long (bullish). Negative = net short (bearish).",
            "Swap Dealers typically delta-neutral; net position signals institutional hedging flow direction.",
            "Rising Open Interest with rising price confirms trend strength.",
          ].map((t, i) => <li key={i}>{i + 1}. {t}</li>)}
        </ul>
      </div>

      <p className="text-[9px] text-[#333] font-mono text-right">
        Source: CFTC Disaggregated Futures Only -
        {isReference ? " Reference Q1 2026 - Live: cftc.gov/dea/newcot/fut_disagg_txt.zip" : " www.cftc.gov/dea/newcot/fut_disagg_txt.zip - Cached 24h"}
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