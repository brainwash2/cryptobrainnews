import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface FuturesMarket {
  id: string;
  symbol: string;
  exchange: string;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  openInterest: number;
  volume24h: number;
  change24h: number;
}

interface FuturesMarketsTableProps {
  markets: FuturesMarket[];
  onRowClick: (market: FuturesMarket) => void;
}

export default function FuturesMarketsTable({ markets, onRowClick }: FuturesMarketsTableProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(2)}B`;
    }
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    }
    return `$${(volume / 1000).toFixed(2)}K`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase tracking-wide">Symbol</th>
            <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase tracking-wide">Exchange</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase tracking-wide">Mark Price</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase tracking-wide">Index Price</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase tracking-wide">Funding Rate</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase tracking-wide">Open Interest</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase tracking-wide">24h Volume</th>
            <th className="text-right py-4 px-4 text-xs font-bold text-muted-foreground font-caption uppercase tracking-wide">24h Change</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market, index) => {
            const isPositive = market.change24h >= 0;
            const isFundingPositive = market.fundingRate >= 0;
            const isEven = index % 2 === 0;

            return (
              <tr
                key={market.id}
                onClick={() => onRowClick(market)}
                className={`border-b border-border cursor-pointer transition-smooth hover:bg-muted ${
                  isEven ? 'bg-card' : 'bg-background'
                }`}
              >
                <td className="py-4 px-4"><span className="text-sm font-bold text-foreground font-data">{market.symbol}</span></td>
                <td className="py-4 px-4"><span className="text-sm text-muted-foreground font-caption">{market.exchange}</span></td>
                <td className="py-4 px-4 text-right"><span className="text-sm font-bold text-foreground font-data">${formatPrice(market.markPrice)}</span></td>
                <td className="py-4 px-4 text-right"><span className="text-sm font-medium text-muted-foreground font-data">${formatPrice(market.indexPrice)}</span></td>
                <td className="py-4 px-4 text-right"><span className={`text-sm font-bold font-data ${isFundingPositive ? 'text-success' : 'text-error'}`}>{isFundingPositive ? '+' : ''}{(market.fundingRate * 100).toFixed(4)}%</span></td>
                <td className="py-4 px-4 text-right"><span className="text-sm font-medium text-foreground font-data">{formatVolume(market.openInterest)}</span></td>
                <td className="py-4 px-4 text-right"><span className="text-sm font-medium text-foreground font-data">{formatVolume(market.volume24h)}</span></td>
                <td className="py-4 px-4 text-right">
                  <span className={`flex items-center justify-end gap-1 text-sm font-bold font-data ${isPositive ? 'text-success' : 'text-error'}`}>
                    <Icon name={isPositive ? 'ArrowUpIcon' : 'ArrowDownIcon'} size={12} />
                    {isPositive ? '+' : ''}{market.change24h.toFixed(2)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
