import React from 'react';
import { getETHActiveAddresses, getETHDailyTransactions } from '@/lib/dune';

export const metadata = {
  title: 'Ethereum On-Chain | CryptoBrainNews',
  description: 'Ethereum active addresses and daily transactions.',
};

export const revalidate = 300;

async function getETHData() {
  const [addresses, transactions] = await Promise.all([
    getETHActiveAddresses(90),
    getETHDailyTransactions(90),
  ]);

  return { addresses, transactions };
}

export default async function EthereumPage() {
  const { addresses, transactions } = await getETHData();

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Ethereum On-Chain
          </h1>
          <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em]">
            Active Addresses & Daily Transactions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Addresses Card */}
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6">
              Active Addresses (90d)
            </h3>
            {addresses.length === 0 ? (
              <p className="text-[#555] text-xs">No data available</p>
            ) : (
              <div className="space-y-3">
                {addresses.slice(0, 10).map((row: any, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-[#111] pb-2">
                    <span className="text-[11px] font-mono text-[#555]">
                      {typeof row.day === 'string' ? row.day.slice(0, 10) : '—'}
                    </span>
                    <span className="text-[11px] font-black text-[#FABF2C]">
                      {row.active_addresses?.toLocaleString() || '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Transactions Card */}
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6">
              Daily Transactions (90d)
            </h3>
            {transactions.length === 0 ? (
              <p className="text-[#555] text-xs">No data available</p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((row: any, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-[#111] pb-2">
                    <span className="text-[11px] font-mono text-[#555]">
                      {typeof row.day === 'string' ? row.day.slice(0, 10) : '—'}
                    </span>
                    <span className="text-[11px] font-black text-[#FABF2C]">
                      {row.tx_count?.toLocaleString() || '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Data Summary */}
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-4">
            Summary Stats
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-[9px] text-[#555] uppercase font-mono mb-1">Avg Active Addresses</p>
              <p className="text-lg font-black text-[#FABF2C]">
                {addresses.length > 0
                  ? (
                      addresses.reduce((sum: number, a: any) => sum + (a.active_addresses || 0), 0) /
                      addresses.length
                    )
                      .toLocaleString('en-US', { maximumFractionDigits: 0 })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-[#555] uppercase font-mono mb-1">Total Txs (90d)</p>
              <p className="text-lg font-black text-[#FABF2C]">
                {transactions.length > 0
                  ? transactions
                      .reduce((sum: number, t: any) => sum + (t.tx_count || 0), 0)
                      .toLocaleString('en-US', { notation: 'compact' })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-[#555] uppercase font-mono mb-1">Chain</p>
              <p className="text-lg font-black text-[#FABF2C]">Ethereum</p>
            </div>
            <div>
              <p className="text-[9px] text-[#555] uppercase font-mono mb-1">Status</p>
              <p className="text-lg font-black text-green-500">Live</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
