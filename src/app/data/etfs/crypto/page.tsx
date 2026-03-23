import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import { getCoinPrice }     from "@/lib/api";
import { Clock }            from "lucide-react";

export const metadata = { title: "Crypto Index ETFs | CryptoBrainNews" };
export const revalidate = 300;

const OTHER_FILINGS = [
  { applicant: "Canary Capital", asset: "DOGE",  coinId: "dogecoin",   type: "Spot ETF", status: "Filed", filed: "Dec 2024" },
  { applicant: "Canary Capital", asset: "LTC",   coinId: "litecoin",   type: "Spot ETF", status: "Filed", filed: "Dec 2024" },
  { applicant: "Grayscale",      asset: "LINK",  coinId: "chainlink",  type: "Trust",    status: "Filed", filed: "Dec 2024" },
  { applicant: "Grayscale",      asset: "ADA",   coinId: "cardano",    type: "Trust",    status: "Filed", filed: "Dec 2024" },
  { applicant: "Grayscale",      asset: "AVAX",  coinId: "avalanche-2",type: "Trust",    status: "Filed", filed: "Jan 2025" },
  { applicant: "Canary Capital", asset: "HBAR",  coinId: "hedera-hashgraph", type: "Spot ETF", status: "Filed", filed: "Jan 2025" },
];

async function CryptoEtfData() {
  // Fetch prices for the top 3 assets in these filings
  const [dogePrice, ltcPrice, adaPrice] = await Promise.all([
    getCoinPrice("dogecoin").catch(() => 0),
    getCoinPrice("litecoin").catch(() => 0),
    getCoinPrice("cardano").catch(() => 0),
  ]);

  const prices: Record<string, number> = {
    DOGE: dogePrice,
    LTC:  ltcPrice,
    ADA:  adaPrice,
  };

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Crypto Index ETFs - Other Assets"
        description="Tracking SEC filings for DOGE, LTC, LINK, ADA, AVAX, HBAR, and other crypto ETF products."
      />

      {/* Live price cards for top filed assets */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { ticker: "DOGE", color: "#c2a633", label: "Dogecoin" },
          { ticker: "LTC",  color: "#345d9d", label: "Litecoin" },
          { ticker: "ADA",  color: "#0033ad", label: "Cardano"  },
        ].map(({ ticker, color, label }) => (
          <div key={ticker} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">
              {label} Spot Price
            </p>
            <p className="text-2xl font-black tabular-nums" style={{ color }}>
              {prices[ticker] > 0 ? `$${prices[ticker].toFixed(4)}` : "-"}
            </p>
            <p className="text-[9px] font-mono text-[#555] mt-1">CoinGecko live</p>
          </div>
        ))}
      </div>

      {/* Status banner */}
      <div className="border border-[#FABF2C]/20 bg-[#FABF2C]/[0.02] p-5 flex gap-4 items-start">
        <Clock className="text-[#FABF2C] shrink-0 mt-0.5" size={18} />
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          <span className="text-[#FABF2C] font-black">Post-BTC/ETH wave:</span> Following
          approval of Bitcoin and Ethereum spot ETFs in 2024, a second wave of altcoin
          ETF filings is under SEC review. Live trading data and AUM will be added as
          products launch.
        </p>
      </div>

      {/* Filings table */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#888] rounded-full" />
          Filed Applications
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {["Applicant", "Asset", "Type", "Date Filed", "Status"].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${h === "Status" ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OTHER_FILINGS.map((f, i) => (
                <tr key={`${f.applicant}-${f.asset}`} className={`border-b border-[#111] ${i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"}`}>
                  <td className="px-4 py-3 font-bold text-white">{f.applicant}</td>
                  <td className="px-4 py-3">
                    <span className="font-black text-[#FABF2C]">{f.asset}</span>
                  </td>
                  <td className="px-4 py-3 text-[#888]">{f.type}</td>
                  <td className="px-4 py-3 font-mono text-[#555]">{f.filed}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-[10px] px-2 py-0.5 border text-[#FABF2C] border-[#FABF2C]/30 bg-[#FABF2C]/10">
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] text-[#333] font-mono mt-2 text-right">
          Source: SEC EDGAR public filings - Updated manually
        </p>
      </div>
    </div>
  );
}

export default function CryptoEtfsPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <CryptoEtfData />
      </Suspense>
    </main>
  );
}