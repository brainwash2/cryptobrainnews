import React from 'react';

interface Column {
  key:     string;
  label:   string;
  align?:  'left' | 'right';
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface Props {
  columns:      Column[];
  data:         Record<string, unknown>[];
  emptyMessage?: string;
  source?:      string;
}

function PctBadge({ v }: { v: number | null }) {
  if (v === null || v === undefined) return <span className="text-[#333]">—</span>;
  const pos = v >= 0;
  return (
    <span className={`font-mono font-bold tabular-nums text-xs ${pos ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
      {pos ? '+' : ''}{v.toFixed(2)}%
    </span>
  );
}

export function fmtUsd(n: unknown): string {
  const v = Number(n ?? 0);
  if (!v) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3)  return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export { PctBadge };

export function DefiTable({ columns, data, emptyMessage = 'Syncing data...', source }: Props) {
  return (
    <div>
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#080808]">
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest w-8">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-[#555] font-mono text-xs uppercase tracking-widest">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {data.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                  i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                }`}
              >
                <td className="px-4 py-3 text-[#555] tabular-nums">{i + 1}</td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {source && (
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">{source}</p>
      )}
    </div>
  );
}
