'use client';

import React from 'react';

export type Timeframe = '1D' | '7D' | '30D' | 'YTD' | '1Y';
export const ALL_TIMEFRAMES: Timeframe[] = ['1D', '7D', '30D', 'YTD', '1Y'];

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
  /** Which timeframes are clickable. Others render disabled. */
  available?: Timeframe[];
  className?: string;
}

export function TimeframeSelector({
  value,
  onChange,
  available = ALL_TIMEFRAMES,
  className = '',
}: TimeframeSelectorProps) {
  return (
    <div className={`flex gap-1 ${className}`} role="group" aria-label="Timeframe selector">
      {ALL_TIMEFRAMES.map((tf) => {
        const enabled = available.includes(tf);
        const active  = value === tf;
        return (
          <button
            key={tf}
            type="button"
            aria-pressed={active}
            disabled={!enabled}
            onClick={() => { if (enabled) onChange(tf); }}
            className={[
              'px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all',
              active
                ? 'bg-[#FABF2C] text-black border-[#FABF2C]'
                : enabled
                  ? 'text-[#555] border-[#1a1a1a] bg-transparent hover:border-[#FABF2C]/60 hover:text-[#FABF2C]'
                  : 'text-[#2a2a2a] border-[#111] bg-transparent cursor-not-allowed opacity-40',
            ].join(' ')}
          >
            {tf}
          </button>
        );
      })}
    </div>
  );
}

export default TimeframeSelector;
