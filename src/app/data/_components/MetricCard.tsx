import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  trend?: number;
}

export function MetricCard({ label, value, trend }: MetricCardProps) {
  return (
    <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-5 flex flex-col justify-between hover:shadow-xl hover:shadow-black/10 transition-shadow duration-200">
      <span className="text-sm text-[#a3a3a3] uppercase tracking-wider font-mono">
        {label}
      </span>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-[28px] leading-tight font-semibold text-[#f8fafc] font-mono tabular-nums">
          {value}
        </span>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold ${
              trend >= 0
                ? 'bg-[#22c55e]/15 text-[#22c55e]'
                : 'bg-[#ef4444]/15 text-[#ef4444]'
            }`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}