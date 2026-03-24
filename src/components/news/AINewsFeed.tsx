'use client';
import useSWR from 'swr';
import type { CategorySlug } from '@/lib/news';

interface AIArticle {
  id: string;
  title: string;
  url: string;
  bullets: string[];
  sentiment: string;
}

const fetcher = async (url: string): Promise<AIArticle[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch AI news');
  return res.json();
};

interface Props {
  category?: CategorySlug | 'default';
}

export default function AINewsFeed({ category = 'default' }: Props) {
  const endpoint = `/api/news/ai${category !== 'default' ? `?category=${category}` : ''}`;
  const { data, error, isLoading } = useSWR<AIArticle[]>(endpoint, fetcher, {
    refreshInterval: 600000,
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="flex justify-between">
              <div className="h-2 bg-white/5 w-16" />
              <div className="h-2 bg-white/5 w-10" />
            </div>
            <div className="h-3 bg-white/10 w-full" />
            <div className="space-y-1">
              <div className="h-1.5 bg-white/5 w-2/3" />
              <div className="h-1.5 bg-white/5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="py-10 border border-[#1a1a1a] bg-[#0a0a0a] text-center">
        <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest">
          {error ? 'Data Stream Interrupted' : 'Syncing with Global Wire...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {data.map((article) => {
        const sentimentColor =
          article.sentiment === 'Positive' ? 'border-[#00d672]/30 text-[#00d672]' :
          article.sentiment === 'Negative' ? 'border-[#ff4757]/30 text-[#ff4757]' :
          'border-[#555]/30 text-[#888]';

        return (
          <div key={article.id} className="group border-b border-[#1a1a1a] pb-8 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-3 font-mono text-[9px] uppercase tracking-widest">
              <span className="text-[#FABF2C]/80">AI Summary</span>
              <span className={`px-1.5 py-0.5 border ${sentimentColor}`}>
                {article.sentiment}
              </span>
            </div>
            <h4 className="text-[13px] font-bold text-[#ccc] leading-snug mb-4 group-hover:text-[#FABF2C] transition-colors uppercase">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            </h4>
            <ul className="space-y-2">
              {article.bullets.map((b, i) => (
                <li key={i} className="text-[10px] text-[#888] flex items-start gap-2 leading-relaxed">
                  <span className="text-[#FABF2C]/40 mt-1">/</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
