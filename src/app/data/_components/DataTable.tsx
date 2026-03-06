import React from 'react';

export interface DataColumn<T = any> { 
  key: Extract<keyof T, string>; 
  label: string; 
  format?: (v: any) => React.ReactNode; 
  align?: 'left' | 'right' | 'center'; 
  width?: string; 
}

export interface DataTableProps<T> { 
  columns: DataColumn<T>[]; 
  data: T[]; 
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({ columns, data, emptyMessage = 'No data available' }: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="py-24 text-center border-t border-[#1a1a1a]">
        <p className="text-[#555] font-mono text-xs uppercase tracking-widest animate-pulse">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[800px] custom-scrollbar">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 z-10 bg-[#050505] shadow-[0_1px_0_0_#1a1a1a]">
          <tr>
            {columns.map(col => (
              <th 
                key={String(col.key)} 
                style={{ width: col.width, textAlign: col.align || 'left' }}
                className="px-6 py-4 font-black text-[#555] uppercase tracking-widest whitespace-nowrap bg-[#050505]"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#111]">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-[#111113] transition-colors group bg-[#0a0a0a] even:bg-[#050505]">
              {columns.map(col => (
                <td 
                  key={String(col.key)} 
                  style={{ textAlign: col.align || 'left' }}
                  className="px-6 py-4 font-mono text-[#a1a1aa] whitespace-nowrap group-hover:text-white transition-colors"
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
