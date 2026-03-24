export const revalidate = 60;

import React from 'react';
import Link from 'next/link';
import { getAllArticles } from '@/lib/articles';
import { NEWS_CATEGORIES } from '@/lib/news';
import CointelegraphCard from '@/components/news/CointelegraphCard';
import NewsTickerBar from '@/components/news/NewsTickerBar';

export const metadata = { title: 'Crypto News | CryptoBrainNews' };

export default async function NewsPage() {
  const articles = await getAllArticles();

  return (
    <main className="min-h-screen bg-[#050505] font-sans">
      {/* Live ticker */}
      <NewsTickerBar />

      <div className="py-10 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* Header */}
          <div className="mb-8 border-b border-[#1a1a1a] pb-6">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
              Latest <span className="text-[#FABF2C]">Intelligence</span>
            </h1>
            <p className="text-[#888] font-mono text-xs uppercase tracking-widest">
              Real-time market updates, alpha calls, and institutional analysis.
            </p>
          </div>

          {/* Category pill nav */}
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/news"
              className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-[#FABF2C] text-black"
            >
              All
            </Link>
            {NEWS_CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/news/category/${cat.slug}`}
                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border border-[#333] text-[#888] hover:border-[#FABF2C] hover:text-[#FABF2C] transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Article grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article) => (
              <CointelegraphCard key={article.id} article={article} />
            ))}
          </div>

          {articles.length === 0 && (
            <div className="py-32 text-center border border-dashed border-[#1a1a1a]">
              <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
                Syncing with global wire…
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
