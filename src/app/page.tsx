import React from 'react';
import { getAllArticles, getIntelligence } from '@/lib/articles';
import Link from 'next/link';
import AINewsFeed from '@/components/news/AINewsFeed';
import AppImage from '@/components/ui/AppImage';

export const metadata = {
  title: 'CryptoBrainNews | Institutional Terminal',
  description: 'Institutional-grade crypto intelligence.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [all, alpha, analysis] = await Promise.all([
    getAllArticles(),
    getIntelligence('Alpha Call'),
    getIntelligence('Daily Analysis'),
  ]);

  const wire = all.filter((a) => a.source !== 'CryptoBrain').slice(0, 20);
  const hero = alpha[0] || all[0];
  const displayAnalysis = analysis.length > 0 ? analysis : wire.slice(1, 4);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      <main className="container mx-auto px-4 lg:px-10 py-10 w-full max-w-[100vw]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="bg-[#FABF2C] text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shrink-0">
                  {hero?.categories[0] || 'LATEST'}
                </span>
                <span className="text-green-500 font-mono text-[9px] uppercase tracking-[0.3em] truncate">
                  ● LIVE FEED v2.0
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {hero && (
                <Link
                  href={hero.url.startsWith('http') ? hero.url : `/news/${hero.id}`}
                  className="group block space-y-6"
                >
                  {/* MOBILE FIX: text-3xl and break-words prevents overflow */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-tight group-hover:text-[#FABF2C] transition-colors break-words w-full">
                    {hero.title}
                  </h1>
                  
                  <div className="relative w-full aspect-[16/9] border border-white/5 bg-[#0a0a0a] overflow-hidden">
                    <AppImage
                      src={hero.image}
                      fill
                      className="object-cover group-hover:scale-105 transition-all duration-1000"
                      priority
                    />
                  </div>
                  
                  <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-serif max-w-4xl line-clamp-3">
                    {hero.body}
                  </p>
                </Link>
              )}
            </section>

            <section className="pt-12 border-t border-white/5">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-8">
                {analysis.length > 0 ? 'Proprietary Research' : 'Trending Now'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {displayAnalysis.slice(0, 3).map((a) => (
                  <Link key={a.id} href={a.url.startsWith('http') ? a.url : `/news/${a.id}`} className="group block">
                    <div className="relative aspect-video mb-4 overflow-hidden border border-white/5 bg-[#0a0a0a]">
                      <AppImage src={a.image} fill className="object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <h3 className="text-sm font-bold uppercase leading-tight mb-2 group-hover:text-[#FABF2C] transition-colors line-clamp-2">
                      {a.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-12">
            <div className="p-6 border border-white/5 bg-[#080808]">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-8 flex items-center justify-between">
                Intelligence Wire
                <span className="w-2 h-2 bg-[#FABF2C] rounded-full animate-pulse" />
              </h3>
              <AINewsFeed />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
