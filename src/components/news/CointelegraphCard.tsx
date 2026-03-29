'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { WeightedArticle } from '@/lib/types';
import { articleHref } from '@/lib/article-utils';
import BookmarkButton from './BookmarkButton';
 
const FALLBACK = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800';
 
export default function CointelegraphCard({ article }: { article: WeightedArticle }) {
  const [timeAgo, setTimeAgo] = useState('');
  const [imgSrc, setImgSrc] = useState(article.image || FALLBACK);
 
  useEffect(() => {
    setTimeAgo(new Date(article.published_on * 1000).toLocaleDateString());
  }, [article.published_on]);
 
  const href = articleHref(article);
  const isExternal = href.startsWith('http');
 
  const bookmarkData = {
    id: article.id,
    title: article.title,
    url: href,
    image: imgSrc,
    source: article.source,
    category: article.categories?.[0] || 'news',
    savedAt: 0,
  };
 
  const cardContent = (
    <div className="group flex flex-col font-sans cursor-pointer h-full">
      {/* Image with next/image for automatic optimisation */}
      <div className="relative w-full aspect-[16/9] mb-3 overflow-hidden border border-[#1a1a1a] bg-[#050505] shrink-0">
        <Image
          src={imgSrc}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc(FALLBACK)}
          loading="lazy"
          unoptimized={imgSrc.startsWith('https://images.unsplash.com') ? false : true}
        />
        {/* Category badge */}
        <div className="absolute top-0 left-0 bg-[#FABF2C] text-black text-[10px] font-black px-2 py-1 uppercase tracking-widest z-10">
          {article.categories?.[0] || 'News'}
        </div>
        {/* External source badge */}
        {isExternal && (
          <div className="absolute top-0 right-0 bg-black/80 text-[#555] text-[8px] font-black px-2 py-1 uppercase tracking-widest z-10">
            ↗ {article.source}
          </div>
        )}
      </div>
 
      <h3 className="text-base font-black text-white group-hover:text-[#FABF2C] transition-colors leading-snug mb-2 uppercase tracking-tight line-clamp-3 flex-1">
        {article.title}
      </h3>
 
      {/* Tags if present */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {article.tags.slice(0, 3).map(tag => (
            <span key={tag}
              className="text-[8px] font-mono text-[#555] bg-[#111] border border-[#1a1a1a] px-1.5 py-0.5 uppercase tracking-widest">
              #{tag}
            </span>
          ))}
        </div>
      )}
 
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="text-[10px] text-[#555] font-mono uppercase tracking-widest flex gap-2">
          <span>{article.author_name || article.source}</span>
          <span>•</span>
          <span suppressHydrationWarning>{timeAgo || '…'}</span>
        </div>
        <BookmarkButton article={bookmarkData} />
      </div>
    </div>
  );
 
  if (isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full">{cardContent}</a>;
  }
  return <Link href={href} className="flex flex-col h-full">{cardContent}</Link>;
}
