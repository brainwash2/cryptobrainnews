export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import TradingViewChart from '@/components/ui/TradingViewChart';
import AffiliateLink from '@/components/monetization/AffiliateLink';
import { getLivePrices } from '@/lib/api';
import { fetchCryptoNews } from '@/lib/news';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${name} Price, Live Chart & Breaking News | CryptoBrainNews`,
    description: `Real-time ${name} price tracking, institutional market analysis, and the latest news updates.`,
  };
}

export default async function CoinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Find the symbol from our prices API to pass to TradingView
  const prices = await getLivePrices('usd', 'all');
  const coinData = prices.find((p) => p.id.toLowerCase() === slug.toLowerCase() || p.symbol.toLowerCase() === slug.toLowerCase());
  
  const name = coinData?.name || slug.charAt(0).toUpperCase() + slug.slice(1);
  const symbol = coinData?.symbol || slug.toUpperCase();

  // Fetch exactly 6 news articles specifically about this coin automatically
  const news = await fetchCryptoNews(6, name);

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans text-white">
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        {/* Header & High-Intent Monetization */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1a1a1a] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {coinData?.image && <img src={coinData.image} alt={name} className="w-8 h-8 rounded-full" />}
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                {name} <span className="text-[#555] ml-2 text-3xl">{symbol.toUpperCase()}</span>
              </h1>
            </div>
            <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em]">
              Live Price Chart & Market Analysis
            </p>
          </div>
          
          <AffiliateLink 
            exchange="bybit" 
            className="bg-[#00d672] text-black px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors"
          >
            Trade {symbol.toUpperCase()} Now →
          </AffiliateLink>
        </div>

        {/* Data Terminal & Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="w-full h-[500px] bg-[#0a0a0a] border border-[#1a1a1a] animate-pulse flex items-center justify-center text-[#555] font-mono text-xs">Loading Chart Interface...</div>}>
              <TradingViewChart symbol={symbol} />
            </Suspense>
          </div>
          
          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-lg">
              <h3 className="text-xs font-black text-[#888] uppercase tracking-[0.3em] mb-4">Current Price</h3>
              <p className="text-4xl font-mono font-black text-white">
                ${coinData?.current_price ? (coinData.current_price > 1 ? coinData.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : coinData.current_price.toFixed(6)) : '---'}
              </p>
              {coinData?.price_change_percentage_24h !== undefined && (
                <p className={`text-sm font-mono font-bold mt-2 ${coinData.price_change_percentage_24h >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                  24h: {coinData.price_change_percentage_24h > 0 ? '+' : ''}{coinData.price_change_percentage_24h.toFixed(2)}%
                </p>
              )}
            </div>
            
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-lg">
               <h3 className="text-xs font-black text-[#888] uppercase tracking-[0.3em] mb-4">Market Cap</h3>
               <p className="text-2xl font-mono font-bold text-[#FABF2C]">
                 ${coinData?.market_cap ? (coinData.market_cap >= 1e9 ? (coinData.market_cap / 1e9).toFixed(2) + 'B' : (coinData.market_cap / 1e6).toFixed(2) + 'M') : '---'}
               </p>
            </div>
            
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-lg">
               <h3 className="text-xs font-black text-[#888] uppercase tracking-[0.3em] mb-4">24h Volume</h3>
               <p className="text-2xl font-mono font-bold text-white">
                 ${coinData?.total_volume ? (coinData.total_volume >= 1e9 ? (coinData.total_volume / 1e9).toFixed(2) + 'B' : (coinData.total_volume / 1e6).toFixed(2) + 'M') : '---'}
               </p>
            </div>
          </div>
        </div>

        {/* Targeted News Feed */}
        <div className="pt-10 border-t border-[#1a1a1a]">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">
            Latest {name} <span className="text-[#FABF2C]">News</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="group border border-[#1a1a1a] bg-[#0a0a0a] p-5 hover:border-[#FABF2C]/50 transition-colors flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black text-[#FABF2C] uppercase tracking-widest">{article.source}</span>
                  <span className="text-[9px] font-mono text-[#555]">{new Date(article.published_on * 1000).toLocaleDateString()}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#FABF2C] transition-colors leading-snug mb-3">
                  {article.title}
                </h3>
                <p className="text-xs text-[#888] line-clamp-3 mb-4 flex-grow">
                  {article.body}
                </p>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#555] group-hover:text-white transition-colors mt-auto">Read Full Story →</span>
              </a>
            ))}
            {news.length === 0 && (
              <div className="col-span-full py-12 text-center text-[#555] font-mono text-xs uppercase tracking-widest">
                Scanning global wire for latest {name} updates...
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
