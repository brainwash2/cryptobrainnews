import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export const metadata = { title: 'Futures Markets | CryptoBrainNews' };

export default function FuturesPage() {
  return (
    <div className="space-y-8 pb-20">
      <DataHeader 
        title="Futures & Derivatives" 
        description="Perpetual swap funding rates, open interest, and liquidations." 
      />
      
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="w-16 h-16 bg-[#111] border border-[#333] rounded flex items-center justify-center mb-6">
          <Lock className="text-[#FABF2C] w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Premium Institutional Feed</h2>
        <p className="text-[#888] font-mono text-xs max-w-md mx-auto mb-8 leading-relaxed">
          Access to real-time futures order book depth, CME COT reports, and liquidation heatmaps requires a CryptoBrain Alpha subscription.
        </p>
        <Link href="/go-alpha" className="bg-[#FABF2C] text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">
          Unlock Alpha Access
        </Link>
      </div>
    </div>
  );
}
