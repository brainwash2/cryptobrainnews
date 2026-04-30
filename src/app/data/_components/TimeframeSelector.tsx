'use client';

import React from 'react';

export type Timeframe = '1D' | '7D' | '30D' | '90D' | '1Y' | 'YTD' | 'ALL';
export const ALL_TIMEFRAMES: Timeframe[] = ['1D', '7D', '30D', '90D', '1Y', 'YTD', 'ALL'];

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
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
    <div className={`inline-flex items-center gap-1 ${className}`} role="group" aria-label="Timeframe selector">
      {ALL_TIMEFRAMES.map((tf) => {
        const enabled = available.includes(tf);
        const active = value === tf;
        if (!enabled) return null;
        return (
          <button
            key={tf}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tf)}
            className={[
              'rounded-2xl px-4 py-1.5 text-sm font-medium transition-colors duration-200',
              active
                ? 'bg-[#27272a] text-white'
                : 'text-[#a3a3a3] hover:text-[#f8fafc]',
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
