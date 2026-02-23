'use client';
import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function CointelegraphCard({ article }: { article: any }) {
  const timeAgo = new Date(article.published_on * 1000).toLocaleDateString();

  return (
    <Link href={article.url} className="group flex flex-col font-sans mb-8">
      {/* Image with Tag */}
      <div className="relative w-full aspect-[16/9] mb-3 overflow-hidden rounded-sm bg-[#111]">
        <AppImage src={article.image} alt={article.title} fill className="group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-0 left-0 bg-[#FABF2C] text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide z-10">
          {article.categories?.[0] || 'News'}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-[#FABF2C] transition-colors leading-snug mb-2">
        {article.title}
      </h3>
      
      {/* Meta */}
      <div className="text-xs text-[#888] font-medium flex gap-1">
        <span>by <span className="text-gray-400">{article.author_name || article.source}</span></span>
        <span>•</span>
        <span>{timeAgo}</span>
      </div>
    </Link>
  );
}
