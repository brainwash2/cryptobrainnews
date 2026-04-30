'use client';

import React, { useCallback } from 'react';
import { Download, Lock } from 'lucide-react';

interface ProChartWrapperProps {
  title: string;
  data: Record<string, unknown>[];
  filename: string;
  isPro: boolean;
  children: React.ReactNode;
}

function exportCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows: string[] = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ProChartWrapper({
  title,
  data,
  filename,
  isPro,
  children,
}: ProChartWrapperProps) {
  const handleExport = useCallback(() => {
    exportCSV(data, filename);
  }, [data, filename]);

  return (
    <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6 relative group hover:shadow-xl hover:shadow-black/10 transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#f8fafc]">{title}</h3>
        {isPro ? (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-[#a3a3a3] hover:text-[#22c55e] transition-colors duration-200"
            title="Export CSV"
          >
            <Download size={16} />
            <span className="text-xs font-medium hidden sm:inline">Export CSV</span>
          </button>
        ) : (
          <span
            className="flex items-center gap-1.5 text-[#a3a3a3] cursor-not-allowed"
            title="Upgrade to Pro"
          >
            <Lock size={16} />
            <span className="text-xs font-medium hidden sm:inline">Upgrade to Pro</span>
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
