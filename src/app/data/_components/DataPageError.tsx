'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  error:  Error & { digest?: string };
  reset:  () => void;
  title?: string;
}

export function DataPageError({ error, reset, title = 'Data Error' }: Props) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-[#ff4757]/20 bg-[#0a0a0a]">
      <AlertTriangle className="text-[#ff4757] mb-4" size={32} />
      <h2 className="text-lg font-black uppercase tracking-tighter text-white mb-2">{title}</h2>
      <p className="text-[10px] font-mono text-[#555] mb-2 max-w-sm">
        {error.message ?? 'An unexpected error occurred while loading this data.'}
      </p>
      {error.digest && (
        <p className="text-[9px] font-mono text-[#333] mb-6">Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="flex items-center gap-2 bg-[#0a0a0a] border border-[#1a1a1a] text-[#888] hover:text-white hover:border-[#FABF2C] px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all"
      >
        <RefreshCw size={12} /> Retry
      </button>
    </div>
  );
}

export default DataPageError;
