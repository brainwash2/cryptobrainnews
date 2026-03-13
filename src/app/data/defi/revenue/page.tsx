import React from 'react';
import { getProtocolFees } from '@/lib/api';
import { DataHeader } from '../../_components/DataHeader';
import { DataTable } from '../../_components/DataTable';

export const metadata = { title: 'Protocol Revenue & Fees | CryptoBrainNews' };
export const revalidate = 3600;

export default async function ProtocolRevenuePage() {
  const data = await getProtocolFees();

  const formatUsd = (v: unknown): string => {
    const n = Number(v);
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const total24hFees = data.reduce((sum, d) => sum + d.dailyFees, 0);

  return (
    <div className="space-y-8 pb-20">
      <DataHeader 
        title="Protocol Revenue & Fees" 
        description="Daily fee generation and revenue capture across blockchains and dApps." 
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Global 24h Fees</p>
          <p className="text-3xl font-black text-[#FABF2C]">{formatUsd(total24hFees)}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Protocols Tracked</p>
          <p className="text-3xl font-black text-white">{data.length}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Top Protocol (24H)</p>
          <p className="text-3xl font-black text-white truncate">{data[0]?.name || '—'}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <p className="text-[9px] text-[#555] uppercase font-mono mb-2 tracking-widest">Data Source</p>
          <p className="text-3xl font-black text-[#00d672]">DefiLlama</p>
        </div>
      </div>

      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <DataTable
          columns={[
            { key: 'name', label: 'Protocol' },
            { key: 'category', label: 'Category' },
            { key: 'dailyFees', label: '24h Fees', format: formatUsd, align: 'right' },
            { key: 'dailyRevenue', label: '24h Revenue', format: formatUsd, align: 'right' },
            { key: 'total7d', label: '7d Total Fees', format: formatUsd, align: 'right' }
          ]}
          data={data}
          emptyMessage="Syncing revenue data from DefiLlama..."
        />
      </div>
    </div>
  );
}
