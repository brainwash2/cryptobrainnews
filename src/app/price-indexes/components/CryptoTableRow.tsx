'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import MiniPriceChart from './MiniPriceChart';

export default function CryptoTableRow({ crypto, isStriped, onWatchlistToggle }: any) {
  const price = crypto.price || 0;
  const change24h = crypto.change24h || 0;
  const isPositive = change24h >= 0;

  return (
    <tr className={`transition-colors ${isStriped ? 'bg-card' : 'bg-background'} hover:bg-white/5`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Watchlist Star Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onWatchlistToggle(); }}
            className="hover:scale-110 transition-transform"
          >
            <Icon 
              name="StarIcon" 
              size={16} 
              variant={crypto.isWatchlisted ? 'solid' : 'outline'}
              className={crypto.isWatchlisted ? 'text-primary' : 'text-gray-600'}
            />
          </button>

          <span className="text-sm font-bold text-muted-foreground font-data w-6 text-center">{crypto.rank}</span>
          
          <div className="flex items-center gap-3">
            <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <div>
              <div className="font-bold text-sm text-white">{crypto.symbol?.toUpperCase()}</div>
              <div className="text-xs text-muted-foreground">{crypto.name}</div>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-right font-mono font-bold text-sm text-white">
        ${price > 1 ? price.toLocaleString(undefined, {minimumFractionDigits: 2}) : price.toFixed(6)}
      </td>

      <td className={`px-6 py-4 text-right font-mono font-bold text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{change24h.toFixed(2)}%
      </td>

      <td className={`px-6 py-4 text-right font-mono font-bold text-sm ${crypto.change7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {crypto.change7d?.toFixed(2)}%
      </td>

      <td className="px-6 py-4 text-right text-sm font-mono text-muted-foreground">
        ${(crypto.marketCap / 1e9).toFixed(2)}B
      </td>

      <td className="px-6 py-4 text-right text-sm font-mono text-muted-foreground">
        ${(crypto.volume24h / 1e6).toFixed(0)}M
      </td>

      <td className="px-4 py-4 w-32">
        <MiniPriceChart data={crypto.chartData} isPositive={crypto.change7d >= 0} />
      </td>
    </tr>
  );
}