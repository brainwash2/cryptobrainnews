'use client';
import React from 'react';

const MOCK_DAOS = [
  { dao: 'Aave', proposal_count: 487, active_votes: 12, avg_turnout: 28.5, gov_token: 'AAVE' },
  { dao: 'Uniswap', proposal_count: 78, active_votes: 5, avg_turnout: 21.3, gov_token: 'UNI' },
  { dao: 'Compound', proposal_count: 156, active_votes: 8, avg_turnout: 18.7, gov_token: 'COMP' },
  { dao: 'Curve', proposal_count: 203, active_votes: 15, avg_turnout: 35.2, gov_token: 'CRV' },
];

export default function GovernanceClient() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total DAOs', value: MOCK_DAOS.length },
          { label: 'Active Proposals', value: MOCK_DAOS.reduce((sum, d) => sum + d.active_votes, 0) },
          { label: 'Avg Turnout', value: (MOCK_DAOS.reduce((sum, d) => sum + d.avg_turnout, 0) / MOCK_DAOS.length).toFixed(1) + '%' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <div className="text-2xl font-black text-[#FABF2C]">{stat.value}</div>
            <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase">DAO</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">Proposals</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">Active Votes</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase">Avg Turnout</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DAOS.map((dao) => (
              <tr key={dao.dao} className="border-b border-[#0a0a0a] hover:bg-[#0a0a0a]">
                <td className="px-4 py-4 text-white font-bold">{dao.dao}</td>
                <td className="px-4 py-4 text-right text-[#aaa]">{dao.proposal_count}</td>
                <td className="px-4 py-4 text-right text-[#FABF2C]">{dao.active_votes}</td>
                <td className="px-4 py-4 text-right text-[#888]">{dao.avg_turnout}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
