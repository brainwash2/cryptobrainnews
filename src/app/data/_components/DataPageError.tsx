'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function DataPageError({ error, reset, title = 'Data Error' }: Props) {
  return (
    <div className="rounded-3xl bg-[#161616] p-12 flex flex-col items-center justify-center text-center">
      <AlertTriangle className="text-[#ef4444] mb-4" size={32} />
      <h2 className="text-lg font-semibold text-[#f8fafc] mb-2">
        {title === 'Data Error' ? 'Unable to load data' : title}
      </h2>
      <p className="text-sm text-[#a3a3a3] mb-2 max-w-sm">
        {error.message ?? 'An unexpected error occurred while loading this data.'}
      </p>
      {error.digest && (
        <p className="text-xs font-mono text-[#52525b] mb-6">Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="flex items-center gap-2 border border-[#27272a] text-[#a3a3a3] hover:text-[#f8fafc] hover:border-[#22c55e] px-6 py-2 text-sm font-medium transition-colors duration-200 rounded-2xl"
      >
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );
}

export default DataPageError;