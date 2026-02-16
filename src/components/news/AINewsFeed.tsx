'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AINewsFeed() {
  const { data, error, isLoading } = useSWR('/api/news/ai', fetcher, {
    refreshInterval: 600000, 
    revalidateOnFocus: false
  });

  if (isLoading) return (
    <div className="space-y-8">
      {[1,2,3].map(i => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="flex justify-between"><div className="h-2 bg-white/5 w-16" /><div className="h-2 bg-white/5 w-10" /></div>
          <div className="h-3 bg-white/10 w-full" />
          <div className="space-y-1"><div className="h-1.5 bg-white/5 w-2/3" /><div className="h-1.5 bg-white/5 w-1/2" /></div>
        </div>
      ))}
    </div>
  );

  if (!data || data.length === 0) return (
    <div className="py-10 border border-white/5 bg-white/[0.01] text-center">
      <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
        {error ? 'Data Stream Interrupted' : 'Syncing with Global Wire...'}
      </p>
    </div>
  );

  return (
    <div className="space-y-10">
      {data.map((article: any) => (
        <div key={article.id} className="group border-b border-white/5 pb-8 last:border-0 last:pb-0">
          <div className="flex items-center justify-between mb-3 font-mono text-[9px] uppercase tracking-widest">
            <span className="text-primary/80">{article.source}</span>
            <span className={`px-1.5 py-0.5 border ${
              article.sentiment === 'Positive' ? 'border-green-500/30 text-green-500' : 
              article.sentiment === 'Negative' ? 'border-red-500/30 text-red-500' : 
              'border-gray-500/30 text-gray-500'
            }`}>
              {article.sentiment}
            </span>
          </div>
          <h4 className="text-[13px] font-bold text-gray-200 leading-snug mb-4 group-hover:text-primary transition-colors uppercase">
            <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
          </h4>
          <ul className="space-y-2">
            {article.bullets.map((b: string, i: number) => (
              <li key={i} className="text-[10px] text-gray-500 flex items-start gap-2 leading-relaxed">
                <span className="text-primary/40 mt-1">/</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
