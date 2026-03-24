'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import type { WeightedArticle } from '@/lib/types';
import { articleHref } from '@/lib/article-utils';

export default function CointelegraphCard({ article }: { article: WeightedArticle }) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    setTimeAgo(new Date(article.published_on * 1000).toLocaleDateString());
  }, [article.published_on]);

  const href = articleHref(article);
  const isExternal = href.startsWith('http');

  const inner = (
    <div className="group flex flex-col font-sans mb-8 cursor-pointer">
      <div className="relative w-full aspect-[16/9] mb-3 overflow-hidden border border-[#1a1a1a] bg-[#050505]">
        <AppImage
          src={article.image}
          alt={article.title}
          fill
          className="group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-0 left-0 bg-[#FABF2C] text-black text-[10px] font-black px-2 py-1 uppercase tracking-widest z-10">
          {article.categories?.[0] || 'News'}
        </div>
        {isExternal && (
          <div className="absolute top-0 right-0 bg-[#111] text-[#555] text-[8px] font-black px-2 py-1 uppercase tracking-widest z-10">
            ↗ {article.source}
          </div>
        )}
      </div>

      <h3 className="text-lg font-black text-white group-hover:text-[#FABF2C] transition-colors leading-snug mb-2 uppercase tracking-tight">
        {article.title}
      </h3>

      <div className="text-[10px] text-[#555] font-mono uppercase tracking-widest flex gap-2">
        <span>{article.author_name || article.source}</span>
        <span>•</span>
        <span suppressHydrationWarning>{timeAgo || '…'}</span>
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return <Link href={href}>{inner}</Link>;
}
