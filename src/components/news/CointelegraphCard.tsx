'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { WeightedArticle } from '@/lib/types';
import { articleHref } from '@/lib/article-utils';
import BookmarkButton from './BookmarkButton';

const FALLBACK = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800';

function relativeTime(publishedOn: number): string {
  const diff = Math.floor(Date.now() / 1000) - publishedOn;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(publishedOn * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function readingTime(body: string): number {
  return Math.max(1, Math.ceil(body.split(/\s+/).length / 200));
}

const CATEGORY_COLORS: Record<string, string> = {
  bitcoin:     '#f97316',
  ethereum:    '#3b82f6',
  defi:        '#00d672',
  nft:         '#a855f7',
  regulation:  '#ef4444',
  research:    '#FABF2C',
  layer2:      '#06b6d4',
  rwa:         '#84cc16',
  'ai-crypto': '#ec4899',
  stablecoins: '#22d3ee',
  institutional:'#FABF2C',
  restaking:   '#4ade80',
  depin:       '#f59e0b',
  prediction:  '#e879f9',
  'bitcoin-l2':'#fb923c',
  market:      '#FABF2C',
};

export default function CointelegraphCard({ article }: { article: WeightedArticle }) {
  const [timeAgo, setTimeAgo] = useState('');
  const [imgSrc, setImgSrc] = useState(article.image || FALLBACK);

  useEffect(() => {
    setTimeAgo(relativeTime(article.published_on));
  }, [article.published_on]);

  const href = articleHref(article);
  const isExternal = href.startsWith('http');
  const category = (article.categories?.[0] || 'news').toLowerCase();
  const catColor = CATEGORY_COLORS[category] || '#FABF2C';
  const mins = readingTime(article.body);

  const bookmarkData = {
    id: article.id,
    title: article.title,
    url: href,
    image: imgSrc,
    source: article.source,
    category,
    savedAt: 0,
  };

  const cardContent = (
    <div className="group flex flex-col font-sans cursor-pointer h-full">
      <div className="relative w-full overflow-hidden border border-[#1a1a1a] bg-[#050505] shrink-0 mb-3" style={{ aspectRatio: '16/10' }}>
        <Image
          src={imgSrc}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc(FALLBACK)}
          loading="lazy"
          unoptimized={!imgSrc.startsWith('https://images.unsplash.com')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        <div
          className="absolute top-0 left-0 text-[9px] font-black px-2 py-0.5 uppercase tracking-widest z-10 text-black"
          style={{ background: catColor }}
        >
          {article.categories?.[0] || 'News'}
        </div>

        <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-[#aaa] text-[8px] font-mono px-1.5 py-0.5 z-10">
          {mins} min read
        </div>

        {isExternal && (
          <div className="absolute top-0 right-0 bg-black/80 text-[#555] text-[8px] font-black px-2 py-0.5 uppercase tracking-widest z-10 border-l border-b border-[#1a1a1a]">
            ↗ {article.source}
          </div>
        )}
      </div>

      <h3 className="text-base md:text-[15px] font-black text-white group-hover:text-[#FABF2C] transition-colors leading-snug mb-2 uppercase tracking-tight line-clamp-3 flex-1">
        {article.title}
      </h3>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {article.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="text-[8px] font-mono text-[#555] bg-[#0a0a0a] border border-[#1a1a1a] px-1.5 py-0.5 uppercase tracking-widest"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#0d0d0d]">
        <div className="text-[10px] text-[#555] font-mono uppercase tracking-widest flex gap-2 items-center min-w-0">
          <span className="truncate max-w-[100px]">{article.author_name || article.source}</span>
          <span className="text-[#222]">·</span>
          <span suppressHydrationWarning className="shrink-0">{timeAgo || '…'}</span>
        </div>
        <BookmarkButton article={bookmarkData} />
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full">
        {cardContent}
      </a>
    );
  }
  return (
    <Link href={href} className="flex flex-col h-full">
      {cardContent}
    </Link>
  );
}
