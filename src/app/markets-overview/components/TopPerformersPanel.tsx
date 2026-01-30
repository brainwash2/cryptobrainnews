import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface TopPerformer {
  symbol: string;
  name: string;
  change24h: number;
  volume24h: number;
  price: number;
}

export default function TopPerformersPanel({ performers }: { performers: TopPerformer[] }) {
  const formatPrice = (price: number) => price < 1 ? `$${price.toFixed(4)}` : `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground font-heading">Top Performers</h3>
        <div className="w-8 h-8 bg-primary flex items-center justify-center">
          <Icon name="FireIcon" size={16} className="text-primary-foreground" />
        </div>
      </div>
      <div className="space-y-4">
        {performers.map((performer, index) => {
          const isPositive = performer.change24h >= 0;
          return (
            <div key={performer.symbol} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground font-data">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground font-data">{performer.symbol}</p>
                  <p className="text-xs text-muted-foreground font-caption">{performer.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground font-data mb-1">{formatPrice(performer.price)}</p>
                <span className={`text-xs font-bold font-data ${isPositive ? 'text-success' : 'text-error'}`}>
                  {isPositive ? '+' : ''}{performer.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
