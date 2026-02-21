import React from 'react';

export const metadata = { title: 'Protocol Revenue | CryptoBrainNews' };

interface ProtocolRevenue {
  protocol: string;
  revenue_7d: number;
  revenue_30d: number;
}

// NOTE: Add your protocol revenue API integration here
async function getProtocolRevenue(): Promise<ProtocolRevenue[]> {
  try {
    // TODO: Replace with your actual API call
    // Example from Dune Analytics:
    // const res = await fetch('https://api.dune.com/api/v1/query/{QUERY_ID}/results', {
    //   headers: { 'X-DUNE-API-KEY': process.env.DUNE_API_KEY }
    // });
    // return res.json();
    return [];
  } catch (error) {
    console.error('Failed to fetch protocol revenue:', error);
    return [];
  }
}

export default async function ProtocolRevenuePage() {
  const data = await getProtocolRevenue();

  const formatUsd = (n: number): string => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toLocaleString()}`;
  };

  const formattedRows = data.map((row) => ({
    protocol: row.protocol,
    revenue_7d: formatUsd(row.revenue_7d),
    revenue_30d: formatUsd(row.revenue_30d),
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Protocols Tracked</p>
          <p className="text-2xl font-black text-[#FABF2C]">{data.length}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Top Protocol</p>
          <p className="text-2xl font-black text-[#FABF2C]">{data[0]?.protocol || '—'}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2">Source</p>
          <p className="text-2xl font-black text-[#FABF2C]">Dune Analytics</p>
        </div>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/50 text-[#555] uppercase tracking-wider font-mono border-b border-[#1a1a1a]">
              <tr>
                <th className="px-6 py-3">Protocol</th>
                <th className="px-6 py-3 text-right">7d Revenue</th>
                <th className="px-6 py-3 text-right">30d Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {formattedRows.map((row, i) => (
                <tr key={row.protocol} className={`hover:bg-primary/5 transition-colors ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0b0b0b]'}`}>
                  <td className="px-6 py-3 font-semibold text-white">{row.protocol}</td>
                  <td className="px-6 py-3 text-right font-bold text-[#FABF2C]">{row.revenue_7d}</td>
                  <td className="px-6 py-3 text-right font-bold text-[#FABF2C]">{row.revenue_30d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.length === 0 && (
        <div className="py-20 text-center border border-dashed border-[#1a1a1a]">
          <p className="text-[#555] font-mono text-xs uppercase">No protocol revenue data available • Add your Dune API integration</p>
        </div>
      )}
    </div>
  );
}
