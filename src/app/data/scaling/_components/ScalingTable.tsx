import React from 'react';
import type { ScalingChain } from '@/lib/scaling-data';

interface Props {
  chains:      ScalingChain[];
  emptyMsg?:   string;
  showType?:   boolean;
}

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`;
  return n > 0 ? `$${n.toLocaleString()}` : '—';
}

function PctCell({ v }: { v: number | null }) {
  if (v === null || v === undefined) return <span className="text-[#333]">—</span>;
  const pos = v >= 0;
  return (
    <span className={`font-mono font-bold tabular-nums text-xs ${pos ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
      {pos ? '+' : ''}{v.toFixed(2)}%
    </span>
  );
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  optimistic:  { label: 'Optimistic', color: '#3b82f6' },
  zk:          { label: 'ZK',         color: '#8b5cf6' },
  'l1-evm':    { label: 'L1 EVM',     color: '#FABF2C' },
  'l1-non-evm':{ label: 'L1 Non-EVM', color: '#00d672' },
  validium:    { label: 'Validium',   color: '#f97316' },
  da:          { label: 'DA Layer',   color: '#ec4899' },
};

export function ScalingTable({ chains, emptyMsg = 'Syncing data...', showType = false }: Props) {
  const totalTvl = chains.reduce((s, c) => s + c.tvl, 0);

  return (
    <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1a1a1a] bg-[#080808]">
            <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest w-8">#</th>
            <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Network</th>
            {showType && (
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Type</th>
            )}
            <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest hidden lg:table-cell">Description</th>
            <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">TVL</th>
            <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">24h %</th>
            <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">7d %</th>
            <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Protocols</th>
            <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Share</th>
          </tr>
        </thead>
        <tbody>
          {chains.length === 0 && (
            <tr>
              <td colSpan={showType ? 9 : 8} className="px-4 py-10 text-center text-[#555] font-mono text-xs uppercase tracking-widest">
                {emptyMsg}
              </td>
            </tr>
          )}
          {chains.map((c, i) => {
            const share = totalTvl > 0 ? (c.tvl / totalTvl) * 100 : 0;
            const typeInfo = TYPE_LABELS[c.type];
            return (
              <tr
                key={c.slug}
                className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                  i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                }`}
              >
                <td className="px-4 py-3 text-[#555] tabular-nums">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: c.color }}
                    />
                    <span className="font-bold text-white">{c.name}</span>
                  </div>
                </td>
                {showType && (
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 border"
                      style={{
                        color:       typeInfo?.color ?? '#888',
                        borderColor: `${typeInfo?.color ?? '#888'}40`,
                        background:  `${typeInfo?.color ?? '#888'}15`,
                      }}
                    >
                      {typeInfo?.label ?? c.type}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3 text-[#555] font-mono hidden lg:table-cell max-w-xs truncate">
                  {c.description}
                </td>
                <td className="px-4 py-3 text-right font-mono font-black tabular-nums" style={{ color: c.color }}>
                  {fmtUsd(c.tvl)}
                </td>
                <td className="px-4 py-3 text-right"><PctCell v={c.change1d} /></td>
                <td className="px-4 py-3 text-right"><PctCell v={c.change7d} /></td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                  {c.protocols ?? '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[#555]">
                  {share.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ScalingTable;
