import React from 'react';
import Link from 'next/link';
import { Clock, ExternalLink } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  dataSource?: string;
  targetPhase?: string;
}

/**
 * Phase 37: Unified "Coming Soon" placeholder.
 * Replaces all inline Lock / paywall components across /data pages.
 * No premium gating – data will be freely accessible once implemented.
 */
export function ComingSoon({
  title,
  description,
  dataSource,
  targetPhase,
}: ComingSoonProps) {
  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="border-b border-[#1a1a1a] pb-6">
        <p className="text-[10px] font-black text-[#FABF2C] uppercase tracking-[0.4em] mb-2">
          Data Terminal
        </p>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
          {title}
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
          {description}
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 bg-[#111] border border-[#1a1a1a] flex items-center justify-center mb-6">
          <Clock className="text-[#FABF2C] w-7 h-7" />
        </div>

        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-3">
          Coming Soon
        </h2>
        <p className="text-[#555] font-mono text-xs max-w-sm mx-auto leading-relaxed mb-6">
          This section is under active development. Real-time institutional data
          will be available at no cost once integrated.
        </p>

        {/* Meta badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {dataSource && (
            <span className="border border-[#1a1a1a] text-[#888] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
              Source: {dataSource}
            </span>
          )}
          {targetPhase && (
            <span className="border border-[#FABF2C]/30 text-[#FABF2C] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
              {targetPhase}
            </span>
          )}
        </div>

        <Link
          href="/data/markets/spot"
          className="flex items-center gap-2 text-[10px] font-black text-[#888] uppercase tracking-widest hover:text-white transition-colors"
        >
          <ExternalLink size={12} />
          View Live Data
        </Link>
      </div>
    </div>
  );
}

export default ComingSoon;
