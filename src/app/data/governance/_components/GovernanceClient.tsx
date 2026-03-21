/**
 * @deprecated Phase 45 · C1 — DO NOT RENDER THIS COMPONENT.
 *
 * This file is preserved in the repository for reference only (append-only ledger policy).
 * It rendered a hardcoded MOCK_DAOS array as if it were live governance data — a
 * correctness violation flagged in audit-report.md § C1.
 *
 * Two compounding problems were found:
 *   1. Dune query 6705858 (UNISWAP_GOVERNANCE) returns stub SQL: CURRENT_DATE, 'uniswap', 'Governance data'.
 *   2. Dune query 6705938 (DAO_ACTIVITY) returns hardcoded zeros for Uniswap + Aave.
 *   3. This component never called either Dune function — it used its own fabricated array.
 *
 * Next steps to re-enable this page:
 *   a. Author real SQL for IDs 6705858 and 6705938 on dune.com
 *      (suggested: Tally proposal events + Snapshot off-chain votes).
 *   b. Rewrite this component to accept DuneRow[] props from page.tsx (server component).
 *   c. Update governance/page.tsx to call getUniswapGovernance() + getDAOActivity()
 *      and pass results as props — replacing the ComingSoon placeholder.
 *   d. Remove this @deprecated notice and the ComingSoon import in page.tsx.
 *
 * See: audit-report.md § C1, dune.ts getUniswapGovernance(), getDAOActivity().
 */

'use client';
import React from 'react';

/* ─── MOCK DATA — FABRICATED — DO NOT USE IN PRODUCTION ─────────────────── */
const MOCK_DAOS = [
  { dao: 'Aave',     proposal_count: 487, active_votes: 12, avg_turnout: 28.5, gov_token: 'AAVE' },
  { dao: 'Uniswap',  proposal_count:  78, active_votes:  5, avg_turnout: 21.3, gov_token: 'UNI'  },
  { dao: 'Compound', proposal_count: 156, active_votes:  8, avg_turnout: 18.7, gov_token: 'COMP' },
  { dao: 'Curve',    proposal_count: 203, active_votes: 15, avg_turnout: 35.2, gov_token: 'CRV'  },
];

/** @deprecated See file-level JSDoc. Never call this in a page route. */
export default function GovernanceClient() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total DAOs',       value: MOCK_DAOS.length },
          { label: 'Active Proposals', value: MOCK_DAOS.reduce((sum, d) => sum + d.active_votes, 0) },
          { label: 'Avg Turnout',      value: (MOCK_DAOS.reduce((sum, d) => sum + d.avg_turnout, 0) / MOCK_DAOS.length).toFixed(1) + '%' },
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
