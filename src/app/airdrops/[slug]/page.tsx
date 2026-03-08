export const dynamic = 'force-dynamic';

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Droplets, Cpu, ArrowRight } from 'lucide-react';
import AffiliateLink from '@/components/monetization/AffiliateLink';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${name} Airdrop Guide & Playbook | CryptoBrainNews`,
    description: `Complete step-by-step guide and automated agent playbook for the ${name} airdrop.`,
  };
}

export default async function AirdropDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);

  // Standard JSON-LD Schema for human SEO (Google rich snippets)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to farm the ${name} Airdrop`,
    "step":[
      { "@type": "HowToStep", "text": "Bridge assets to the target network." },
      { "@type": "HowToStep", "text": "Execute volume swaps to generate organic activity." },
      { "@type": "HowToStep", "text": "Provide liquidity to isolated pools." }
    ]
  };

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="max-w-[1000px] mx-auto space-y-10">
        
        {/* Header */}
        <div className="border-b border-[#1a1a1a] pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#FABF2C] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded">
              Active Campaign
            </span>
            <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest">
              Probability: High
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            {name} <span className="text-[#FABF2C]">Airdrop</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl leading-relaxed">
            A complete human and agentic guide to interacting with {name} to maximize potential protocol distributions.
          </p>
        </div>

        {/* Security / Affiliate Block */}
        <div className="bg-[#0a0a0a] border border-[#ff4757]/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 rounded">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[#111] flex items-center justify-center rounded-full shrink-0">
               <ShieldCheck size={24} className="text-[#ff4757]" />
             </div>
             <div>
               <h4 className="text-base font-black text-white uppercase tracking-tight">Security Warning</h4>
               <p className="text-xs text-[#888] mt-1">Never farm airdrops using your main cold storage. Isolate contract risk.</p>
             </div>
          </div>
          <a href="https://shop.ledger.com/?r=YOUR_AFFILIATE_ID" target="_blank" rel="noopener noreferrer sponsored" className="bg-[#1a1a1a] border border-[#ff4757]/50 text-[#ff4757] hover:bg-[#ff4757] hover:text-white px-8 py-4 text-xs font-black uppercase tracking-widest transition-colors rounded whitespace-nowrap">
            Buy a Ledger Nano
          </a>
        </div>

        {/* Human Steps */}
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Manual Strategy</h2>
          <div className="space-y-4">
            {[
              { title: "Fund Your Wallet", desc: "Withdraw ETH from a centralized exchange to a fresh wallet to avoid Sybil clustering." },
              { title: "Bridge Assets", desc: "Use official bridges to move liquidity onto the required network." },
              { title: "Generate Volume", desc: "Perform 5-10 organic swaps over a period of 4 weeks." }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-6 bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded group hover:border-[#FABF2C]/50 transition-colors">
                <div className="text-4xl font-black text-[#222] group-hover:text-[#FABF2C] transition-colors">0{idx + 1}</div>
                <div>
                  <h3 className="text-lg font-bold uppercase mb-2">{step.title}</h3>
                  <p className="text-[#888] text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agentic Execution Block */}
        <div className="mt-16 pt-10 border-t border-[#1a1a1a]">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
            <Cpu className="text-[#00d672]" /> Agentic Execution
          </h2>
          <div className="bg-[#050505] border border-[#00d672]/30 p-8 rounded relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d672]/5 blur-[60px]" />
            <p className="text-[#ccc] text-sm mb-6 relative z-10 leading-relaxed">
              Automate this strategy using your local OpenClaw or AutoGPT instance. Our Oracle API provides the exact YAML configuration and Sybil-evasion delays required to farm {name} undetected.
            </p>
            <div className="bg-black border border-[#222] p-4 rounded font-mono text-xs text-[#00d672] mb-6 overflow-x-auto relative z-10">
              $ curl -H "Accept: application/json" -H "Authorization: Bearer YOUR_KEY" \<br/>
              &nbsp;&nbsp;https://cryptobrainnews.vercel.app/airdrops/{slug}
            </div>
            <div className="flex gap-4 relative z-10">
              <Link href="/alpha-guides" className="bg-[#00d672] text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors rounded">
                Get Oracle API Key
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
