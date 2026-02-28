import React from 'react';
import { DataHeader } from '../../_components/DataHeader';
import Link from 'next/link';

export default function L2ComparisonPage() {
  return (
    <div className="space-y-8 pb-20">
      <DataHeader title="L2 Comparison" description="Cross-chain performance analytics." />
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-12 text-center">
        <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-6">
          Please view individual sector pages for detailed metrics.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/data/scaling/optimistic" className="border border-[#3b82f6] text-[#3b82f6] px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#3b82f6] hover:text-white transition-colors">
            Optimistic Rollups
          </Link>
          <Link href="/data/scaling" className="border border-[#ef4444] text-[#ef4444] px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#ef4444] hover:text-white transition-colors">
            Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
