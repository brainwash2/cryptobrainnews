'use client';
import React from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import type { BookmarkedArticle } from '@/hooks/useBookmarks';
 
interface Props {
  article: BookmarkedArticle;
  className?: string;
}
 
export default function BookmarkButton({ article, className = '' }: Props) {
  const { toggle, isBookmarked, loaded } = useBookmarks();
  const saved = isBookmarked(article.id);
 
  // Don't render until client-side localStorage is read (avoids hydration mismatch)
  if (!loaded) return null;
 
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(article);
      }}
      title={saved ? 'Remove bookmark' : 'Save article'}
      aria-label={saved ? 'Remove bookmark' : 'Save article'}
      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
        saved
          ? 'text-[#FABF2C]'
          : 'text-[#555] hover:text-[#FABF2C]'
      } ${className}`}
    >
      <svg
        width="11"
        height="13"
        viewBox="0 0 12 14"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M1 1h10v12l-5-3-5 3V1z" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
