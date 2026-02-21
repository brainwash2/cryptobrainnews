'use client';
export default function MarketsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="py-20 text-center border border-dashed border-red-500/20">
          <p className="text-red-500 font-mono text-xs uppercase tracking-widest mb-4">Error Loading Data</p>
          <button
            onClick={reset}
            className="bg-[#FABF2C] text-black font-black text-xs px-6 py-2 uppercase tracking-widest hover:bg-white transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    </main>
  );
}
