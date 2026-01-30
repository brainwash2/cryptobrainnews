import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface MarketSummaryCardProps {
  title: string;
  value: string;
  change: number;
  changePercent: number;
  icon: string;
}

export default function MarketSummaryCard({ title, value, change, changePercent, icon }: MarketSummaryCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center">
            <Icon name={icon as any} size={20} className="text-primary-foreground" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground font-caption uppercase tracking-wide">{title}</h3>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-foreground font-data">{value}</p>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-xs font-medium font-data ${isPositive ? 'text-success' : 'text-error'}`}>
            <Icon name={isPositive ? 'ArrowUpIcon' : 'ArrowDownIcon'} size={12} />
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
