import React from 'react';
import { getAllArticles, getIntelligence } from '@/lib/articles';
import Link from 'next/link';
import AINewsFeed from '@/components/news/AINewsFeed';
import AppImage from '@/components/ui/AppImage';
import Ticker from '@/components/layout/Ticker';

export default async function HomePage() {
  const [all, alpha, analysis] = await Promise.all([
    getAllArticles(),
    getIntelligence('Alpha Call'),
    getIntelligence('Daily Analysis'),
  ]);

  // Separate wire news (external) from proprietary
  const wire = all.filter(a => a.source !== 'CryptoBrain').slice(0, 20);
  const hero = alpha[0] || all[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary selection:text-black">
      <Ticker />
      
      <main className="container mx-auto px-4 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* MAIN COLUMN */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* HERO SECTION */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="bg-primary text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                  {hero?.categories[0] || 'LATEST'}
                </span>
                <span className="text-gray-600 font-mono text-[9px] uppercase tracking-[0.3em]">Institutional Intelligence</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {hero && (
                <Link href={hero.url.startsWith('http') ? hero.url : `/news/${hero.id}`} className="group block space-y-8">
                  <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] group-hover:text-primary transition-colors">
                    {hero.title}
                  </h1>
                  <div className="relative aspect-[21/9] border border-white/5 bg-[#0a0a0a] overflow-hidden">
                    <AppImage src={hero.image} fill className="object-cover group-hover:scale-105 transition-all duration-1000" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                  </div>
                  <p className="text-gray-400 text-xl leading-relaxed font-serif max-w-4xl line-clamp-3">
                    {hero.body}
                  </p>
                </Link>
              )}
            </section>

            {/* RESEARCH ROW (Optimized for 1-3 items) */}
            <section className="pt-16 border-t border-white/5">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-10">Proprietary Research</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {analysis.length > 0 ? analysis.slice(0, 3).map(a => (
                  <Link key={a.id} href={`/news/${a.id}`} className="group">
                    <div className="relative aspect-video mb-4 overflow-hidden border border-white/5 bg-[#0a0a0a]">
                      <AppImage src={a.image} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                    <h3 className="text-sm font-bold uppercase leading-tight mb-2 group-hover:text-primary transition-colors">{a.title}</h3>
                    <span className="text-[9px] font-mono text-gray-600 uppercase">{a.source} Research</span>
                  </Link>
                )) : (
                  <div className="col-span-3 py-10 border border-dashed border-white/5 text-center text-gray-700 text-xs uppercase font-mono">
                    Archive Synchronizing...
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR COLUMN */}
          <aside className="lg:col-span-4 space-y-16">
            <div className="p-8 border border-white/5 bg-[#080808] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-10 flex items-center justify-between">
                Intelligence Wire
                <span className="flex gap-1">
                  <span className="w-1 h-1 bg-primary rounded-full animate-ping" />
                  <span className="w-1 h-1 bg-primary rounded-full" />
                </span>
              </h3>
              <AINewsFeed />
            </div>

            {/* TRENDING */}
            <div className="space-y-10 px-4">
               <h3 className="text-gray-600 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4">
                 Market Pulse
                 <div className="h-px flex-1 bg-white/5" />
               </h3>
               <div className="space-y-8">
                 {wire.slice(0, 5).map((n, i) => (
                   <Link key={n.id} href={n.url} target="_blank" className="flex gap-4 group">
                     <span className="font-mono text-xs text-gray-800 font-black">{String(i+1).padStart(2,'0')}</span>
                     <h4 className="text-xs font-bold uppercase leading-snug text-gray-300 group-hover:text-primary transition-colors line-clamp-2">{n.title}</h4>
                   </Link>
                 ))}
               </div>
            </div>
          </aside>
        </div>

        {/* BOTTOM WIRE (The Block Style Grid with Images) */}
        <section className="mt-32 pt-20 border-t border-white/5">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-12">Global Market Feed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {wire.slice(5, 17).map(n => (
              <Link key={n.id} href={n.url} target="_blank" className="group flex flex-col space-y-4">
                <div className="relative aspect-[16/10] overflow-hidden border border-white/5 bg-[#0a0a0a]">
                  <AppImage src={n.image} fill className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest">
                    <span className="text-primary/60">{n.source}</span>
                    <span className="text-gray-700">{new Date(n.published_on * 1000).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-gray-300 group-hover:text-white transition-colors uppercase leading-snug line-clamp-2">
                    {n.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
