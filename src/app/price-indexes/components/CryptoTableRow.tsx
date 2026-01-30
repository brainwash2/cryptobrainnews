'use client';
import React from 'react';
import MiniPriceChart from './MiniPriceChart';

export default function CryptoTableRow({ crypto, isStriped }: any) {
  const price = crypto.price || 0;
  const change24h = crypto.change24h || 0;
  const isPositive = change24h >= 0;

  return (
    <tr className={`hover:bg-muted/20 transition-colors ${isStriped ? 'bg-card' : 'bg-background'}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-muted-foreground w-6 text-center">{crypto.rank}</span>
          <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <div>
            <div className="font-bold text-sm">{crypto.symbol}</div>
            <div className="text-xs text-muted-foreground">{crypto.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right font-mono font-bold text-sm">
        ${price > 1 ? price.toLocaleString(undefined, {minimumFractionDigits: 2}) : price.toFixed(6)}
      </td>
      <td className={`px-6 py-4 text-right font-mono font-bold text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {change24h > 0 ? '+' : ''}{change24h.toFixed(2)}%
      </td>
      <td className="px-4 py-4 w-32">
        <MiniPriceChart data={crypto.chartData} isPositive={isPositive} />
      </td>
    </tr>
  );
}
