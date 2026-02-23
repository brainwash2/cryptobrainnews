import React from 'react';
import { getAllArticles } from '@/lib/articles';
import CointelegraphCard from '@/components/news/CointelegraphCard';

export const metadata = {
  title: 'News Hub | CryptoBrainNews',
  description: 'Global crypto intelligence wire and proprietary alpha calls.',
};

export const dynamic = 'force-dynamic';

export default async function NewsHubPage() {
  const articles = await getAllArticles();
  const hero = articles[0];
  const rest = articles.slice(1);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] bg-black sticky top-16 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black uppercase tracking-tighter">
            Market <span className="text-[#FABF2C]">News</span>
          </h1>
          <div className="text-[10px] font-mono text-[#555] hidden sm:block">
            LIVE FEED • {articles.length} UPDATES
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Feed (Left 8 Cols) */}
          <div className="lg:col-span-8">
            {/* Hero Article (Big Card) */}
            {hero && (
              <div className="mb-10 border-b border-[#1a1a1a] pb-10">
                <CointelegraphCard article={hero} priority={true} />
              </div>
            )}

            {/* List of Articles (Dense List on Mobile, Grid on Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {rest.map((article) => (
                <CointelegraphCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          {/* Sidebar (Right 4 Cols) */}
          <aside className="lg:col-span-4 space-y-8 hidden lg:block">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 text-center">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">Newsletter</h3>
              <p className="text-[10px] text-[#555] mb-4">Get the daily alpha.</p>
              <input placeholder="Email" className="w-full bg-black border border-[#222] px-3 py-2 text-xs mb-2" />
              <button className="w-full bg-[#FABF2C] text-black font-black text-xs py-2 uppercase">Subscribe</button>
            </div>
            
            <div className="sticky top-24">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-[#555] mb-4 border-b border-[#1a1a1a] pb-2">
                 Editor's Choice
               </h3>
               {/* Reuse list style for sidebar */}
               <div className="flex flex-col gap-6">
                 {articles.slice(5, 10).map(a => (
                   <div key={a.id} className="group">
                     <div className="text-[9px] font-mono text-[#FABF2C] mb-1">{a.source}</div>
                     <a href={a.url} target="_blank" className="text-sm font-bold text-gray-300 group-hover:text-white leading-tight">
                       {a.title}
                     </a>
                   </div>
                 ))}
               </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
