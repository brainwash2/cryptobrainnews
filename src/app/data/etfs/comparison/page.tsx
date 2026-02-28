import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import Link from 'next/link';

export default function EtfComparisonPage() {
  return (
    <div className="space-y-8 pb-20">
      <DataHeader title="ETF Comparison" description="Cross-asset ETF flow analytics." />
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-12 text-center">
        <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-6">
          Institutional flow data comparison is currently being aggregated.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/data/etfs/bitcoin" className="border border-[#FABF2C] text-[#FABF2C] px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#FABF2C] hover:text-black transition-colors">
            View BTC ETFs
          </Link>
          <Link href="/data/etfs/ethereum" className="border border-[#3b82f6] text-[#3b82f6] px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#3b82f6] hover:text-white transition-colors">
            View ETH ETFs
          </Link>
        </div>
      </div>
    </div>
  );
}
