'use client';
import { useState, useEffect } from 'react';

export function StickyShareBar({ title, articleId }: { title: string; articleId: string }) {
  const [copied, setCopied] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [url, setUrl] = useState(`https://cryptobrainnews.com/news/${articleId}`);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(height > 0 ? Math.min((top / height) * 100, 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const share = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <aside className="hidden lg:flex flex-col items-center gap-3 w-10 shrink-0 sticky top-28 self-start">
      <div className="w-0.5 h-20 bg-[#1a1a1a] overflow-hidden mb-2">
        <div
          className="w-full bg-[#FABF2C] transition-all duration-100"
          style={{ height: `${scrollPct}%` }}
        />
      </div>

      {[
        {
          icon: '𝕏',
          getHref: () =>
            `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        },
        {
          icon: 'in',
          getHref: () =>
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        },
        {
          icon: '📨',
          getHref: () =>
            `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        },
      ].map(({ icon, getHref }) => (
        <button
          key={icon}
          onClick={() => share(getHref())}
          className="p-2.5 bg-[#0a0a0a] border border-[#1a1a1a] text-[#888] hover:bg-[#FABF2C] hover:text-black transition-all"
        >
          <span className="text-xs font-bold">{icon}</span>
        </button>
      ))}

      <button
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="p-2.5 bg-[#0a0a0a] border border-[#1a1a1a] text-[#888] hover:bg-[#FABF2C] hover:text-black transition-all"
      >
        <span className="text-xs font-bold">{copied ? '✓' : '🔗'}</span>
      </button>
    </aside>
  );
}
