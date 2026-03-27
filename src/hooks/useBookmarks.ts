'use client';
import { useState, useEffect, useCallback } from 'react';

const KEY = 'cbn:bookmarks';

export interface BookmarkedArticle {
  id: string;
  title: string;
  url: string;
  image: string;
  source: string;
  category: string;
  savedAt: number;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setBookmarks(raw ? JSON.parse(raw) : []);
    } catch { setBookmarks([]); }
    setLoaded(true);
  }, []);

  const toggle = useCallback((article: BookmarkedArticle) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.id === article.id);
      const updated = exists
        ? prev.filter(b => b.id !== article.id)
        : [{ ...article, savedAt: Date.now() }, ...prev].slice(0, 50);
      try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const isBookmarked = useCallback((id: string) =>
    bookmarks.some(b => b.id === id), [bookmarks]);

  const clear = useCallback(() => {
    setBookmarks([]);
    try { localStorage.removeItem(KEY); } catch {}
  }, []);

  return { bookmarks, toggle, isBookmarked, clear, loaded };
}
