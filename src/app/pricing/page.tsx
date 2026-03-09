export const dynamic = 'force-dynamic';

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Zap, User, Cpu, Database } from 'lucide-react';
import GitcoinPassport from '@/components/auth/GitcoinPassport';

export const metadata: Metadata = {
  title: 'Pricing & Protocols | CryptoBrainNews',
  description: 'Choose your access tier. Subscriptions for human analysts and pay-per-compute API access for autonomous AI agents.',
};

export default function PricingPage() {
  const STRIPE_CHECKOUT_URL = 'https://stripe.com';

  return (
    <main className="min-h-screen bg-[#050505] py-16 px-4 lg:px-8 font-sans text-white">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="bg-[#FABF2C] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 inline-block">
            Access Protocols
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-tight">
            Choose Your <br /> <span className="text-[#FABF2C]">Execution Layer</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto leading-relaxed">
            Data feeds designed for dual consumption. Human-readable analytics via the Terminal, or machine-readable JSON via the Oracle API.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          {/* Tier 1: Free */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 flex flex-col hover:border-[#333] transition-colors">
            <div className="mb-8">
              <div className="w-10 h-10 bg-[#111] border border-[#222] rounded flex items-center justify-center mb-4">
                <User className="text-[#888]" size={20} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">Reader</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black">$0</span>
                <span className="text-[#555] font-mono text-xs uppercase">/ Forever</span>
              </div>
              <p className="text-xs text-[#666] leading-relaxed">Basic market access and delayed news aggregation.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {['Live Price Terminal', 'Public News Feed', 'Basic On-Chain Metrics', 'Standard Affiliate Links'].map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-[#ccc]">
                  <Check size={16} className="text-[#888] shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            
            <Link href="/" className="block w-full text-center bg-[#111] border border-[#333] text-white hover:bg-white hover:text-black py-4 text-xs font-black uppercase tracking-widest transition-colors">
              Enter Terminal
            </Link>
          </div>

          {/* Tier 2: Human Pro */}
          <div className="bg-[#050505] border-2 border-[#FABF2C] p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_50px_rgba(250,191,44,0.05)]">
            <div className="absolute top-0 right-0 bg-[#FABF2C] text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest">
              Most Popular
            </div>
            <div className="mb-8">
              <div className="w-10 h-10 bg-[#FABF2C]/10 border border-[#FABF2C]/30 rounded flex items-center justify-center mb-4">
                <Zap className="text-[#FABF2C]" size={20} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">Human Pro</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black">$29</span>
                <span className="text-[#555] font-mono text-xs uppercase">/ Month</span>
              </div>
              <p className="text-xs text-[#888] leading-relaxed">Full alpha access, private discord, and manual agent playbooks.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {['Everything in Reader', 'Real-time Alpha Guides', 'Agent Playbooks (YAML)', 'Sybil-Evasion Metrics', 'Private Discord Access'].map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-white">
                  <Check size={16} className="text-[#FABF2C] shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            
            <a href={STRIPE_CHECKOUT_URL} className="block w-full text-center bg-[#FABF2C] text-black hover:bg-white py-4 text-xs font-black uppercase tracking-widest transition-colors">
              Subscribe via Fiat
            </a>
          </div>

          {/* Tier 3: Agent Pro */}
          <div className="bg-[#0a0a0a] border border-[#00d672]/30 p-8 flex flex-col relative overflow-hidden group hover:border-[#00d672]/60 transition-colors">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#00d672]/5 blur-[50px] group-hover:bg-[#00d672]/10 transition-colors" />
            <div className="mb-8 relative z-10">
              <div className="w-10 h-10 bg-[#111] border border-[#00d672]/30 rounded flex items-center justify-center mb-4">
                <Cpu className="text-[#00d672]" size={20} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">Agent API</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-[#00d672]">x402</span>
              </div>
              <p className="text-xs text-[#888] leading-relaxed">Pay-per-compute via Lightning/L2 micro-transactions. Built for autonomous consumption.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 relative z-10">
              {['Raw JSON Oracle Feeds', 'Arbitrage Signal Firehose', 'ERC-8004 KYA Registration', 'HTTP 402 Payment Headers'].map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-[#ccc]">
                  <Database size={16} className="text-[#00d672] shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            
            <Link href="/agent-registry" className="block w-full text-center bg-[#111] border border-[#00d672]/50 text-[#00d672] hover:bg-[#00d672] hover:text-black py-4 text-xs font-black uppercase tracking-widest transition-colors relative z-10">
              Register Agent (KYA)
            </Link>
          </div>

        </div>

        {/* Proof of Humanity / Gitcoin Passport Section */}
        <div className="bg-[#080808] border border-[#1a1a1a] p-8 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">Proof of Humanity Bypass</h2>
            <p className="text-xs text-[#888] leading-relaxed">
              Are you a high-reputation network participant? Verify your on-chain identity via Gitcoin Passport. 
              A score of 20+ unlocks the <span className="text-[#FABF2C] font-bold">Human Pro</span> tier instantly, for free.
            </p>
          </div>
          <GitcoinPassport />
        </div>

      </div>
    </main>
  );
}
