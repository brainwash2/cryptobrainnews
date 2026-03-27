export const dynamic = 'force-dynamic';

import React from 'react';
import { getAllArticles, getIntelligence } from '@/lib/articles';
import Link from 'next/link';
import AINewsFeed from '@/components/news/AINewsFeed';
import AppImage from '@/components/ui/AppImage';
import CointelegraphCard from '@/components/news/CointelegraphCard';

export const metadata = {
  title: 'CryptoBrainNews | Institutional Terminal',
  description: 'Institutional-grade crypto intelligence, DeFi data, and on-chain analytics.',
};

export default async function HomePage() {
  const [all, alpha, analysis] = await Promise.all([
    getAllArticles(),
    getIntelligence('Alpha Call'),
    getIntelligence('Daily Analysis'),
  ]);

  const wire = all.filter((a) => a.source !== 'CryptoBrain').slice(0, 20);
  const hero = alpha[0] || all[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      <main className="container mx-auto px-4 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Left Column */}
          <div className="lg:col-span-8 space-y-16 mt-24 relative z-0 pt-8 bg-black">
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="bg-[#FABF2C] text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                  {hero?.categories[0] || 'LATEST'}
                </span>
                <span className="text-[#555] font-mono text-[9px] uppercase tracking-[0.3em]">
                  Institutional Intelligence
                </span>
                <div className="h-px flex-1 bg-[#1a1a1a]" />
              </div>

              {hero && (
                <Link
                  href={hero.url.startsWith('http') ? hero.url : `/news/${hero.id}`}
                  className="group block space-y-8"
                >
                  <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] group-hover:text-[#FABF2C] transition-colors">
                    {hero.title}
                  </h1>
                  <div className="relative aspect-[21/9] border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
                    <AppImage
                      src={hero.image}
                      fill
                      className="object-cover group-hover:scale-105 transition-all duration-1000"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                  </div>
                  <p className="text-[#888] text-xl leading-relaxed max-w-4xl line-clamp-3">
                    {hero.body}
                  </p>
                </Link>
              )}
            </section>

            <section className="pt-16 border-t border-[#1a1a1a]">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#555] mb-10">
                Proprietary Research
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {analysis.length > 0 ? (
                  analysis.slice(0, 3).map((a) => (
                    <Link key={a.id} href={`/news/${a.id}`} className="group">
                      <div className="relative aspect-video mb-4 overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a]">
                        <AppImage
                          src={a.image}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                      <h3 className="text-sm font-bold uppercase leading-tight mb-2 group-hover:text-[#FABF2C] transition-colors">
                        {a.title}
                      </h3>
                      <span className="text-[9px] font-mono text-[#555] uppercase">
                        {a.source} Research
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 py-10 border border-dashed border-[#1a1a1a] text-center text-[#555] text-xs uppercase font-mono tracking-widest">
                    Archive Synchronizing...
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-16">
            <div className="p-8 border border-[#1a1a1a] bg-[#080808] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#FABF2C]" />
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-10 flex items-center justify-between">
                Intelligence Wire
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#00d672] rounded-full animate-pulse" />
                </span>
              </h3>
              <AINewsFeed />
            </div>

            <div className="space-y-10 px-4">
              <h3 className="text-[#555] font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4">
                Market Pulse
                <div className="h-px flex-1 bg-[#1a1a1a]" />
              </h3>
              <div className="space-y-8">
                {wire.slice(0, 5).map((n, i) => (
                  <Link key={n.id} href={n.url} target="_blank" className="flex gap-4 group">
                    <span className="font-mono text-xs text-[#333] font-black">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-xs font-bold uppercase leading-snug text-[#ccc] group-hover:text-[#FABF2C] transition-colors line-clamp-2">
                      {n.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Global Market Feed Grid */}
        {/* Airdrops & Events Discovery */}
        <section className="mt-20 pt-16 border-t border-[#1a1a1a]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-black text-[#FABF2C] uppercase tracking-[0.3em]">Airdrop Radar</h2>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d672] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d672]"></span>
                </span>
              </div>
              <p className="text-sm text-[#888] mb-8 leading-relaxed">
                Our algorithms are currently tracking highly-funded protocols across Ethereum and Solana that have not yet launched a token. Early interaction often leads to high-value protocol distributions.
              </p>
              <Link href="/airdrops" className="inline-block bg-[#1a1a1a] text-white hover:bg-[#FABF2C] hover:text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors">
                View Potential Airdrops →
              </Link>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8">
              <h2 className="text-xs font-black text-[#FABF2C] uppercase tracking-[0.3em] mb-6">Global Events</h2>
              <p className="text-sm text-[#888] mb-8 leading-relaxed">
                Track network upgrades, mainnet launches, and global institutional conferences. We aggregate data directly from CoinMarketCal and protocol announcements to keep your thesis ahead of the market.
              </p>
              <Link href="/events" className="inline-block bg-[#1a1a1a] text-white hover:bg-[#FABF2C] hover:text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors">
                Open Event Calendar →
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-32 pt-20 border-t border-[#1a1a1a]">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-[10px] font-black text-[#555] uppercase tracking-[0.4em]">
              Global Market Feed
            </h2>
            <Link href="/news" className="text-[10px] font-black text-[#FABF2C] uppercase tracking-widest hover:text-white transition-colors">
              View All ↗
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wire.slice(5, 13).map((n) => (
              <CointelegraphCard key={n.id} article={n} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
