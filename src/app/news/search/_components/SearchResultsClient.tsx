'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CointelegraphCard from '@/components/news/CointelegraphCard';
import type { WeightedArticle } from '@/lib/types';

interface Props {
  initialQuery: string;
}

export default function SearchResultsClient({ initialQuery }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [results, setResults] = useState<WeightedArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/news/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => setResults(data.results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    startTransition(() => {
      router.replace(`/news/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
    });
  }

  return (
    <div>
      {/* Inline search bar on the results page */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-xl">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Search articles…"
          className="flex-1 bg-[#111] border border-[#333] text-white placeholder-[#555] px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#FABF2C] transition-colors"
        />
        <button
          type="submit"
          className="bg-[#FABF2C] text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
        >
          Search
        </button>
      </form>

      {loading || isPending ? (
        <div className="py-20 text-center">
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest animate-pulse">
            Scanning wire…
          </p>
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-6">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(article => (
              <CointelegraphCard key={article.id} article={article} />
            ))}
          </div>
        </>
      ) : query.length >= 2 ? (
        <div className="py-32 text-center border border-dashed border-[#1a1a1a]">
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
            No results for &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : null}
    </div>
  );
}
