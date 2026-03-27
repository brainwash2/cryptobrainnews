'use client';
import { useEffect, useRef } from 'react';

export function useArticleView(articleId: string, title: string, category: string) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || !articleId) return;
    tracked.current = true;
    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, title, category }),
    }).catch(() => {});
  }, [articleId, title, category]);
}
