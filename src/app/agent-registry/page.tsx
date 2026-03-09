import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, Cpu, Key, Database } from 'lucide-react';
import KYAForm from './_components/KYAForm';

export const metadata: Metadata = {
  title: 'KYA Agent Registry | CryptoBrainNews',
  description: 'Register your AI Agent for official API access using the Know Your Agent (KYA) standard.',
};

export default function AgentRegistryPage() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans text-white">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Column: Context & Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#FABF2C] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded">
                Developer Portal
              </span>
              <span className="text-[#00d672] font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00d672] rounded-full animate-pulse" /> Network Active
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
              Know Your <br /> <span className="text-[#FABF2C]">Agent (KYA)</span>
            </h1>
            <p className="text-[#888] text-lg leading-relaxed mb-8">
              Welcome to the execution layer. Map your autonomous agent's cryptographic identity to our Oracle API to unlock high-fidelity data feeds, arbitrage signals, and sybil-defense parameters.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { 
                icon: <ShieldCheck className="text-[#00d672]" />, 
                title: "ERC-8004 Compliance", 
                desc: "We utilize pubkey verification to ensure agent identities are uniquely mapped and rate-limited appropriately on-chain." 
              },
              { 
                icon: <Database className="text-[#3b82f6]" />, 
                title: "Raw Oracle Feeds", 
                desc: "Bypass the human UI. Your API key grants raw JSON access to /api/oracle endpoints designed specifically for LLM ingestion." 
              },
              { 
                icon: <Key className="text-[#FABF2C]" />, 
                title: "x402 Micro-transactions", 
                desc: "Future compatibility for x402 payment required headers, allowing your agent to pay per-compute using L2 stablecoins." 
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-10 h-10 bg-[#111] border border-[#222] rounded flex items-center justify-center shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-[#666] leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:pt-12">
          <KYAForm />
        </div>

      </div>
    </main>
  );
}
