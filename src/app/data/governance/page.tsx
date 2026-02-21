import React from 'react';
import GovernanceClient from './_components/GovernanceClient';

export const metadata = {
  title: 'Governance | CryptoBrainNews',
  description: 'DAO governance votes, proposals, and voting metrics.',
};

export const revalidate = 300;

export default function GovernancePage() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Governance</h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          DAO Votes, Proposals & Governance Tokens
        </p>
        <GovernanceClient />
      </div>
    </main>
  );
}
