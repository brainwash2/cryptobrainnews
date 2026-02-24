import React from 'react';

export const metadata = {
  title: 'Spot Markets Dashboard | CryptoBrainNews',
  description: 'Live cryptocurrency spot market volumes, pairs, and exchange dominance.',
};

const EMBEDS = [
  {
    title: "Cryptocurrency Monthly Exchange Volume",
    src: "https://www.theblock.co/data/crypto-markets/spot/cryptocurrency-exchange-volume-monthly/embed"
  },
  {
    title: "BTC and ETH Total Exchange Volume (7DMA)",
    src: "https://www.theblock.co/data/crypto-markets/spot/btc-and-eth-total-exchange-volume-7dma/embed"
  },
  {
    title: "USD Support Exchange Volume",
    src: "https://www.theblock.co/data/crypto-markets/spot/usd-support-exchange-volume/embed"
  },
  {
    title: "Monthly Exchange Volume Market Share",
    src: "https://www.theblock.co/data/crypto-markets/spot/the-block-legitimate-index-market-share/embed"
  },
  {
    title: "Bitcoin Spot Trading Volume (in terms of BTC)",
    src: "https://www.theblock.co/data/crypto-markets/spot/the-block-legitimate-volume-index-btc-only/embed"
  },
  {
    title: "Share of Trade Volume by Pair Denomination",
    src: "https://www.theblock.co/data/crypto-markets/spot/share-of-trade-volume-by-pair-denomination/embed"
  }
];

export default function SpotMarketsPage() {
  return (
    <div className="space-y-6 max-w-full overflow-hidden font-sans">
      
      {/* Header aligned with The Block */}
      <div className="border-b border-[#27272a] pb-4 mb-6">
        <h2 className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-1">Markets</h2>
        <h1 className="text-4xl font-normal text-white">Spot</h1>
      </div>

      {/* Grid of Live Embedded Dashboards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {EMBEDS.map((embed, idx) => (
          <div 
            key={idx} 
            className="bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden relative shadow-lg group hover:border-[#FABF2C]/50 transition-colors"
          >
            {/* The actual live iframe from The Block */}
            <iframe 
              width="100%" 
              height="450" 
              frameBorder="0" 
              src={embed.src} 
              title={embed.title}
              className="w-full bg-transparent"
              loading="lazy"
            ></iframe>
          </div>
        ))}
      </div>

      {/* Data Attribution */}
      <div className="pt-8 text-center border-t border-[#1a1a1a]">
        <p className="text-[10px] text-[#555] font-mono uppercase tracking-widest">
          Market Data Provider: The Block Pro
        </p>
      </div>
    </div>
  );
}
