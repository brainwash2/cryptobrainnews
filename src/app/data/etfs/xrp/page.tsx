import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import Link from 'next/link';
import { Lock } from 'lucide-react';
export const metadata = { title: 'XRP ETFs | CryptoBrainNews' };
export default function CmePage() {
  return (
    <div className="space-y-8 pb-20">
      <DataHeader title="XRP ETFs" description="Commitments of Traders data for institutional futures positioning." />
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] flex flex-col items-center justify-center py-32 px-4 text-center">
        <Lock className="text-[#FABF2C] w-12 h-12 mb-6" />
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Premium Institutional Feed</h2>
        <p className="text-[#888] font-mono text-xs max-w-md mx-auto mb-8">Access to real-time CME positioning requires a CryptoBrain Alpha subscription.</p>
        <Link href="/go-alpha" className="bg-[#FABF2C] text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">Unlock Alpha</Link>
      </div>
    </div>
  );
}
