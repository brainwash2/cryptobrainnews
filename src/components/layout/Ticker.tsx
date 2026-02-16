'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Ticker() {
  const { data } = useSWR('/api/prices', fetcher, { refreshInterval: 30000 });

  if (!data || !Array.isArray(data)) return <div className="h-8 bg-black border-b border-white/5" />;

  return (
    <div className="h-8 bg-black border-b border-white/5 overflow-hidden flex items-center">
      <div className="flex animate-marquee whitespace-nowrap gap-8 px-4">
        {data.slice(0, 15).map((coin: any) => (
          <div key={coin.id} className="flex items-center gap-2 font-mono text-[10px] uppercase">
            <span className="text-gray-500">{coin.symbol}</span>
            <span className="text-white">${coin.current_price.toLocaleString()}</span>
            <span className={coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
              {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} 
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
