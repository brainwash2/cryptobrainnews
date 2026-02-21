'use client';
import useSWR from 'swr';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,ripple,cardano,avalanche-2,chainlink,polkadot,uniswap&order=market_cap_desc&per_page=10&page=1';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Ticker() {
  const { data } = useSWR(COINGECKO_URL, fetcher, { refreshInterval: 60000 });

  if (!data || !Array.isArray(data)) {
    return <div className="h-8 bg-black border-b border-white/5" />;
  }

  const items = [...data, ...data]; // duplicate for seamless loop

  return (
    <div className="h-8 bg-black border-b border-white/5 overflow-hidden flex items-center">
      <div className="flex animate-marquee whitespace-nowrap gap-8 px-4">
        {items.map((coin: any, i: number) => (
          <div key={`${coin.id}-${i}`} className="flex items-center gap-2 font-mono text-[10px] uppercase">
            <span className="text-gray-500">{coin.symbol}</span>
            <span className="text-white">${coin.current_price?.toLocaleString() ?? '—'}</span>
            <span className={coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
              {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'}{Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
