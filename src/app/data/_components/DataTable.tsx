'use client';
import React from 'react';

export interface DataColumn { 
  key: string; 
  label: string; 
  format?: (v: any) => string; 
  align?: 'left' | 'right' | 'center'; 
  width?: string; 
}

export interface DataTableProps { 
  columns: DataColumn[]; 
  data: Record<string, any>[]; 
  emptyMessage?: string; // This fixes the error in Stablecoins/Chains!
}

export function DataTable({ columns, data, emptyMessage = 'No data available' }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-[#555] font-mono text-xs uppercase tracking-widest animate-pulse">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#1a1a1a] bg-[#050505]">
            {columns.map(col => (
              <th 
                key={col.key} 
                style={{ width: col.width, textAlign: col.align || 'left' }}
                className="px-6 py-4 font-black text-[#555] uppercase tracking-widest whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-[#111] hover:bg-[#18181b] transition-colors">
              {columns.map(col => (
                <td 
                  key={col.key} 
                  style={{ textAlign: col.align || 'left' }}
                  className="px-6 py-4 font-mono text-[#ccc] whitespace-nowrap"
                >
                  {col.format ? col.format(row[col.key]) : row[col.key] || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
