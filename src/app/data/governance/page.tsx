export const revalidate = 86400;

import React from 'react';
import { getDAOGovernance } from '@/lib/dune';
import GovernanceClient from './_components/GovernanceClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DAO Governance | CryptoBrainNews',
  description: 'Live DAO governance votes, proposals, and voting metrics from Tally and Snapshot.',
};

export default async function GovernancePage() {
  const { rows, source } = await getDAOGovernance();

  return (
    <main className="min-h-screen bg-[#050505] font-sans">
      <div className="py-10 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">

          <div className="mb-8 border-b border-[#1a1a1a] pb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#555] border border-[#1a1a1a] px-2 py-1">
                On-Chain
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#555] border border-[#1a1a1a] px-2 py-1">
                Tally · Snapshot
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
              DAO <span className="text-[#FABF2C]">Governance</span>
            </h1>
            <p className="text-[#888] font-mono text-xs uppercase tracking-widest">
              Proposal counts, vote totals, and participation trends across leading DeFi protocols.
            </p>
          </div>

          <GovernanceClient rows={rows} source={source} />

        </div>
      </div>
    </main>
  );
}
