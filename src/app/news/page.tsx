export const revalidate = 60;

import React from 'react';
import Link from 'next/link';
import { getAllArticles } from '@/lib/articles';
import { NEWS_CATEGORIES } from '@/lib/news';
import CointelegraphCard from '@/components/news/CointelegraphCard';
import NewsTickerBar from '@/components/news/NewsTickerBar';
import AppImage from '@/components/ui/AppImage';
import NewsletterCTA from '@/components/monetization/NewsletterCTA';

export const metadata = { title: 'Crypto News | CryptoBrainNews' };

export default async function NewsPage() {
  const articles = await getAllArticles();

  const hero = articles[0];
  const firstRow = articles.slice(1, 4);
  const rest = articles.slice(4);

  return (
    <main className="min-h-screen bg-[#050505] font-sans">
      <NewsTickerBar />

      <div className="py-10 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">

          <div className="mb-8 border-b border-[#1a1a1a] pb-6">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
              Latest <span className="text-[#FABF2C]">Intelligence</span>
            </h1>
            <p className="text-[#888] font-mono text-xs uppercase tracking-widest">
              Real-time market updates, alpha calls, and institutional analysis.
            </p>
          </div>

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

          {hero && (
            <div className="mb-12">
              <Link
                href={(hero.url ?? '').startsWith('http') ? hero.url : `/news/${hero.id}`}
                className="group block border border-[#1a1a1a] overflow-hidden relative"
                {...((hero.url ?? '').startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <div className="relative w-full aspect-[21/9] bg-[#0a0a0a]">
                  <AppImage
                    src={hero.image}
                    alt={hero.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <span className="inline-block bg-[#FABF2C] text-black text-[9px] font-black px-2 py-0.5 uppercase tracking-widest mb-3">
                      {hero.categories[0] || 'Market News'}
                    </span>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-[#FABF2C] transition-colors max-w-4xl">
                      {hero.title}
                    </h2>
                    <p className="text-[#aaa] text-sm mt-3 max-w-2xl line-clamp-2 font-mono leading-relaxed">
                      {hero.body.slice(0, 200)}
                    </p>
                    <div className="flex items-center gap-3 mt-4 text-[10px] font-mono text-[#555] uppercase tracking-widest">
                      <span>{hero.author_name || hero.source}</span>
                      <span className="text-[#333]">·</span>
                      <span>{Math.max(1, Math.ceil(hero.body.split(/\s+/).length / 200))} min read</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {firstRow.map(article => (
              <CointelegraphCard key={article.id} article={article} />
            ))}
          </div>

          {articles.length > 1 && (
            <div className="mb-10">
              <NewsletterCTA variant="inline" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rest.map(article => (
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
