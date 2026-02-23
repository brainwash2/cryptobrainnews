import React from 'react';
import { getAllArticles } from '@/lib/articles';
import CointelegraphCard from '@/components/news/CointelegraphCard';

export const metadata = { title: 'News | CryptoBrainNews' };
export const dynamic = 'force-dynamic';

export default async function NewsHubPage() {
  const articles = await getAllArticles();

  return (
    <main className="min-h-screen bg-[#050505] font-sans pt-6">
      <div className="container mx-auto px-4 max-w-[1200px]">
        
        {/* Mock Tabs */}
        <div className="flex border-b border-[#222] mb-6">
          <button className="px-6 py-3 border-b-2 border-[#FABF2C] text-[#FABF2C] font-bold text-lg bg-[#FABF2C]/5">
            Editor's choice
          </button>
          <button className="px-6 py-3 text-gray-500 font-bold text-lg hover:text-white">
            Hot stories
          </button>
        </div>

        {/* Cointelegraph Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          {articles.map((article) => (
            <CointelegraphCard key={article.id} article={article} />
          ))}
        </div>

      </div>
    </main>
  );
}
