import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { getRealNews } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';

export default async function NewsArticlePage({ params }: any) {
  const { id } = await params;
  const news = await getRealNews();
  const article = news.find((a: any) => String(a.id) === String(id)) || news[0];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <Header />
      
      {/* FIXED: Using Global CSS Animation instead of styled-jsx */}
      <div className="fixed top-16 left-0 w-full h-1 bg-gray-900 z-[1001]">
        <div className="h-full bg-primary animate-reading-bar"></div>
      </div>

      <PriceTicker />

      <main className="container mx-auto px-4 lg:px-8 pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-primary text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                {article.source}
              </span>
              <span className="text-gray-500 font-mono text-[10px] uppercase">
                {new Date(article.published_on * 1000).toLocaleDateString()} • 5 MIN READ
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-black mb-8 leading-[1.1] tracking-tighter">
              {article.title}
            </h1>

            <div className="bg-[#111] border-l-4 border-primary p-6 mb-10 shadow-xl">
              <h4 className="text-primary font-black text-xs uppercase mb-3 tracking-widest flex items-center gap-2">
                <Icon name="LightBulbIcon" size={16} /> Quick Take
              </h4>
              <ul className="space-y-3 text-sm text-gray-300 font-medium list-disc list-inside">
                <li>Major volatility detected across institutional liquidity pools.</li>
                <li>Strategic shift in market sentiment confirmed via on-chain flow.</li>
                <li>Institutional participation reaching multi-year highs in this sector.</li>
              </ul>
            </div>

            <div className="relative w-full h-[450px] mb-12 border border-white/10 group overflow-hidden">
               <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="text-xl leading-relaxed text-gray-300 space-y-8 font-light">
                {article.body.split('\n').map((p: string, i: number) => (
                  <p key={i} className={i === 0 ? "first-letter:text-7xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left" : ""}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-32">
              <div className="bg-[#0a0a0a] border border-gray-900 p-6">
                <h3 className="text-white font-black text-xs uppercase mb-6 tracking-widest border-b border-gray-800 pb-4">
                  Trending Now
                </h3>
                <div className="space-y-6">
                  {news.slice(0, 4).map((n: any, i: number) => (
                    <a href={`/news/${n.id}`} key={i} className="flex gap-4 group">
                      <span className="text-2xl font-serif font-black text-gray-800 group-hover:text-primary transition-colors">
                        0{i+1}
                      </span>
                      <p className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors leading-snug">
                        {n.title}
                      </p>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-6 bg-primary text-black text-center">
                 <h4 className="font-black text-sm uppercase mb-2">Alpha Member Access</h4>
                 <p className="text-[10px] font-bold mb-4 uppercase tracking-tighter">Get deep on-chain metrics for this story</p>
                 <button className="bg-black text-white text-[10px] font-black px-4 py-2 w-full">UPGRADE TO PRO</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
