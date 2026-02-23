import React from 'react';
import { getAllArticles, getIntelligence } from '@/lib/articles';
import Link from 'next/link';
import AINewsFeed from '@/components/news/AINewsFeed';
import AppImage from '@/components/ui/AppImage';
import CointelegraphCard from '@/components/news/CointelegraphCard';

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
  const displayAnalysis = analysis.length > 0 ? analysis : wire.slice(1, 5);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      <main className="container mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Hero Article */}
            <section className="space-y-5 border-b border-[#1a1a1a] pb-10">
              <div className="flex items-center gap-3">
                <span className="bg-[#FABF2C] text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                  {hero?.categories[0] || 'LATEST'}
                </span>
                <span className="text-[#00d672] font-mono text-[9px] uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#00d672] rounded-full animate-pulse" /> LIVE
                </span>
              </div>

              {hero && (
                <Link href={hero.url.startsWith('http') ? hero.url : `/news/${hero.id}`} className="group block space-y-4">
                  {/* Clamped Font Size */}
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[1.1] group-hover:text-[#FABF2C] transition-colors line-clamp-3">
                    {hero.title}
                  </h1>
                  <div className="relative w-full aspect-[16/9] border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
                    <AppImage src={hero.image} fill className="object-cover group-hover:scale-105 transition-all duration-700" priority />
                  </div>
                  <p className="text-[#888] text-sm md:text-base leading-relaxed font-serif line-clamp-2">
                    {hero.body}
                  </p>
                </Link>
              )}
            </section>

            {/* Dense Cointelegraph List */}
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#555] mb-6">
                Market Updates
              </h2>
              <div className="flex flex-col">
                {displayAnalysis.map((a) => (
                  <CointelegraphCard key={a.id} article={a as any} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            <div className="p-6 border border-[#1a1a1a] bg-[#080808]">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center justify-between">
                Intelligence Wire
                <span className="w-1.5 h-1.5 bg-[#FABF2C] rounded-full animate-pulse" />
              </h3>
              <AINewsFeed />
            </div>
            
            <div className="space-y-6">
              <h3 className="text-[#555] font-black uppercase text-[10px] tracking-[0.3em] border-b border-[#1a1a1a] pb-2">
                Trending Now
              </h3>
              <div className="space-y-5">
                {wire.slice(4, 9).map((n, i) => (
                  <Link key={n.id} href={n.url} target="_blank" className="flex gap-4 group">
                    <span className="font-mono text-xs text-[#333] font-black">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-xs font-bold uppercase leading-snug text-gray-300 group-hover:text-[#FABF2C] transition-colors line-clamp-2">
                      {n.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
