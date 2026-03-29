'use client';
export default function SearchError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="text-center border border-[#1a1a1a] p-12 max-w-md">
        <p className="text-[#FABF2C] font-black text-xs uppercase tracking-widest mb-4">Search Error</p>
        <h2 className="text-white font-black uppercase text-2xl mb-4">Search Unavailable</h2>
        <button onClick={reset} className="bg-[#FABF2C] text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">Retry</button>
      </div>
    </main>
  );
}
