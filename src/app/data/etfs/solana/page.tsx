import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import { Clock }      from 'lucide-react';

export const metadata = { title: 'Solana ETFs | CryptoBrainNews' };

const PENDING_FILINGS = [
  { applicant: 'VanEck',     type: 'Spot SOL ETF',    status: 'Filed',    filed: 'Mar 2024' },
  { applicant: '21Shares',   type: 'Spot SOL ETF',    status: 'Filed',    filed: 'Mar 2024' },
  { applicant: 'Grayscale',  type: 'Spot SOL Trust',  status: 'Filed',    filed: 'Nov 2023' },
  { applicant: 'Canary',     type: 'Spot SOL ETF',    status: 'Pending',  filed: 'Oct 2024' },
  { applicant: 'Bitwise',    type: 'Spot SOL ETF',    status: 'Pending',  filed: 'Nov 2024' },
];

export default function SolanaEtfsPage() {
  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Solana ETFs"
        description="Tracking US SEC filings and approvals for spot Solana ETF products."
      />

      <div className="border border-[#FABF2C]/20 bg-[#FABF2C]/[0.02] p-5 flex gap-4 items-start">
        <Clock className="text-[#FABF2C] shrink-0 mt-0.5" size={18} />
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          <span className="text-[#FABF2C] font-black">Status:</span> Multiple issuers have filed for spot
          Solana ETFs with the SEC. Approval decisions and live trading data will populate this page
          automatically once products launch.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#9945ff] rounded-full" />
          Pending & Filed Applications
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['Applicant', 'Product Type', 'Date Filed', 'Status'].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${h === 'Status' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PENDING_FILINGS.map((f, i) => (
                <tr key={f.applicant} className={`border-b border-[#111] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                  <td className="px-4 py-3 font-bold text-white">{f.applicant}</td>
                  <td className="px-4 py-3 text-[#888]">{f.type}</td>
                  <td className="px-4 py-3 font-mono text-[#555]">{f.filed}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono text-[10px] px-2 py-0.5 border ${
                      f.status === 'Filed'
                        ? 'text-[#FABF2C] border-[#FABF2C]/30 bg-[#FABF2C]/10'
                        : 'text-[#888] border-[#333] bg-[#111]'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          Source: SEC EDGAR public filings. Status updated manually as decisions are announced.
          Live AUM and flow data will be added using the same methodology as the Bitcoin and Ethereum ETF pages once products launch.
        </p>
      </div>
    </div>
  );
}
