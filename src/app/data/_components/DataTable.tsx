'use client';
import React from 'react';

export interface DataColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

export interface DataTableProps {
  columns: DataColumn[];
  data: Record<string, any>[];
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps) {
  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-pulse">
          <div className="h-3 w-48 bg-[#1a1a1a] rounded mb-2" />
          <div className="h-3 w-64 bg-[#1a1a1a] rounded" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-[#1a1a1a]">
        <p className="text-[#333] font-mono text-xs uppercase tracking-widest">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#1a1a1a]">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align || 'left' }}
                className="px-4 py-3 font-black text-[#555] uppercase tracking-widest text-left"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-[#0a0a0a] hover:bg-[#0a0a0a] transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }} className="px-4 py-4">
                  <span className="text-[#aaa]">
                    {col.format ? col.format(row[col.key]) : row[col.key] ?? '—'}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
