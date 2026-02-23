'use client';
import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import type { WeightedArticle } from '@/lib/types';

export default function CointelegraphCard({ article, priority = false }: { article: WeightedArticle; priority?: boolean }) {
  const isWire = article.sourceType === 'wire';
  const timeAgo = new Date(article.published_on * 1000).toLocaleDateString();

  return (
    <Link 
      href={article.url.startsWith('http') ? article.url : `/news/${article.id}`}
      target={article.url.startsWith('http') ? '_blank' : '_self'}
      className="group flex flex-row md:flex-col gap-4 mb-6 md:mb-0 border-b md:border-0 border-[#1a1a1a] pb-6 md:pb-0 last:border-0"
    >
      {/* Image: Small on Mobile (Left), Big on Desktop (Top) */}
      <div className="relative w-[120px] h-[80px] md:w-full md:aspect-[16/9] shrink-0 overflow-hidden bg-[#111]">
        <AppImage
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={priority}
        />
        {/* Category Tag (Desktop Only) */}
        <div className="hidden md:block absolute top-2 left-2 bg-[#FABF2C] text-black text-[9px] font-black px-2 py-1 uppercase tracking-widest">
          {article.categories[0] || 'NEWS'}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1">
        <div className="space-y-2">
          {/* Metadata Row */}
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-wider text-[#666]">
            <span className="text-[#FABF2C]">{article.source}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm md:text-lg font-bold text-gray-100 leading-snug group-hover:text-[#FABF2C] transition-colors line-clamp-3 md:line-clamp-2">
            {article.title}
          </h3>

          {/* Excerpt (Desktop Only) */}
          <p className="hidden md:block text-xs text-gray-500 font-serif line-clamp-2 leading-relaxed">
            {article.body.replace(/<[^>]+>/g, '').slice(0, 120)}...
          </p>
        </div>
      </div>
    </Link>
  );
}
