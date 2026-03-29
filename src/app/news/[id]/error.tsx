'use client';
import Link from 'next/link';
export default function ArticleError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="text-center border border-[#1a1a1a] p-12 max-w-md">
        <p className="text-[#FABF2C] font-black text-xs uppercase tracking-widest mb-4">Article Error</p>
        <h2 className="text-white font-black uppercase text-2xl mb-4">Article Unavailable</h2>
        <p className="text-[#555] font-mono text-xs mb-8">{error.message || 'Could not load this article.'}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="bg-[#FABF2C] text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">Retry</button>
          <Link href="/news" className="bg-[#111] border border-[#333] text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:border-[#FABF2C] transition-colors">Back to News</Link>
        </div>
      </div>
    </main>
  );
}
