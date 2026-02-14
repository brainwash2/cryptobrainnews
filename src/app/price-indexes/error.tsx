// src/app/price-indexes/error.tsx
'use client';

export default function PriceIndexesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 font-mono text-xs tracking-[0.3em] mb-4 uppercase">
          TERMINAL ERROR
        </div>
        <p className="text-white/50 font-mono text-sm mb-6 max-w-md">
          Data feed interrupted. This may be due to API rate limiting.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-black font-black text-xs px-6 py-3 uppercase tracking-widest hover:bg-white transition-colors"
        >
          RECONNECT
        </button>
      </div>
    </main>
  );
}
