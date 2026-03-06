'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import type { CoinMarketData, NewsArticle } from '@/lib/types';
import MiniSparkline from './MiniSparkline';

interface Props { prices: CoinMarketData[]; news: NewsArticle[]; }

const CURRENCIES =[
  { code: 'USD', name: 'United States Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'Pound Sterling', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
];

const MAIN_CATEGORIES =[
  { label: 'All Coins', id: 'all' },
  { label: 'Stablecoin', id: 'stablecoins' },
  { label: 'Solana Ecosystem', id: 'solana-ecosystem' }
];

const MORE_CATEGORIES =[
  { label: 'Ethereum Ecosystem', id: 'ethereum-ecosystem' },
  { label: 'Top DeFi Tokens', id: 'decentralized-finance-defi' },
  { label: 'NFTs & Collectibles', id: 'non-fungible-tokens-nft' },
  { label: 'Lending & Borrowing', id: 'lending-borrowing' },
  { label: 'Memes', id: 'meme-token' },
  { label: 'Layer 1', id: 'layer-1' },
  { label: 'Layer 2', id: 'layer-2' },
  { label: 'Gaming', id: 'gaming' },
  { label: 'AI & Big Data', id: 'artificial-intelligence' },
  { label: 'Real World Assets', id: 'real-world-assets-rwa' },
  { label: 'DePIN', id: 'depin' }
];

export default function PriceIndexesTerminal({ prices, news }: Props) {
  const searchParams = useSearchParams();
  const currentCurrency = (searchParams.get('currency') || 'usd').toUpperCase();
  const currentCategory = searchParams.get('category') || 'all';
  
  const activeCurrencyObj = CURRENCIES.find(c => c.code === currentCurrency) || CURRENCIES[0];

  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const hotNews = Array.isArray(news) ? news.slice(0, 4) :[];
  const validPrices = Array.isArray(prices) ? prices : [];
  
  const topGainers =[...validPrices].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 3);
  const topLosers = [...validPrices].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 3);

  const formatUsd = (val: number | null | undefined, isPrice = false) => {
    if (val === null || val === undefined || isNaN(Number(val))) return '—';
    const num = Number(val);
    const symbol = currentCurrency === 'EUR' ? '€' : currentCurrency === 'GBP' ? '£' : currentCurrency === 'JPY' ? '¥' : '$';
    
    if (isPrice) {
      if (num >= 1000) return `${symbol}${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      if (num >= 1) return `${symbol}${num.toFixed(2)}`;
      return `${symbol}${num.toFixed(6)}`;
    }
    if (num >= 1e12) return `${symbol}${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${symbol}${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${symbol}${(num / 1e6).toFixed(2)}M`;
    return `${symbol}${num.toLocaleString()}`;
  };

  const ColorPct = ({ val }: { val?: number | null }) => {
    if (val === null || val === undefined) return <span className="text-[#555]">—</span>;
    const isPos = val >= 0;
    return (
      <span className={`font-mono font-bold ${isPos ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
        {isPos ? '▲' : '▼'} {Math.abs(val).toFixed(2)}%
      </span>
    );
  };

  const navigate = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    window.location.assign(`?${params.toString()}`);
  };

  return (
    <div className="space-y-12 w-full text-white">
      
      <div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">Cryptocurrency Prices</h1>
        <p className="text-gray-400 text-sm">
          The global crypto market cap is <span className="font-bold text-white">{formatUsd(validPrices.reduce((s, p) => s + (p.market_cap || 0), 0))}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <h2 className="text-xl font-bold mb-4">Market Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5 rounded-lg">
              <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-2 mb-4">
                <span className="text-sm font-bold">Top Gainers</span>
                <span className="text-xs text-[#00d672] bg-[#00d672]/10 px-2 py-1 rounded">24h</span>
              </div>
              <div className="space-y-4">
                {topGainers.map(c => (
                  <div key={c.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {c.image && <img src={c.image} alt={c.name} className="w-6 h-6 rounded-full" />}
                      <span className="text-sm font-bold uppercase">{c.symbol}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-gray-400">{formatUsd(c.current_price, true)}</span>
                      <ColorPct val={c.price_change_percentage_24h} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5 rounded-lg">
              <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-2 mb-4">
                <span className="text-sm font-bold">Top Losers</span>
                <span className="text-xs text-[#ff4757] bg-[#ff4757]/10 px-2 py-1 rounded">24h</span>
              </div>
              <div className="space-y-4">
                {topLosers.map(c => (
                  <div key={c.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {c.image && <img src={c.image} alt={c.name} className="w-6 h-6 rounded-full" />}
                      <span className="text-sm font-bold uppercase">{c.symbol}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-gray-400">{formatUsd(c.current_price, true)}</span>
                      <ColorPct val={c.price_change_percentage_24h} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <h2 className="text-xl font-bold mb-4">Hot Market News</h2>
          <div className="space-y-4">
            {hotNews.map(n => (
              <a key={n.id} href={n.url} target="_blank" rel="noreferrer" className="flex gap-4 group">
                <div className="w-24 h-16 relative shrink-0 overflow-hidden bg-[#111] rounded">
                  <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-[#FABF2C] transition-colors leading-tight line-clamp-2">{n.title}</h3>
                  <span className="text-[10px] text-gray-500 mt-1 block">{n.source}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8">
        <h2 className="text-3xl font-bold mb-6">Today's Top Cryptocurrencies</h2>
        
        {/* DROPDOWN FIX: Flex-wrap allows normal document flow. No overflow-x-auto to clip it! */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 relative z-[100]">
          
          <div className="flex flex-wrap items-center gap-2">
            {MAIN_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate('category', cat.id)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${
                  currentCategory === cat.id ? 'bg-[#FABF2C] text-black' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#333]'
                }`}
              >
                {cat.label}
              </button>
            ))}
            
            <div className="relative">
              <button
                onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowCurrencyDropdown(false); }}
                className={`flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-full transition-all ${
                  MORE_CATEGORIES.some(c => c.id === currentCategory) || showCategoryDropdown ? 'bg-[#333] text-white' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#333]'
                }`}
              >
                {MORE_CATEGORIES.find(c => c.id === currentCategory)?.label || 'More categories'} <ChevronDown size={14} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#111] rounded shadow-2xl border border-[#333] z-[9999]">
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                    {MORE_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => navigate('category', cat.id)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#222] rounded transition-colors"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative shrink-0">
            <button 
              onClick={() => { setShowCurrencyDropdown(!showCurrencyDropdown); setShowCategoryDropdown(false); }}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] hover:border-[#555] px-4 py-2 rounded-full transition-colors"
            >
              <span className="text-base leading-none">{activeCurrencyObj.flag}</span>
              <span className="text-xs font-bold text-white">{activeCurrencyObj.code}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#111] rounded shadow-2xl border border-[#333] z-[9999]">
                <div className="max-h-80 overflow-y-auto custom-scrollbar p-1">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => navigate('currency', c.code.toLowerCase())}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#222] rounded transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{c.flag}</span>
                        <span className="text-sm font-bold text-gray-200">{c.code}</span>
                        <span className="text-xs text-gray-500">{c.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0a0a0a] overflow-x-auto rounded-lg border border-[#1a1a1a] relative z-10">
          <table className="w-full border-collapse whitespace-nowrap">
            <thead className="bg-[#111] border-b border-[#222]">
              <tr>
                <th className="px-4 py-4 text-left text-[11px] font-black text-gray-400 uppercase">#</th>
                <th className="px-4 py-4 text-left text-[11px] font-black text-gray-400 uppercase">Name</th>
                <th className="px-4 py-4 text-right text-[11px] font-black text-gray-400 uppercase">Price</th>
                <th className="px-4 py-4 text-right text-[11px] font-black text-gray-400 uppercase">1h %</th>
                <th className="px-4 py-4 text-right text-[11px] font-black text-gray-400 uppercase">24h %</th>
                <th className="px-4 py-4 text-right text-[11px] font-black text-gray-400 uppercase">7d %</th>
                <th className="px-4 py-4 text-right text-[11px] font-black text-gray-400 uppercase">Market Cap</th>
                <th className="px-4 py-4 text-right text-[11px] font-black text-gray-400 uppercase">24h Volume</th>
                <th className="px-4 py-4 text-right text-[11px] font-black text-gray-400 uppercase w-[120px]">7d Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {validPrices.length === 0 ? (
                 <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">No coins found for this category.</td></tr>
              ) : validPrices.map((coin, idx) => (
                <tr key={coin.id} className="hover:bg-[#111] transition-colors">
                  <td className="px-4 py-5 text-[12px] font-mono text-gray-500">{coin.market_cap_rank || '—'}</td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      {coin.image && <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />}
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-white">{coin.name}</span>
                        <span className="text-[11px] font-bold text-gray-500 uppercase">{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-right text-[14px] font-mono font-bold text-white">{formatUsd(coin.current_price, true)}</td>
                  {/* @ts-ignore */}
                  <td className="px-4 py-5 text-right text-[13px]"><ColorPct val={coin.price_change_percentage_1h_in_currency} /></td>
                  <td className="px-4 py-5 text-right text-[13px]"><ColorPct val={coin.price_change_percentage_24h} /></td>
                  <td className="px-4 py-5 text-right text-[13px]"><ColorPct val={coin.price_change_percentage_7d} /></td>
                  <td className="px-4 py-5 text-right text-[13px] font-mono text-gray-400">{formatUsd(coin.market_cap)}</td>
                  <td className="px-4 py-5 text-right text-[13px] font-mono text-gray-400">{formatUsd(coin.total_volume)}</td>
                  <td className="px-4 py-5 w-[120px]">
                    {coin.sparkline_in_7d?.price && (
                      <MiniSparkline data={coin.sparkline_in_7d.price} isPositive={(coin.price_change_percentage_7d || 0) >= 0} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
