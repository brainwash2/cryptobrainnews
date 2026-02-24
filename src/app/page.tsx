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
  const displayAnalysis = analysis.length > 0 ? analysis : wire.slice(1, 7);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      <main className="container mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* HERO SECTION - Fixed Aspect Ratio and Font Sizing */}
            <section className="border-b border-[#1a1a1a] pb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#FABF2C] text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                  {hero?.categories[0] || 'LATEST'}
                </span>
                <span className="text-[#00d672] font-mono text-[9px] uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#00d672] rounded-full animate-pulse" /> LIVE
                </span>
              </div>

              {hero && (
                <Link href={hero.url.startsWith('http') ? hero.url : `/news/${hero.id}`} className="group block">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[1.05] group-hover:text-[#FABF2C] transition-colors mb-6 break-words">
                    {hero.title}
                  </h1>
                  {/* Aspect video (16:9) guarantees it won't squish */}
                  <div className="relative w-full aspect-video border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden mb-6">
                    <AppImage src={hero.image} fill className="object-cover group-hover:scale-105 transition-all duration-700" priority />
                  </div>
                  <p className="text-[#888] text-sm md:text-base leading-relaxed font-serif line-clamp-3">
                    {hero.body}
                  </p>
                </Link>
              )}
            </section>

            {/* Cointelegraph Grid Style */}
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#555] mb-6 border-b border-[#1a1a1a] pb-2">
                Market Updates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                {displayAnalysis.map((a) => (
                  <CointelegraphCard key={a.id} article={a as any} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            <div className="p-6 border border-[#1a1a1a] bg-[#0a0a0a]">
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
