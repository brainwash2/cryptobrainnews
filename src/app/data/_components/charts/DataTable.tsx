'use client';

import React from 'react';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, any>[];
  maxRows?: number;
}

export default function DataTable({ columns, rows, maxRows = 50 }: DataTableProps) {
  const displayRows = rows.slice(0, maxRows);

  if (displayRows.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-12 text-center text-[#333] font-mono text-xs uppercase">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#080808]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-[10px] font-black text-[#555] uppercase tracking-widest ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={i} className="border-b border-[#111] hover:bg-white/[0.02] transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-3 text-sm font-mono ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.key === 'name' || col.key === 'protocol' ? 'font-bold text-white' : 'text-[#888]'}`}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
