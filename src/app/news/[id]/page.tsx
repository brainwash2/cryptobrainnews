import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { getRealNews } from '@/lib/api';

export default async function NewsArticlePage({ params }: any) {
  const news = await getRealNews();
  const article = news.find((a: any) => a.id === params.id) || news[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header /><PriceTicker />
      <main className="container mx-auto px-4 lg:px-8 py-24 max-w-4xl">
        <span className="bg-primary text-black px-2 py-1 text-[10px] font-black uppercase mb-6 inline-block tracking-widest">{article.source}</span>
        <h1 className="text-6xl font-serif font-black mb-10 leading-tight tracking-tighter">{article.title}</h1>
        <img src={article.image} className="w-full h-[500px] object-cover mb-16 border border-gray-900" />
        <div className="prose prose-invert max-w-none text-xl leading-relaxed text-gray-400 font-light">
          {article.body.split('\n').map((p:string, i:number) => <p key={i} className="mb-8">{p}</p>)}
        </div>
      </main>
    </div>
  );
}
