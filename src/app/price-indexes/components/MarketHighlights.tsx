'use client';
import React from 'react';

interface HighlightCardProps {
  title: string;
  data: any[];
  type: 'gainer' | 'loser';
}

const HighlightCard = ({ title, data, type }: HighlightCardProps) => (
  <div className="bg-card border border-border p-4 flex-1">
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
      <h3 className="font-bold text-lg text-white">{title}</h3>
      <span className="text-xs text-muted-foreground">24h</span>
    </div>
    <div className="space-y-3">
      {data.length > 0 ? data.map((coin, index) => {
        // BRUTE FORCE: Force convert to number, default to 0 if NaN
        const rawChange = coin.change24h || coin.price_change_percentage_24h;
        const changeValue = Number(rawChange) || 0;
        
        return (
          <div key={coin.id || index} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full bg-white/10" onError={(e) => e.currentTarget.style.display='none'} />
              <span className="font-bold text-sm text-foreground">{coin.symbol?.toUpperCase() || 'N/A'}</span>
            </div>
            <span className={`text-sm font-mono font-bold ${type === 'gainer' ? 'text-green-500' : 'text-red-500'}`}>
              {type === 'gainer' ? '+' : ''}{changeValue.toFixed(2)}%
            </span>
          </div>
        );
      }) : (
        <div className="text-xs text-muted-foreground py-4 text-center">Scanning market...</div>
      )}
    </div>
  </div>
);

export default function MarketHighlights({ coins, news }: { coins: any[], news: any[] }) {
  // BRUTE FORCE SORT: Convert to number before sorting to handle API strings
  const sorted = [...coins].sort((a, b) => {
    const valA = Number(a.change24h || a.price_change_percentage_24h || 0);
    const valB = Number(b.change24h || b.price_change_percentage_24h || 0);
    return valB - valA;
  });

  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse(); // Bottom 3, reversed to show worst first

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <HighlightCard title="Top Gainers" data={gainers} type="gainer" />
      <HighlightCard title="Top Losers" data={losers} type="loser" />

      <div className="bg-card border border-border p-4 flex-1">
        <h3 className="font-bold text-lg mb-4 pb-2 border-b border-border text-white">Hot Market News</h3>
        <div className="space-y-4">
          {news.length > 0 ? news.map((item) => (
            <a href={item.url} target="_blank" key={item.id} className="flex gap-3 group hover:bg-white/5 p-2 rounded transition-colors">
              <img src={item.image} alt="news" className="w-16 h-16 object-cover rounded" onError={(e) => e.currentTarget.style.display='none'}/>
              <div>
                <p className="text-sm font-bold line-clamp-2 text-white group-hover:text-primary transition-colors leading-tight">{item.title}</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">{item.source} • {new Date(item.published_on * 1000).getHours()}h ago</span>
              </div>
            </a>
          )) : <div className="text-xs text-muted-foreground">Loading news feed...</div>}
        </div>
      </div>
    </div>
  );
}
