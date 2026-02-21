import React from 'react';
import { getLiveMarketPrices } from '@/lib/api';
import type { CoinMarketData } from '@/lib/types';
import CoinImage from './_components/CoinImage';

export const metadata = {
  title: 'Spot Markets | CryptoBrainNews',
  description: 'Real-time spot market prices and data.',
};

export const revalidate = 300;

async function getSpotData(): Promise<CoinMarketData[]> {
  try {
    return await getLiveMarketPrices();
  } catch (error) {
    console.error('Failed to fetch spot market data:', error);
    return [];
  }
}

function fmtPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(6);
}

function fmtCompact(val: number): string {
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9)  return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6)  return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3)  return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

function changeColor(val: number | null | undefined): string {
  if (!val) return 'text-[#555]';
  if (val > 0) return 'text-[#00d672]';
  if (val < 0) return 'text-[#ff4757]';
  return 'text-[#555]';
}

function fmtChange(val: number | null | undefined): string {
  if (!val) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
}

export default async function SpotMarketPage() {
  const prices = await getSpotData();

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Spot <span className="text-[#FABF2C]">Markets</span>
          </h1>
          <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em]">
            Real-Time Cryptocurrency Spot Prices
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
            <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Assets Tracked</p>
            <p className="text-2xl font-black text-[#FABF2C]">{prices.length}</p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
            <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Total Market Cap</p>
            <p className="text-2xl font-black text-[#FABF2C]">
              ${(prices.reduce((sum, p) => sum + (p.market_cap || 0), 0) / 1e12).toFixed(2)}T
            </p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
            <p className="text-[9px] text-[#555] uppercase font-mono mb-2">24h Volume</p>
            <p className="text-2xl font-black text-[#FABF2C]">
              ${(prices.reduce((sum, p) => sum + (p.total_volume || 0), 0) / 1e9).toFixed(1)}B
            </p>
          </div>
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
            <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Data Source</p>
            <p className="text-2xl font-black text-[#FABF2C]">CoinGecko</p>
          </div>
        </div>

        {/* Price Table */}
        <div className="border border-[#1a1a1a] bg-[#080808] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-[#0a0a0a] border-b-2 border-[#1a1a1a]">
                <tr>
                  <th className="px-3 py-2 text-left">
                    <span className="text-[10px] font-black text-[#555] uppercase tracking-wider">#</span>
                  </th>
                  <th className="px-3 py-2 text-left">
                    <span className="text-[10px] font-black text-[#555] uppercase tracking-wider">Asset</span>
                  </th>
                  <th className="px-3 py-2 text-right">
                    <span className="text-[10px] font-black text-[#555] uppercase tracking-wider">Price</span>
                  </th>
                  <th className="px-3 py-2 text-right">
                    <span className="text-[10px] font-black text-[#555] uppercase tracking-wider">24h %</span>
                  </th>
                  <th className="px-3 py-2 text-right">
                    <span className="text-[10px] font-black text-[#555] uppercase tracking-wider">7d %</span>
                  </th>
                  <th className="px-3 py-2 text-right">
                    <span className="text-[10px] font-black text-[#555] uppercase tracking-wider">Mkt Cap</span>
                  </th>
                  <th className="px-3 py-2 text-right">
                    <span className="text-[10px] font-black text-[#555] uppercase tracking-wider">Vol 24h</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {prices.slice(0, 100).map((coin, idx) => (
                  <tr
                    key={coin.id}
                    className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                      idx % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0b0b0b]'
                    }`}
                  >
                    <td className="px-3 py-[10px] w-10">
                      <span className="text-[11px] font-mono text-[#444] tabular-nums">
                        {coin.market_cap_rank || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-[10px]">
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        {coin.image && <CoinImage src={coin.image} alt={coin.name} />}
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-white tracking-wide">
                            {coin.symbol.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-[#444] font-mono hidden xl:inline truncate max-w-[100px]">
                            {coin.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-[10px] text-right">
                      <span className="text-[12px] font-mono font-bold text-white tabular-nums">
                        ${fmtPrice(coin.current_price || 0)}
                      </span>
                    </td>
                    <td className="px-3 py-[10px] text-right">
                      <span className={`text-[11px] font-mono font-bold tabular-nums ${changeColor(coin.price_change_percentage_24h)}`}>
                        {fmtChange(coin.price_change_percentage_24h)}
                      </span>
                    </td>
                    <td className="px-3 py-[10px] text-right">
                      <span className={`text-[11px] font-mono font-bold tabular-nums ${changeColor(coin.price_change_percentage_7d)}`}>
                        {fmtChange(coin.price_change_percentage_7d)}
                      </span>
                    </td>
                    <td className="px-3 py-[10px] text-right">
                      <span className="text-[11px] font-mono text-[#888] tabular-nums">
                        {fmtCompact(coin.market_cap || 0)}
                      </span>
                    </td>
                    <td className="px-3 py-[10px] text-right">
                      <span className="text-[11px] font-mono text-[#666] tabular-nums">
                        {fmtCompact(coin.total_volume || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {prices.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-[#333] font-mono text-xs uppercase tracking-widest">
                No price data available
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-[9px] font-mono text-[#333] uppercase tracking-widest px-1">
          <span>DATA: COINGECKO • REFRESH: 60S</span>
          <span>{prices.length} ASSETS</span>
        </div>
      </div>
    </main>
  );
}
