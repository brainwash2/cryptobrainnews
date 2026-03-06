export const dynamic = 'force-dynamic';

import React from 'react';
import { getAllArticles } from '@/lib/articles';
import CointelegraphCard from '@/components/news/CointelegraphCard';

export const metadata = { title: 'Crypto News | CryptoBrainNews' };

export default async function NewsPage() {
  const articles = await getAllArticles();
  
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 border-b border-[#1a1a1a] pb-6">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
            Latest <span className="text-[#FABF2C]">Intelligence</span>
          </h1>
          <p className="text-[#888] font-mono text-xs uppercase tracking-widest">
            Real-time market updates, alpha calls, and institutional analysis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <CointelegraphCard key={article.id} article={article} />
          ))}
        </div>
        
        {articles.length === 0 && (
          <div className="py-32 text-center border border-dashed border-[#1a1a1a]">
            <p className="text-[#555] font-mono text-xs uppercase tracking-widest">Syncing with global wire...</p>
          </div>
        )}
      </div>
    </main>
  );
}
