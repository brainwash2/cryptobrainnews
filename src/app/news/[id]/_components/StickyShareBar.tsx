'use client';
import { useState, useEffect } from 'react';

export function StickyShareBar({ title, articleId }: { title: string; articleId: string }) {
  const [copied, setCopied] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const url = typeof window !== 'undefined' ? window.location.href : `https://cryptobrainnews.com/news/${articleId}`;

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(height > 0 ? Math.min((top / height) * 100, 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <aside className="hidden lg:flex flex-col items-center gap-3 w-10 shrink-0 sticky top-28 self-start">
      <div className="w-0.5 h-20 bg-border rounded-full overflow-hidden mb-2">
        <div className="w-full bg-primary transition-all duration-100" style={{ height: `${scrollPct}%` }} />
      </div>
      {[
        { icon: '𝕏', href: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
        { icon: 'in', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
        { icon: '📨', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
      ].map(({ icon, href }) => (
        <a key={href} href={href} target="_blank" rel="noopener noreferrer"
           className="p-2.5 rounded bg-card border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
          <span className="text-xs font-bold">{icon}</span>
        </a>
      ))}
      <button onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="p-2.5 rounded bg-card border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground">
        <span className="text-xs font-bold">{copied ? '✓' : '🔗'}</span>
      </button>
    </aside>
  );
}
