import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { getRealNews } from '@/lib/api';

export default async function NewsArticlePage({ params }: any) {
  const { id } = await params;
  const news = await getRealNews();
  // Find the article by ID
  const article = news.find((a: any) => String(a.id) === String(id)) || news[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <PriceTicker />
      <main className="container mx-auto px-4 lg:px-8 py-24 max-w-4xl">
        <div className="mb-8">
          <span className="bg-primary text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            {article.source}
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-black mb-10 leading-tight tracking-tighter text-white">
          {article.title}
        </h1>
        <div className="relative w-full h-[500px] mb-12 border border-gray-800">
           <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>
        <div className="prose prose-invert max-w-none">
          <p className="text-xl leading-relaxed text-gray-300 first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
            {article.body}
          </p>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-900 text-gray-500 font-mono text-xs uppercase">
          Published via CryptoBrain Intelligence Terminal
        </div>
      </main>
    </div>
  );
}
