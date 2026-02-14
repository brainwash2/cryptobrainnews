// src/app/de-fi-analytics/error.tsx
'use client';

export default function DeFiError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="text-red-500 font-mono text-xs tracking-[0.3em] mb-4 uppercase">
          DEFI DATA FEED INTERRUPTED
        </div>
        <button
          onClick={reset}
          className="bg-primary text-black font-black text-xs px-6 py-3 uppercase tracking-widest hover:bg-white transition-colors"
        >
          RETRY CONNECTION
        </button>
      </div>
    </div>
  );
}
