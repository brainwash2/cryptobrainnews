'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Protocol {
  name: string;
  chain: string;
  category: string;
  tvl: number;
  change_1d: number;
  change_7d: number;
}

interface ProtocolRankingsProps {
  protocols: Protocol[];
}

const ProtocolRankings = ({ protocols }: ProtocolRankingsProps) => {
  return (
    <div className="bg-card border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-bold font-heading">Top Protocols by TVL</h2>
        <span className="text-xs font-caption text-muted-foreground italic">Powered by DefiLlama</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-secondary/50 text-xs font-caption uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Protocol</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">TVL (USD)</th>
              <th className="px-6 py-4 text-right">24h</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {protocols.map((p, index) => (
              <tr key={p.name} className="hover:bg-muted/30 transition-smooth">
                <td className="px-6 py-4 font-data text-sm text-muted-foreground">#{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="font-bold font-heading text-foreground">{p.name}</div>
                  <div className="text-[10px] font-caption text-primary uppercase">{p.chain}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-secondary text-[10px] font-bold font-caption">
                    {p.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-data font-bold">
                  ${(p.tvl / 1e9).toFixed(2)}B
                </td>
                <td className={`px-6 py-4 text-right font-data text-sm ${p.change_1d >= 0 ? 'text-success' : 'text-error'}`}>
                  {p.change_1d?.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProtocolRankings;
