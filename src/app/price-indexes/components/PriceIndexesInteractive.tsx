'use client';

import React, { useState, useEffect } from 'react';
import { getLivePrices, getRealNews } from '@/lib/api';
import { CRYPTO_CATEGORIES } from '@/lib/categories';
import MarketHighlights from './MarketHighlights';
import CryptoTableRow from './CryptoTableRow';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase-client';

export default function PriceIndexesInteractive() {
  const [coins, setCoins] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All Coins');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 1. Fetch Data & User Session
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Check User
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // Fetch Watchlist if logged in
      if (session?.user) {
        const { data } = await supabase
          .from('user_watchlists')
          .select('symbol');
        if (data) setWatchlist(data.map((item: any) => item.symbol));
      }

      // Fetch Market Data
      const apiCategory = activeCategory === 'All Coins' ? 'all' : activeCategory;
      const [marketData, newsData] = await Promise.all([
        getLivePrices('usd', apiCategory),
        getRealNews()
      ]);
      
      if (Array.isArray(marketData)) {
        setCoins(marketData.map((coin: any, index: number) => ({
          ...coin,
          // Normalize API data
          price: Number(coin.current_price || coin.price || 0),
          change24h: Number(coin.price_change_percentage_24h || 0),
          change7d: Number(coin.price_change_percentage_7d_in_currency || 0),
          marketCap: Number(coin.market_cap || 0),
          volume24h: Number(coin.total_volume || 0),
          chartData: coin.sparkline_in_7d?.price?.map((p: number) => ({ value: p })) || []
        })));
      }
      setNews(newsData);
      setLoading(false);
    }
    fetchData();
  }, [activeCategory]);

  // 2. Handle Watchlist Toggle
  const handleWatchlistToggle = async (symbol: string) => {
    if (!user) {
      alert("Please login to create a watchlist.");
      return;
    }

    const upperSymbol = symbol.toUpperCase();
    if (watchlist.includes(upperSymbol)) {
      // Remove
      const newWatchlist = watchlist.filter(s => s !== upperSymbol);
      setWatchlist(newWatchlist);
      await supabase.from('user_watchlists').delete().match({ user_id: user.id, symbol: upperSymbol });
    } else {
      // Add
      setWatchlist([...watchlist, upperSymbol]);
      await supabase.from('user_watchlists').insert({ user_id: user.id, symbol: upperSymbol });
    }
  };

  const mainCategories = CRYPTO_CATEGORIES.slice(0, 4);
  const moreCategories = CRYPTO_CATEGORIES.slice(4);

  if (loading && coins.length === 0) return <div className="p-20 text-center text-primary font-mono animate-pulse">LOADING LIVE TERMINAL...</div>;

  return (
    <div className="pb-20">
      <div className="mb-8 space-y-6">
        <h1 className="text-4xl font-bold font-heading text-white">Today's Cryptocurrency Prices</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {mainCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${activeCategory === cat ? 'bg-primary text-black' : 'bg-secondary text-muted-foreground hover:text-white'}`}>
              {cat}
            </button>
          ))}
          <div className="relative">
            <button onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${!mainCategories.includes(activeCategory) ? 'bg-primary text-black' : 'bg-secondary text-muted-foreground hover:text-white'}`}>
              {mainCategories.includes(activeCategory) ? 'More Categories' : activeCategory}
              <Icon name="ChevronDownIcon" size={14} />
            </button>
            {isCategoryMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-black border border-gray-700 shadow-xl z-50 rounded-lg p-2 grid grid-cols-1">
                {moreCategories.map(cat => (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setIsCategoryMenuOpen(false); }} className="text-left px-3 py-2 text-xs font-medium text-gray-300 hover:bg-primary hover:text-black rounded transition-colors">
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <MarketHighlights coins={coins} news={news} />

      <div className="bg-card border border-border overflow-hidden rounded-lg shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">24h %</th>
                <th className="px-6 py-4 text-right">7d %</th>
                <th className="px-6 py-4 text-right">Market Cap</th>
                <th className="px-6 py-4 text-right">Volume</th>
                <th className="px-6 py-4 text-right w-32">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coins.map((coin, index) => (
                <CryptoTableRow 
                  key={coin.id || index} 
                  crypto={{
                    ...coin,
                    // Pass watchlist status to row
                    isWatchlisted: watchlist.includes(coin.symbol?.toUpperCase())
                  }} 
                  isStriped={index % 2 === 0} 
                  onWatchlistToggle={() => handleWatchlistToggle(coin.symbol)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}