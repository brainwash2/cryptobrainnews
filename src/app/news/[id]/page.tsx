import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { getRealNews } from '@/lib/api';

export default async function NewsArticlePage({ params }: any) {
  const { id } = await params;
  // We fetch all news and find the one that matches the ID
  const news = await getRealNews();
  const article = news.find((a: any) => String(a.id) === String(id)) || news[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <PriceTicker />
      <main className="container mx-auto px-4 lg:px-8 py-24 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <span className="bg-primary text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            {article.source}
          </span>
          <span className="text-gray-500 font-mono text-[10px]">
            ID: {article.id}
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-serif font-black mb-10 leading-[1.1] tracking-tighter text-white">
          {article.title}
        </h1>

        <div className="relative w-full h-[500px] mb-12 border border-white/10">
           <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-2xl leading-relaxed text-gray-300 font-light mb-8 italic border-l-4 border-primary pl-6 py-2">
            The following intelligence report was synthesized from our internal liquidity scanners and global news partners.
          </p>
          <div className="text-xl leading-relaxed text-gray-400 space-y-6">
            {article.body.split('\n').map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center text-center">
            <div className="bg-primary text-black font-black p-2 text-xl mb-4">CB</div>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.5em]">
              End of Dispatch • CryptoBrain Intelligence Hub
            </p>
        </div>
      </main>
    </div>
  );
}
