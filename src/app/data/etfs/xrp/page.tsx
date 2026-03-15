import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import { Clock }      from 'lucide-react';

export const metadata = { title: 'XRP ETFs | CryptoBrainNews' };

const PENDING_FILINGS = [
  { applicant: 'Canary Capital',  type: 'Spot XRP ETF',  status: 'Filed',   filed: 'Oct 2024' },
  { applicant: 'WisdomTree',      type: 'Spot XRP ETF',  status: 'Filed',   filed: 'Nov 2024' },
  { applicant: '21Shares',        type: 'Spot XRP ETF',  status: 'Filed',   filed: 'Nov 2024' },
  { applicant: 'Bitwise',         type: 'Spot XRP ETF',  status: 'Filed',   filed: 'Nov 2024' },
  { applicant: 'Grayscale',       type: 'XRP Trust',     status: 'Filed',   filed: 'Oct 2024' },
];

export default function XrpEtfsPage() {
  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="XRP ETFs"
        description="Tracking US SEC filings and approvals for spot XRP ETF products."
      />

      <div className="border border-[#FABF2C]/20 bg-[#FABF2C]/[0.02] p-5 flex gap-4 items-start">
        <Clock className="text-[#FABF2C] shrink-0 mt-0.5" size={18} />
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          <span className="text-[#FABF2C] font-black">Status:</span> Multiple issuers have filed for spot
          XRP ETFs with the SEC following the resolution of the SEC vs Ripple case.
          Live data will appear once products receive approval and begin trading.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#346aa9] rounded-full" />
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
                    <span className="font-mono text-[10px] px-2 py-0.5 border text-[#FABF2C] border-[#FABF2C]/30 bg-[#FABF2C]/10">
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
