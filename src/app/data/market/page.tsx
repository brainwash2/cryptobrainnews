import React from 'react';
import Link from 'next/link';
import { getLiveMarketPrices } from '@/lib/api';

export const metadata = {
  title: 'Markets Overview | CryptoBrainNews',
  description: 'Cryptocurrency market overview and data sections.',
};

export const revalidate = 300;

async function getMarketData() {
  try {
    return await getLiveMarketPrices();
  } catch {
    return [];
  }
}

const MARKET_SECTIONS = [
  { title: 'Spot', slug: 'spot', description: 'Real-time spot prices', icon: '💰' },
  { title: 'Futures', slug: 'futures', description: 'Perpetual & futures data', icon: '📈' },
  { title: 'Indices', slug: 'indices', description: 'Crypto indices', icon: '📊' },
  { title: 'Options', slug: 'options', description: 'Options market data', icon: '⚙️' },
  { title: 'Prices', slug: 'prices', description: 'Price tracking', icon: '💹' },
  { title: 'Volumes', slug: 'volumes', description: 'Exchange volumes', icon: '📉' },
];

export default async function MarketsPage() {
  const prices = await getMarketData();

  const topCoins = prices.slice(0, 4);
  const totalMarketCap = prices.reduce((sum, p) => sum + (p.market_cap || 0), 0);
  const totalVolume = prices.reduce((sum, p) => sum + (p.total_volume || 0), 0);

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Market <span className="text-[#FABF2C]">Data</span>
          </h1>
          <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em]">
            Global Cryptocurrency Market Overview
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Global Market Cap</p>
            <p className="text-2xl font-black text-[#FABF2C]">
              ${(totalMarketCap / 1e12).toFixed(2)}T
            </p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <p className="text-[9px] text-[#555] uppercase font-mono mb-2">24h Volume</p>
            <p className="text-2xl font-black text-[#FABF2C]">
              ${(totalVolume / 1e9).toFixed(1)}B
            </p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Assets Tracked</p>
            <p className="text-2xl font-black text-[#FABF2C]">{prices.length}</p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Status</p>
            <p className="text-2xl font-black text-green-500">Live</p>
          </div>
        </div>

        {/* Top 4 Coins */}
        {topCoins.length > 0 && (
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-4">
              Top Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topCoins.map((coin) => (
                <div
                  key={coin.id}
                  className="p-6 border border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#FABF2C]/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {coin.image && (
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-xs font-black text-white">{coin.symbol.toUpperCase()}</p>
                      <p className="text-[8px] text-[#555]">#{coin.market_cap_rank}</p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-[#FABF2C] mb-2">
                    ${coin.current_price?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || '—'}
                  </p>
                  <p
                    className={`text-xs font-black ${
                      (coin.price_change_percentage_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                    {coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Sections Grid */}
        <div>
          <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6">
            Data Sections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARKET_SECTIONS.map((section) => (
              <Link
                key={section.slug}
                href={`/data/markets/${section.slug}`}
                className="border border-[#1a1a1a] hover:border-[#FABF2C] bg-[#0a0a0a] hover:bg-[#0a0a0a]/80 p-6 transition-all group"
              >
                <div className="text-2xl mb-3">{section.icon}</div>
                <h3 className="text-lg font-black text-white uppercase mb-2 group-hover:text-[#FABF2C] transition-colors">
                  {section.title}
                </h3>
                <p className="text-xs text-[#555]">{section.description}</p>
                <div className="mt-4 text-[#FABF2C] text-xs font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
