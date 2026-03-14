import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import { Clock }      from 'lucide-react';

export const metadata = { title: 'CME COTs | CryptoBrainNews' };

const TRADER_CATEGORIES = [
  {
    name: 'Managed Money',
    description: 'Hedge funds, CTAs, and commodity pools. Often proxy for speculative sentiment.',
    long: '—', short: '—', net: '—',
  },
  {
    name: 'Swap Dealers',
    description: 'Financial institutions managing swap exposure. Often on the opposite side of Managed Money.',
    long: '—', short: '—', net: '—',
  },
  {
    name: 'Producer / Merchant',
    description: 'Commercial entities hedging physical exposure to Bitcoin via futures.',
    long: '—', short: '—', net: '—',
  },
  {
    name: 'Other Reportables',
    description: 'Large traders not classified above. Includes family offices and smaller funds.',
    long: '—', short: '—', net: '—',
  },
  {
    name: 'Non-Reportable',
    description: 'Retail traders and small speculators below CFTC reporting thresholds.',
    long: '—', short: '—', net: '—',
  },
];

export default function CmeCotsPage() {
  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="CME Commitments of Traders (COT)"
        description="Institutional positioning data for Bitcoin, Ether, and Micro Bitcoin CME futures."
      />

      {/* Status Banner */}
      <div className="border border-[#FABF2C]/30 bg-[#FABF2C]/[0.03] p-5 flex items-start gap-4">
        <Clock className="text-[#FABF2C] shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-xs font-black text-[#FABF2C] uppercase tracking-widest mb-1">
            Integration In Progress
          </p>
          <p className="text-[10px] font-mono text-[#888] leading-relaxed">
            The CFTC releases COT data every Friday (for the prior Tuesday close).
            Automated parsing of the CFTC weekly CSV is being implemented.
            Live data will populate this page automatically once the pipeline is active.
          </p>
        </div>
      </div>

      {/* What are COTs */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 space-y-4">
        <h2 className="text-base font-black uppercase tracking-widest text-white">
          What Is the COT Report?
        </h2>
        <p className="text-[11px] font-mono text-[#888] leading-relaxed max-w-3xl">
          The Commitments of Traders (COT) report is published weekly by the U.S.
          Commodity Futures Trading Commission (CFTC). It disaggregates the open interest
          of futures markets into trader categories, providing a detailed view of how large
          institutional players are positioned. For Bitcoin and Ether futures, this is one
          of the most reliable signals of institutional sentiment available.
        </p>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Report Frequency',    value: 'Weekly',   sub: 'Released every Friday' },
            { label: 'Data Lag',            value: '3 Days',   sub: 'Tuesday close → Friday release' },
            { label: 'Source',              value: 'CFTC',     sub: 'cftc.gov/dea/options' },
            { label: 'Contracts Covered',   value: 'BTC / ETH',sub: 'CME + Micro CME' },
          ].map((s) => (
            <div key={s.label} className="border border-[#1a1a1a] p-4">
              <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-lg font-black text-[#FABF2C]">{s.value}</p>
              <p className="text-[10px] font-mono text-[#555] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trader Category Breakdown */}
      <div>
        <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Trader Category Breakdown
          <span className="text-[10px] text-[#555] font-mono normal-case tracking-normal ml-2">
            (data pending CFTC pipeline)
          </span>
        </h2>

        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['Category', 'Description', 'Long OI', 'Short OI', 'Net Position'].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest whitespace-nowrap ${
                      h === 'Category' || h === 'Description' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRADER_CATEGORIES.map((cat, i) => (
                <tr
                  key={cat.name}
                  className={`border-b border-[#111] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}
                >
                  <td className="px-4 py-4 font-bold text-white whitespace-nowrap">{cat.name}</td>
                  <td className="px-4 py-4 text-[#555] font-mono max-w-xs">{cat.description}</td>
                  <td className="px-4 py-4 text-right font-mono text-[#00d672]">{cat.long}</td>
                  <td className="px-4 py-4 text-right font-mono text-[#ff4757]">{cat.short}</td>
                  <td className="px-4 py-4 text-right font-mono text-[#555]">{cat.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to read COTs */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-6 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-white">How to Read This Data</h3>
        <ul className="space-y-2 text-[10px] font-mono text-[#888] leading-relaxed list-none">
          {[
            '→ Managed Money Long / Short Ratio: A high long ratio (> 3×) suggests speculative optimism. Historically reversal-prone at extremes.',
            '→ Net Position = Long OI − Short OI. A positive net for Managed Money = net long (bullish bias). Negative = net short.',
            '→ Swap Dealers are typically delta-neutral, but their net position can signal hedging flow direction.',
            '→ Large Holder Concentration: CFTC separately reports the number of traders with OI above a reporting threshold.',
          ].map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
