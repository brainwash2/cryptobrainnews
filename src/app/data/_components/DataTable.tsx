import React from 'react';

export interface DataColumn<T = any> { 
  key: Extract<keyof T, string>; 
  label: string; 
  format?: (v: any, row: T) => React.ReactNode; 
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
      <div className="py-32 flex flex-col items-center justify-center text-center border-t border-[#1a1a1a] bg-[#050505]">
        <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-[#FABF2C] rounded-full animate-spin mb-6" />
        <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
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
            <tr key={i} className="transition-colors group even:bg-[#080808] odd:bg-[#050505] hover:bg-[#111113]">
              {columns.map(col => (
                <td 
                  key={String(col.key)} 
                  style={{ textAlign: col.align || 'left' }}
                  className="px-6 py-4 font-mono text-[#a1a1aa] whitespace-nowrap group-hover:text-white transition-colors"
                >
                  {col.format ? col.format(row[col.key], row) : row[col.key] || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
