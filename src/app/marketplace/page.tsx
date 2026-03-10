import React from 'react';
import type { Metadata } from 'next';
import { getSanityPlaybooks } from '@/lib/sanity';
import MarketplaceClient from './_components/MarketplaceClient';

export const metadata: Metadata = {
  title: 'Agent Playbook Marketplace | CryptoBrainNews',
  description: 'Discover and purchase community-built AI agent routing playbooks and Sybil-defense configurations.',
};

export const revalidate = 60;

export default async function MarketplacePage() {
  const playbooks = await getSanityPlaybooks().catch(() =>[]);

  return (
    <main className="min-h-screen bg-[#050505] py-16 px-4 lg:px-8 font-sans text-white">
      <div className="max-w-[1200px] mx-auto">
        
        <div className="text-center mb-16 border-b border-[#1a1a1a] pb-10">
          <span className="bg-[#FABF2C] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 inline-block">
            Creator Economy
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-tight">
            Playbook <span className="text-[#FABF2C]">Marketplace</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto leading-relaxed">
            Purchase battle-tested agent configurations from top operators. Revenue is split automatically with creators via Stripe Connect.
          </p>
        </div>

        <MarketplaceClient playbooks={playbooks} />

      </div>
    </main>
  );
}
