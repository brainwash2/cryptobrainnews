import React from 'react';

interface Props {
  ttlSeconds:  number;
  label?:      string;
}

function formatTtl(seconds: number): string {
  if (seconds < 60)   return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

export function FreshnessBadge({ ttlSeconds, label }: Props) {
  const display = label ?? `Refreshes every ${formatTtl(ttlSeconds)}`;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FABF2C]/30 bg-[#FABF2C]/5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#FABF2C]">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FABF2C] animate-pulse" />
      {display}
    </span>
  );
}

export default FreshnessBadge;
