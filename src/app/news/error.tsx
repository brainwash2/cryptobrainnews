'use client';
export default function NewsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4 font-sans">
      <div className="text-center border border-[#1a1a1a] p-12 max-w-md">
        <p className="text-[#FABF2C] font-black text-xs uppercase tracking-widest mb-4">Feed Error</p>
        <h2 className="text-white font-black uppercase text-2xl mb-4">Wire Interrupted</h2>
        <p className="text-[#555] font-mono text-xs mb-8">{error.message || 'Failed to load articles.'}</p>
        <button onClick={reset}
          className="bg-[#FABF2C] text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">
          Reconnect
        </button>
      </div>
    </main>
  );
}
