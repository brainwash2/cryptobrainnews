export const dynamic = 'force-dynamic';

import React from 'react';
import { Lock, Zap, Terminal, ShieldAlert, Cpu, Network } from 'lucide-react';
import type { Metadata } from 'next';
import { getSanityPlaybooks } from '@/lib/sanity';

export const metadata: Metadata = {
  title: 'Agentic Alpha Tier | CryptoBrainNews',
  description: 'Premium AI agent playbooks, OpenClaw configurations, and sybil defense parameters.',
};

export default async function AlphaGuidesPage(props: { searchParams: Promise<{ unlocked?: string }> }) {
  const searchParams = await props.searchParams;
  const isUnlocked = searchParams?.unlocked === 'true';

  // Fetch playbooks from Sanity CMS
  const playbooks = await getSanityPlaybooks().catch(() =>[]);

  // Replace with your actual Stripe Payment Link
  const STRIPE_CHECKOUT_URL = 'https://stripe.com'; 

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans text-white">
      <div className="max-w-[1000px] mx-auto relative">
        
        <div className="mb-16 text-center">
          <span className="bg-[#FABF2C] text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 inline-block">The Agentic Tier</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-tight">
            Stop Clicking. <br /> Start Deploying.
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto leading-relaxed">
            The era of manual airdrop farming is over. We provide the exact OpenClaw configurations, dynamic agent playbooks, and Sybil-evasion parameters needed to automate your on-chain yield at scale.
          </p>
        </div>

        <div className={`relative ${!isUnlocked ? 'h-[750px] overflow-hidden select-none pointer-events-none' : ''}`}>
          
          <div className="space-y-8">
            
            {playbooks.length === 0 && (
              <div className="text-center text-[#555] py-12 border border-dashed border-[#1a1a1a] font-mono text-xs uppercase tracking-widest">
                Scanning network for active playbooks...
              </div>
            )}

            {playbooks.map((pb: any, index: number) => {
              // Progressively blur items if locked
              const blurAmt = index * 2 + 6;
              const opacityAmt = Math.max(10, 40 - index * 10);
              const lockedStyles = !isUnlocked ? `blur-[${blurAmt}px] opacity-${opacityAmt}` : '';

              return (
                <div key={pb._id} className={`space-y-8 ${lockedStyles}`}>
                  {/* Agent Playbook YAML Block */}
                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-lg flex flex-col md:flex-row gap-8 items-start">
                     <div className="w-12 h-12 bg-[#111] rounded-full flex items-center justify-center shrink-0">
                       <Cpu className="text-[#00d672]" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-xl font-black uppercase text-white">{pb.title || pb.protocol} Playbook</h2>
                          <span className="text-[10px] text-[#00d672] border border-[#00d672]/30 px-2 py-1 rounded bg-[#00d672]/10 whitespace-nowrap">
                            {pb.tier || 'Agent Pro'}
                          </span>
                        </div>
                        <p className="text-[#888] leading-relaxed mb-6">
                          Download the pre-configured YAML routing files for <strong>{pb.protocol}</strong>. Plug them directly into your local agent orchestrator to autonomously bridge, swap, and provide liquidity.
                        </p>
                        <div className="bg-black border border-[#222] p-4 font-mono text-xs text-[#00d672] rounded overflow-x-auto whitespace-pre-wrap">
                           {pb.yamlConfig || '# No YAML configuration provided'}
                        </div>
                     </div>
                  </div>

                  {/* Sybil Parameters Block */}
                  {pb.sybilParams && (
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-lg flex flex-col md:flex-row gap-8 items-start">
                       <div className="w-12 h-12 bg-[#111] rounded-full flex items-center justify-center shrink-0">
                         <ShieldAlert className="text-[#ff4757]" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-black uppercase text-white mb-2">{pb.protocol} Anti-Sybil Tuning</h2>
                          <p className="text-[#888] leading-relaxed mb-6">
                            Heuristics and randomization variables designed to avoid clustering detection on {pb.protocol}. Update these parameters locally before execution.
                          </p>
                          <div className="bg-black border border-[#222] p-4 font-mono text-xs text-[#ff4757] rounded overflow-x-auto whitespace-pre-wrap">
                            {pb.sybilParams}
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Static Infrastructure Block */}
            <div className={`bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-lg flex flex-col md:flex-row gap-8 items-start ${!isUnlocked ? 'blur-[10px] opacity-20' : ''}`}>
               <div className="w-12 h-12 bg-[#111] rounded-full flex items-center justify-center shrink-0">
                 <Network className="text-[#3b82f6]" />
               </div>
               <div>
                  <h2 className="text-xl font-black uppercase text-white mb-2">Private Orchestration Hub</h2>
                  <p className="text-[#888] leading-relaxed">Direct access to our private Discord. Share custom agent prompts, access high-speed private RPC endpoints to prevent front-running, and coordinate gas-optimized execution strategies with other operators.</p>
               </div>
            </div>
          </div>

          {/* The Paywall Overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-40">
              <div className="bg-[#0a0a0a] border border-[#FABF2C]/50 p-8 rounded-xl max-w-md text-center shadow-[0_0_50px_rgba(250,191,44,0.15)]">
                <Lock size={32} className="text-[#FABF2C] mx-auto mb-6" />
                <h3 className="text-2xl font-black uppercase mb-2">Join The Vanguard</h3>
                <p className="text-[#888] text-sm mb-8 leading-relaxed">
                  Information is free. Autonomous execution is scarce. Equip your AI agents with the configurations required to win.
                </p>
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3 text-sm text-[#ccc]"><Cpu size={16} className="text-[#FABF2C]"/> Plug-and-play Agent YAML configs</div>
                  <div className="flex items-center gap-3 text-sm text-[#ccc]"><ShieldAlert size={16} className="text-[#FABF2C]"/> Sybil-clustering Defense Metrics</div>
                  <div className="flex items-center gap-3 text-sm text-[#ccc]"><Terminal size={16} className="text-[#FABF2C]"/> Private Orchestration Discord</div>
                </div>
                <a 
                  href={STRIPE_CHECKOUT_URL}
                  className="block w-full bg-[#FABF2C] text-black py-4 text-xs font-black uppercase tracking-widest rounded hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={14} /> Subscribe Now - $29/mo
                </a>
                <p className="text-[10px] text-[#555] font-mono mt-4 uppercase">Secure checkout via Stripe</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
