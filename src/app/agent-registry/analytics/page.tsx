import React from 'react';
import type { Metadata } from 'next';
import AnalyticsClient from './_components/AnalyticsClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Agent Analytics | CryptoBrainNews',
  description: 'Track your L402 execution usage, compute time, and Lightning Network spending.',
};

export default function AgentAnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans text-white">
      <div className="max-w-[1200px] mx-auto">
        
        <Link href="/agent-registry" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} /> Back to KYA Registry
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-[#1a1a1a] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[#00d672] font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00d672] rounded-full animate-pulse" /> Live Telemetry
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Agent <span className="text-[#00d672]">Analytics</span>
            </h1>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-mono text-[#888] uppercase tracking-widest mb-1">Active Identity</p>
            <p className="text-xs font-mono text-[#00d672] bg-[#00d672]/10 border border-[#00d672]/30 px-3 py-1 rounded">
              0x71C...49A2 (OpenClaw-Alpha-01)
            </p>
          </div>
        </div>

        <AnalyticsClient />

      </div>
    </main>
  );
}
