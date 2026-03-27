import React from 'react';
import AINewsFeed from '@/components/news/AINewsFeed';
import PopularArticles from '@/components/news/PopularArticles';
 
export function ArticleSidebar() {
  return (
    <aside className="hidden xl:block w-[320px] shrink-0 space-y-10">
 
      {/* Popular Articles */}
      <div className="border border-[#1a1a1a] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-[#1a1a1a]" />
          <span className="text-[9px] font-black text-[#555] uppercase tracking-[0.3em]">Trending</span>
          <div className="h-px flex-1 bg-[#1a1a1a]" />
        </div>
        <PopularArticles limit={5} />
      </div>
 
      {/* AI News Feed */}
      <div className="border border-[#1a1a1a] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-[#1a1a1a]" />
          <span className="text-[9px] font-black text-[#555] uppercase tracking-[0.3em]">AI Intel</span>
          <div className="h-px flex-1 bg-[#1a1a1a]" />
        </div>
        <AINewsFeed />
      </div>
 
    </aside>
  );
}
