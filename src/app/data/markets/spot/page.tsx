import React from 'react';
import LazyChart from './_components/LazyChart';

export const metadata = {
  title: 'Spot Markets Dashboard | CryptoBrainNews',
  description: 'Live cryptocurrency spot market volumes, pairs, and exchange dominance.',
};

const CHARTS = [
  { title: "Cryptocurrency Monthly Exchange Volume", src: "https://www.theblock.co/data/crypto-markets/spot/cryptocurrency-exchange-volume-monthly/embed" },
  { title: "Daily Exchange Volume (7DMA)", src: "https://www.theblock.co/data/crypto-markets/spot/total-exchange-volume-daily/embed" },
  { title: "USD Support Exchange Volume", src: "https://www.theblock.co/data/crypto-markets/spot/usd-support-exchange-volume/embed" },
  { title: "Monthly Exchange Volume Market Share", src: "https://www.theblock.co/data/crypto-markets/spot/the-block-legitimate-index-market-share/embed" },
  { title: "Bitcoin Spot Trading Volume (in terms of BTC)", src: "https://www.theblock.co/data/crypto-markets/spot/the-block-legitimate-volume-index-btc-only/embed" },
  { title: "Ether Spot Trading Volume (in terms of ETH)", src: "https://www.theblock.co/data/crypto-markets/spot/the-block-legitimate-volume-index-eth-only/embed" },
  { title: "Share of Trade Volume by Pair Denomination", src: "https://www.theblock.co/data/crypto-markets/spot/share-of-trade-volume-by-pair-denomination/embed" },
  { title: "Monthly Spot Pairs for Exchanges", src: "https://www.theblock.co/data/crypto-markets/spot/monthly-spot-pairs-for-exchanges/embed" },
  { title: "BTC Spot to Futures Volume (30DMA)", src: "https://www.theblock.co/data/crypto-markets/spot/btc-spot-to-futures-volume/embed" },
  { title: "ETH Spot to Futures Volume (30DMA)", src: "https://www.theblock.co/data/crypto-markets/spot/eth-spot-to-futures-volume/embed" },
  { title: "Asia-Based Customer Exchange Volume", src: "https://www.theblock.co/data/crypto-markets/spot/asia-based-customer-exchange-volume/embed" },
  { title: "Europe-Based Customer Exchange Volume", src: "https://www.theblock.co/data/crypto-markets/spot/europe-based-customer-exchange-volume/embed" },
  { title: "North America-Based Customer Exchange Volume", src: "https://www.theblock.co/data/crypto-markets/spot/north-america-based-customer-exchange-volume/embed" },
  { title: "South America-Based Exchange Volume", src: "https://www.theblock.co/data/crypto-markets/spot/south-america-based-exchange-volume/embed" },
  { title: "BTC/EUR Volumes (in BTC)", src: "https://www.theblock.co/data/crypto-markets/spot/btc-eur-volumes/embed" },
  { title: "ETH/EUR Volumes (in ETH)", src: "https://www.theblock.co/data/crypto-markets/spot/eth-eur-volumes-in-eth/embed" },
  { title: "Share of BUSD Trading on Binance", src: "https://www.theblock.co/data/crypto-markets/spot/share-of-busd-trading-on-binance/embed" },
  { title: "Binance Share of Volume by Fee Type", src: "https://www.theblock.co/data/crypto-markets/spot/binance-share-of-volume-by-fee-type/embed" },
  { title: "Spot Volume by Asset", src: "https://www.theblock.co/data/crypto-markets/spot/spot-volume-by-asset/embed" },
  { title: "Share of TUSD Trading on Binance", src: "https://www.theblock.co/data/crypto-markets/spot/share-of-tusd-trading-on-binance/embed" },
  { title: "Share of FDUSD Trading on Binance", src: "https://www.theblock.co/data/crypto-markets/spot/share-of-fdusd-trading-on-binance/embed" },
  { title: "Spot Volume Share by Asset", src: "https://www.theblock.co/data/crypto-markets/spot/spot-volume-share-by-asset/embed" }
];

export default function SpotMarketsPage() {
  return (
    <div className="space-y-8 max-w-full overflow-hidden font-sans pb-20">
      
      {/* Header aligned with Institutional Look */}
      <div className="border-b border-[#27272a] pb-6 mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            Data Terminal <span className="text-[#3f3f46]">/</span> Markets
          </h2>
          <h1 className="text-4xl lg:text-5xl font-normal text-white tracking-tight">Spot</h1>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-[#09090b] border border-[#27272a] px-3 py-1.5 rounded text-[10px] font-mono text-[#a1a1aa] uppercase">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1" />
          Live Exchange Feeds
        </div>
      </div>

      {/* Grid of 22 Live Embedded Dashboards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-8">
        {CHARTS.map((chart, idx) => (
          <LazyChart key={idx} title={chart.title} src={chart.src} />
        ))}
      </div>

      {/* Data Attribution Footer */}
      <div className="pt-12 text-center">
        <p className="text-[10px] text-[#555] font-mono uppercase tracking-widest">
          Market Data Provider: The Block Pro • Real-Time Institutional Feeds
        </p>
      </div>
    </div>
  );
}
