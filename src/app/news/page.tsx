import React from 'react';
import { getAllArticles } from '@/lib/articles';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export const metadata = {
  title: 'News Hub | CryptoBrainNews',
  description: 'Global crypto intelligence wire and proprietary alpha calls.',
};

export const dynamic = 'force-dynamic';

export default async function NewsHubPage() {
  const articles = await getAllArticles();

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12 border-b border-[#1a1a1a] pb-8">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Intelligence <span className="text-[#FABF2C]">Hub</span>
          </h1>
          <p className="text-[#555] font-mono text-xs uppercase tracking-[0.3em]">
            Real-time Institutional Feed • {articles.length} Reports Active
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={article.url.startsWith('http') ? article.url : `/news/${article.id}`}
              target={article.url.startsWith('http') ? '_blank' : '_self'}
              className="group block"
            >
              <div className="relative aspect-video mb-5 overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a]">
                <AppImage
                  src={article.image}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur px-2 py-1 border border-white/10">
                  <span className="text-[9px] font-black text-[#FABF2C] uppercase tracking-widest">
                    {article.categories[0] || 'WIRE'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-[#555]">
                  <span>{article.source}</span>
                  <span>{new Date(article.published_on * 1000).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white uppercase leading-snug group-hover:text-[#FABF2C] transition-colors line-clamp-3">
                  {article.title}
                </h3>
                <p className="text-xs text-[#888] line-clamp-2 font-serif leading-relaxed">
                  {article.body.slice(0, 150)}...
                </p>
              </div>
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="py-32 text-center border border-dashed border-[#1a1a1a]">
            <p className="text-[#333] font-mono text-xs uppercase tracking-widest animate-pulse">
              Syncing Global Wire...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
