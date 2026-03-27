'use client';
import React from 'react';
import Link from 'next/link';
import { useBookmarks } from '@/hooks/useBookmarks';
import AppImage from '@/components/ui/AppImage';
 
export default function BookmarksClient() {
  const { bookmarks, toggle, loaded } = useBookmarks();
 
  if (!loaded) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#555] font-mono text-xs uppercase tracking-widest animate-pulse">
          Loading…
        </p>
      </div>
    );
  }
 
  if (bookmarks.length === 0) {
    return (
      <div className="py-32 text-center border border-dashed border-[#1a1a1a]">
        <p className="text-[#555] font-mono text-xs uppercase tracking-widest mb-4">
          No saved articles yet
        </p>
        <Link
          href="/news"
          className="text-[#FABF2C] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
        >
          Browse News →
        </Link>
      </div>
    );
  }
 
  return (
    <div>
      <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-6">
        {bookmarks.length} saved article{bookmarks.length !== 1 ? 's' : ''}
      </p>
      <div className="divide-y divide-[#1a1a1a]">
        {bookmarks.map(article => {
          const href = article.url.startsWith('http') ? article.url : `/news/${article.id}`;
          const isExternal = article.url.startsWith('http');
          return (
            <div key={article.id} className="flex gap-4 py-5 group">
              <Link
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="relative w-24 h-16 shrink-0 overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a]"
              >
                <AppImage src={article.image} alt={article.title} fill />
              </Link>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black text-[#FABF2C] uppercase tracking-widest bg-[#FABF2C]/10 px-1.5 py-0.5">
                  {article.category}
                </span>
                <Link
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="block mt-1"
                >
                  <h3 className="text-white font-bold text-sm uppercase leading-snug group-hover:text-[#FABF2C] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[#555] font-mono text-[10px]">{article.source}</span>
                  <span className="text-[#333]">•</span>
                  <span className="text-[#555] font-mono text-[10px]">
                    {new Date(article.savedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => toggle(article)}
                    className="text-[#555] hover:text-red-400 transition-colors text-[10px] font-mono ml-auto"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
