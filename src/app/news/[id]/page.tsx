import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { getRealNews } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default async function NewsArticlePage({ params }: any) {
  const { id } = await params;
  const news = await getRealNews();
  const article = news.find((a: any) => String(a.id) === String(id)) || news[0];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-black">
      <Header />
      <PriceTicker />

      <main className="container mx-auto px-4 lg:px-8 pt-12 pb-24">
        {/* ARTICLE HEADER (Full Width) */}
        <div className="max-w-5xl mx-auto mb-12 text-center">
          <span className="bg-primary text-black px-3 py-1 text-xs font-black uppercase tracking-widest mb-4 inline-block">
            {article.source}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black mb-6 leading-tight tracking-tighter text-black">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-500 text-sm font-bold uppercase tracking-wide">
            <span>{new Date(article.published_on * 1000).toLocaleDateString()}</span>
            <span>•</span>
            <span>4 Min Read</span>
            <span>•</span>
            <span className="text-primary">CryptoBrain Alpha</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          
          {/* LEFT: STICKY SOCIALS (1 Col) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32 flex flex-col gap-4 items-center">
              {['Twitter', 'Facebook', 'Linkedin', 'Link'].map((social) => (
                <button key={social} className="w-10 h-10 border border-gray-200 hover:bg-black hover:text-primary transition-colors flex items-center justify-center rounded-full text-gray-400">
                  <Icon name="ShareIcon" size={16} />
                </button>
              ))}
              <div className="h-12 w-[1px] bg-gray-200 my-2"></div>
              <span className="vertical-text font-black text-xs text-gray-300 tracking-[0.3em] rotate-180" style={{ writingMode: 'vertical-rl' }}>SHARE THIS</span>
            </div>
          </aside>

          {/* CENTER: CONTENT (7 Cols) */}
          <article className="lg:col-span-8">
            {/* Main Image */}
            <div className="relative w-full h-[400px] md:h-[500px] mb-12 shadow-2xl">
               <img src={article.image} alt={article.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
               <div className="absolute bottom-0 left-0 bg-black text-white text-xs px-4 py-2 font-mono opacity-80">
                 IMG: {article.source.toUpperCase()} VIA GETTY IMAGES
               </div>
            </div>

            {/* Content Body */}
            <div className="prose prose-lg prose-headings:font-serif prose-headings:font-black max-w-none text-gray-800">
              <p className="lead text-2xl font-serif italic text-gray-500 mb-8 border-l-4 border-primary pl-6">
                "Institutional adoption is no longer a narrative; it is a mathematical certainty observable on-chain."
              </p>
              
              <div className="space-y-6 text-lg leading-relaxed">
                {article.body.split('\n').map((p: string, i: number) => (
                  <p key={i} className={i===0 ? "first-letter:text-6xl first-letter:font-black first-letter:text-black first-letter:mr-3 first-letter:float-left" : ""}>
                    {p}
                  </p>
                ))}
              </div>

              {/* EMBEDDED NEWSLETTER (Cointelegraph Style) */}
              <div className="my-12 p-8 bg-black text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[50px] opacity-20"></div>
                <h3 className="text-2xl font-serif font-black mb-2 relative z-10">Don't Miss the Alpha</h3>
                <p className="text-gray-400 mb-6 relative z-10">Get the daily institutional briefing delivered to your inbox.</p>
                <div className="flex gap-2 max-w-md mx-auto relative z-10">
                  <input type="email" placeholder="Email Address" className="bg-white/10 border border-white/20 text-white px-4 py-2 w-full outline-none focus:border-primary" />
                  <button className="bg-primary text-black font-bold px-6 py-2 hover:bg-white transition-colors">SUBSCRIBE</button>
                </div>
              </div>
            </div>
          </article>

          {/* RIGHT: SIDEBAR (3 Cols) */}
          <aside className="lg:col-span-3 space-y-12">
            
            {/* Editor's Choice */}
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest border-b-2 border-black pb-2 mb-6">Editor's Choice</h4>
              <div className="space-y-6">
                {[1,2,3].map((i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="h-32 w-full bg-gray-100 mb-2 overflow-hidden">
                      <div className="w-full h-full bg-gray-200 group-hover:scale-105 transition-transform duration-500"></div>
                    </div>
                    <h5 className="font-serif font-bold leading-tight group-hover:text-primary transition-colors">
                      BlackRock CEO signals new ETF filings for Solana and XRP
                    </h5>
                    <span className="text-xs text-gray-400 font-mono mt-1 block">2 HOURS AGO</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ads / Promo */}
            <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center border border-gray-200">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ADVERTISEMENT</span>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}