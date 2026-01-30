import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface SpotMarket {
  id: string;
  pair: string;
  exchange: string;
  price: number;
  volume24h: number;
  change24h: number;
  bid: number;
  ask: number;
  spread: number;
}

interface SpotMarketsTableProps {
  markets: SpotMarket[];
  onRowClick: (market: SpotMarket) => void;
}

export default function SpotMarketsTable({ markets, onRowClick }: SpotMarketsTableProps) {
  const formatPrice = (price: number) => price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatVolume = (val: number) => val >= 1e9 ? `$${(val/1e9).toFixed(2)}B` : `$${(val/1e6).toFixed(2)}M`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase">Pair</th>
            <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase">Exchange</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase">Price</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase">Vol 24h</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase">24h %</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market, index) => {
            const isPositive = market.change24h >= 0;
            return (
              <tr key={market.id} onClick={() => onRowClick(market)} className="border-b border-border cursor-pointer hover:bg-muted transition-smooth">
                <td className="py-4 px-4 font-bold font-data text-sm">{market.pair}</td>
                <td className="py-4 px-4 font-caption text-sm text-muted-foreground">{market.exchange}</td>
                <td className="py-4 px-4 text-right font-bold font-data text-sm">${formatPrice(market.price)}</td>
                <td className="py-4 px-4 text-right font-data text-sm text-muted-foreground">{formatVolume(market.volume24h)}</td>
                <td className={`py-4 px-4 text-right font-bold font-data text-sm ${isPositive ? 'text-success' : 'text-error'}`}>
                  {isPositive ? '+' : ''}{market.change24h}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
