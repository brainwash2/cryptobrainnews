import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  trend?: number;
}

export function MetricCard({ label, value, trend }: MetricCardProps) {
  return (
    <div className="bg-card border border-border p-4 flex flex-col justify-between h-full hover:border-primary/50 transition-colors">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-caption">
        {label}
      </span>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-2xl font-black text-foreground font-data tabular-nums">
          {value}
        </span>
        {trend !== undefined && (
          <span className={`text-xs font-bold font-mono ${trend >= 0 ? 'text-success' : 'text-error'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}
