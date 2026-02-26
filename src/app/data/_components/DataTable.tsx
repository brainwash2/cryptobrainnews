'use client';
import React from 'react';

export interface DataColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
  align?: 'left' | 'right' | 'center';
  width?: string;                    // ← restored for spot page
}

export interface DataTableProps {
  columns: DataColumn[];
  data: Record<string, any>[];
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
            {columns.map((col) => (
              <th 
                key={col.key} 
                style={{ width: col.width }}
                className="px-6 py-4 text-left font-black text-[#555] uppercase tracking-widest"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-[#111] hover:bg-[#111]">
              {columns.map((col) => (
                <td 
                  key={col.key} 
                  className={`px-6 py-4 font-mono text-[#aaa] ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.format ? col.format(row[col.key]) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
