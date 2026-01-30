'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import SpotMarketsTable from './SpotMarketsTable';
import FuturesMarketsTable from './FuturesMarketsTable';
import ETFFlowsChart from './ETFFlowsChart';
import VolumeAnalysisChart from './VolumeAnalysisChart';
import FilterToolbar from './FilterToolbar';
import TopPerformersPanel from './TopPerformersPanel';
import MarketSummaryCard from './MarketSummaryCard';

type TabType = 'spot' | 'futures' | 'etf';

export default function MarketsInteractive() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('spot');
  const [selectedExchange, setSelectedExchange] = useState('All Exchanges');
  const [searchQuery, setSearchQuery] = useState('');
  const [volumeThreshold, setVolumeThreshold] = useState('All Volumes');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const spotMarkets = [
    { id: '1', pair: 'BTC/USDT', exchange: 'Binance', price: 42350.75, volume24h: 2450000000, change24h: 3.04, bid: 42348.50, ask: 42352.25, spread: 0.009 },
    { id: '2', pair: 'ETH/USDT', exchange: 'Coinbase', price: 2245.60, volume24h: 1230000000, change24h: -1.97, bid: 2245.10, ask: 2246.20, spread: 0.049 },
    { id: '3', pair: 'SOL/USDT', exchange: 'Binance', price: 98.45, volume24h: 456000000, change24h: 6.11, bid: 98.42, ask: 98.48, spread: 0.061 },
    { id: '4', pair: 'XRP/USDT', exchange: 'Kraken', price: 0.5234, volume24h: 234000000, change24h: 2.41, bid: 0.5232, ask: 0.5236, spread: 0.076 },
    { id: '5', pair: 'ADA/USDT', exchange: 'Bybit', price: 0.4567, volume24h: 189000000, change24h: -4.87, bid: 0.4565, ask: 0.4569, spread: 0.088 },
    { id: '6', pair: 'AVAX/USDT', exchange: 'OKX', price: 34.56, volume24h: 167000000, change24h: 7.26, bid: 34.54, ask: 34.58, spread: 0.116 }
  ];

  const futuresMarkets = [
    { id: '1', symbol: 'BTCUSDT', exchange: 'Binance', markPrice: 42355.80, indexPrice: 42350.75, fundingRate: 0.0001, openInterest: 3450000000, volume24h: 5670000000, change24h: 3.12 },
    { id: '2', symbol: 'ETHUSDT', exchange: 'Bybit', markPrice: 2246.30, indexPrice: 2245.60, fundingRate: -0.0002, openInterest: 1890000000, volume24h: 2340000000, change24h: -1.89 },
    { id: '3', symbol: 'SOLUSDT', exchange: 'OKX', markPrice: 98.52, indexPrice: 98.45, fundingRate: 0.0003, openInterest: 567000000, volume24h: 890000000, change24h: 6.23 }
  ];

  const etfFlowsData = [
    { date: '01/22', inflows: 450000000, outflows: 120000000, net: 330000000 },
    { date: '01/23', inflows: 380000000, outflows: 200000000, net: 180000000 },
    { date: '01/24', inflows: 520000000, outflows: 150000000, net: 370000000 },
    { date: '01/25', inflows: 290000000, outflows: 180000000, net: 110000000 },
    { date: '01/26', inflows: 610000000, outflows: 90000000, net: 520000000 }
  ];

  const volumeData = [
    { time: '00:00', spotVolume: 1200000000, futuresVolume: 2300000000, totalVolume: 3500000000 },
    { time: '04:00', spotVolume: 1450000000, futuresVolume: 2600000000, totalVolume: 4050000000 },
    { time: '08:00', spotVolume: 1680000000, futuresVolume: 2900000000, totalVolume: 4580000000 },
    { time: '12:00', spotVolume: 1890000000, futuresVolume: 3200000000, totalVolume: 5090000000 },
    { time: '16:00', spotVolume: 1750000000, futuresVolume: 3100000000, totalVolume: 4850000000 },
    { time: '20:00', spotVolume: 1620000000, futuresVolume: 2800000000, totalVolume: 4420000000 },
    { time: '23:59', spotVolume: 1540000000, futuresVolume: 2700000000, totalVolume: 4240000000 }
  ];

  const topPerformers = [
    { symbol: 'AVAX', name: 'Avalanche', change24h: 7.26, volume24h: 167000000, price: 34.56 },
    { symbol: 'SOL', name: 'Solana', change24h: 6.11, volume24h: 456000000, price: 98.45 },
    { symbol: 'BTC', name: 'Bitcoin', change24h: 3.04, volume24h: 2450000000, price: 42350.75 },
    { symbol: 'XRP', name: 'Ripple', change24h: 2.41, volume24h: 234000000, price: 0.5234 }
  ];

  const handleSpotRowClick = (market: any) => console.log('Spot market clicked:', market);
  const handleFuturesRowClick = (market: any) => console.log('Futures market clicked:', market);
  const handleExportData = () => console.log('Exporting market data...');
  const handleCompare = () => console.log('Opening comparison tool...');

  if (!isHydrated) return null;

  return (
    <div className="bg-background">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MarketSummaryCard title="Total Trading Volume" value="$12.45B" change={1250000000} changePercent={11.23} icon="ChartBarIcon" />
        <MarketSummaryCard title="Active Trading Pairs" value="1,247" change={34} changePercent={2.81} icon="CurrencyDollarIcon" />
        <MarketSummaryCard title="Market Dominance" value="BTC 52.3%" change={0.8} changePercent={1.55} icon="CircleStackIcon" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border">
            <div className="flex border-b border-border">
              {['spot', 'futures', 'etf'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as TabType)}
                  className={`flex-1 px-6 py-4 text-sm font-bold font-heading uppercase tracking-wide transition-smooth ${
                    activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {tab} Markets
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === 'spot' && (
                <div className="space-y-6">
                  <FilterToolbar
                    selectedExchange={selectedExchange}
                    onExchangeChange={setSelectedExchange}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    volumeThreshold={volumeThreshold}
                    onVolumeThresholdChange={setVolumeThreshold}
                  />
                  <SpotMarketsTable markets={spotMarkets} onRowClick={handleSpotRowClick} />
                </div>
              )}
              {activeTab === 'futures' && (
                <div className="space-y-6">
                  <FilterToolbar
                    selectedExchange={selectedExchange}
                    onExchangeChange={setSelectedExchange}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    volumeThreshold={volumeThreshold}
                    onVolumeThresholdChange={setVolumeThreshold}
                  />
                  <FuturesMarketsTable markets={futuresMarkets} onRowClick={handleFuturesRowClick} />
                </div>
              )}
              {activeTab === 'etf' && <ETFFlowsChart data={etfFlowsData} />}
            </div>
          </div>
          <VolumeAnalysisChart data={volumeData} />
        </div>
        <div className="lg:col-span-1">
          <TopPerformersPanel performers={topPerformers} />
        </div>
      </div>
    </div>
  );
}
