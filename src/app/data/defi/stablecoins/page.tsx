import React from 'react';

export const metadata = {
  title: 'Stablecoin Intelligence | CryptoBrainNews',
  description: 'Aggregate stablecoin market cap and liquidity flows.',
};

export const revalidate = 300;

interface StablecoinData {
  date: Date;
  mcap: number;
}

// NOTE: Add your stablecoin data API integration here
async function getStablecoinData(): Promise<StablecoinData[]> {
  try {
    // TODO: Replace with your actual API call
    // Example: const res = await fetch('https://api.defillama.com/stablecoins');
    // const data = await res.json();
    // return data.map((d: any) => ({ date: new Date(d.date * 1000), mcap: d.total }));
    return [];
  } catch (error) {
    console.error('Failed to fetch stablecoin data:', error);
    return [];
  }
}

export default async function StablecoinsPage() {
  const data = await getStablecoinData();
  const currentMcap = data.length > 0 ? data[data.length - 1]?.mcap || 0 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter mb-1">
          Stablecoin <span className="text-[#FABF2C]">Intelligence</span>
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mt-1">Aggregate Market Cap & Liquidity Flows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Total Circulating</p>
          <p className="text-3xl font-black text-[#FABF2C]">${(currentMcap / 1e9).toFixed(2)}B</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Dominance</p>
          <p className="text-3xl font-black text-[#FABF2C]">72.4%</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Data Source</p>
          <p className="text-3xl font-black text-[#FABF2C]">DefiLlama</p>
        </div>
      </div>

      <div className="bg-card border border-border p-8 text-center">
        {data.length === 0 ? (
          <p className="text-[#555] font-mono text-xs uppercase">
            💾 Chart Visualization Module Loading... Add your API to src/lib/api.ts
          </p>
        ) : (
          <p className="text-[#333] font-mono text-xs uppercase italic">Chart data available</p>
        )}
      </div>
    </div>
  );
}
