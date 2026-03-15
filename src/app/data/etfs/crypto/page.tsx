import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import { Clock }      from 'lucide-react';

export const metadata = { title: 'Crypto Index ETFs | CryptoBrainNews' };

const OTHER_FILINGS = [
  { applicant: 'Canary Capital',  asset: 'DOGE',  type: 'Spot ETF',  status: 'Filed',   filed: 'Dec 2024' },
  { applicant: 'Canary Capital',  asset: 'LTC',   type: 'Spot ETF',  status: 'Filed',   filed: 'Dec 2024' },
  { applicant: 'Grayscale',       asset: 'LINK',  type: 'Trust',     status: 'Filed',   filed: 'Dec 2024' },
  { applicant: 'Grayscale',       asset: 'ADA',   type: 'Trust',     status: 'Filed',   filed: 'Dec 2024' },
  { applicant: 'Grayscale',       asset: 'AVAX',  type: 'Trust',     status: 'Filed',   filed: 'Jan 2025' },
  { applicant: 'Canary Capital',  asset: 'HBAR',  type: 'Spot ETF',  status: 'Filed',   filed: 'Jan 2025' },
];

export default function CryptoEtfsPage() {
  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Crypto Index ETFs – Other Assets"
        description="Tracking SEC filings for DOGE, LTC, LINK, ADA, AVAX, HBAR, and other crypto ETF products."
      />

      <div className="border border-[#FABF2C]/20 bg-[#FABF2C]/[0.02] p-5 flex gap-4 items-start">
        <Clock className="text-[#FABF2C] shrink-0 mt-0.5" size={18} />
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          <span className="text-[#FABF2C] font-black">Post-BTC/ETH wave:</span> Following the approval of
          Bitcoin and Ethereum spot ETFs in 2024, a second wave of altcoin ETF filings is under SEC review.
          Live trading data and AUM will be added as products launch.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#888] rounded-full" />
          Filed Applications
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {['Applicant', 'Asset', 'Type', 'Date Filed', 'Status'].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${h === 'Status' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OTHER_FILINGS.map((f, i) => (
                <tr key={`${f.applicant}-${f.asset}`} className={`border-b border-[#111] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                  <td className="px-4 py-3 font-bold text-white">{f.applicant}</td>
                  <td className="px-4 py-3"><span className="font-black text-[#FABF2C]">{f.asset}</span></td>
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
