'use client';
import React from 'react';

interface HighlightCardProps {
  title: string;
  data: any[];
  type: 'gainer' | 'loser';
}

const HighlightCard = ({ title, data, type }: HighlightCardProps) => (
  <div className="bg-card border border-border p-4 flex-1 h-full">
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
      <h3 className="font-bold text-lg text-white">{title}</h3>
      <span className="text-xs text-muted-foreground">24h</span>
    </div>
    <div className="space-y-3">
      {data.length > 0 ? data.map((coin, index) => (
        <div key={index} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" onError={(e) => e.currentTarget.style.display='none'} />
            <span className="font-bold text-sm text-foreground">{coin.symbol}</span>
          </div>
          <span className={`text-sm font-mono font-bold ${type === 'gainer' ? 'text-green-500' : 'text-red-500'}`}>
            {type === 'gainer' ? '+' : ''}{coin.change24h.toFixed(2)}%
          </span>
        </div>
      )) : <div className="text-muted-foreground text-xs py-4 text-center">Loading...</div>}
    </div>
  </div>
);

export default function MarketHighlights({ coins, news }: { coins: any[], news: any[] }) {
  // Sort by change24h (guaranteed to be a number now)
  const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(sorted.length - 3).reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <HighlightCard title="Top Gainers" data={gainers} type="gainer" />
      <HighlightCard title="Top Losers" data={losers} type="loser" />
      
      <div className="bg-card border border-border p-4 flex-1 h-full">
        <h3 className="font-bold text-lg mb-4 pb-2 border-b border-border text-white">Hot Market News</h3>
        <div className="space-y-4">
          {news.length > 0 ? news.map((item, i) => (
            <a href={item.url} target="_blank" key={i} className="flex gap-3 group hover:bg-white/5 p-2 rounded transition-colors">
              <img src={item.image} alt="news" className="w-12 h-12 object-cover rounded" />
              <div>
                <p className="text-xs font-bold line-clamp-2 text-white group-hover:text-primary leading-tight">{item.title}</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">{item.source} • {new Date(item.published_on * 1000).getHours()}h ago</span>
              </div>
            </a>
          )) : <div className="text-xs text-muted-foreground text-center py-4">Loading news...</div>}
        </div>
      </div>
    </div>
  );
}
