'use client';
import React, { useState } from 'react';

const MOCK_ETFS = [
  { ticker: 'IBIT', issuer: 'iShares', asset: 'BTC', aum: 15200000000, flow_24h: 124000000 },
  { ticker: 'FBTC', issuer: 'Fidelity', asset: 'BTC', aum: 10800000000, flow_24h: 89000000 },
  { ticker: 'ETHA', issuer: 'Grayscale', asset: 'ETH', aum: 8400000000, flow_24h: 45000000 },
  { ticker: 'ETHH', issuer: 'iShares', asset: 'ETH', aum: 6200000000, flow_24h: 32000000 },
];

export default function ETFsClient({ etfData }: { etfData: any }) {
  const [asset, setAsset] = useState('all');

  const filtered = asset === 'all' ? MOCK_ETFS : MOCK_ETFS.filter((e) => e.asset === asset);

  const totalAUM = filtered.reduce((sum, e) => sum + e.aum, 0);
  const totalFlow = filtered.reduce((sum, e) => sum + e.flow_24h, 0);

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-wrap">
        {['all', 'BTC', 'ETH'].map((a) => (
          <button
            key={a}
            onClick={() => setAsset(a)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
              asset === a
                ? 'bg-[#FABF2C] text-black border-[#FABF2C]'
                : 'bg-transparent text-[#555] border-[#1a1a1a]'
            }`}
          >
            {a === 'all' ? 'All ETFs' : a}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-2xl font-black text-[#FABF2C]">${(totalAUM / 1e9).toFixed(1)}B</div>
          <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">Total AUM</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="text-2xl font-black text-[#FABF2C]">${(totalFlow / 1e6).toFixed(0)}M</div>
          <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">24h Net Flows</div>
        </div>
      </div>

      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase">Ticker</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase">Issuer</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">AUM</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">24h Flow</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((etf) => (
              <tr key={etf.ticker} className="border-b border-[#0a0a0a] hover:bg-[#0a0a0a]">
                <td className="px-4 py-4 text-white font-bold">{etf.ticker}</td>
                <td className="px-4 py-4 text-[#aaa]">{etf.issuer}</td>
                <td className="px-4 py-4 text-right text-[#FABF2C]">${(etf.aum / 1e9).toFixed(1)}B</td>
                <td className="px-4 py-4 text-right text-[#FABF2C]">${(etf.flow_24h / 1e6).toFixed(0)}M</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
