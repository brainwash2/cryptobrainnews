'use client';
import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
 
interface PopularItem { id: string; views: number; title: string; category: string; }
 
const fetcher = (url: string) => fetch(url).then(r => r.json());
 
export default function PopularArticles({ limit = 5 }: { limit?: number }) {
  const { data, isLoading } = useSWR<{ popular: PopularItem[] }>(
    `/api/analytics/popular?limit=${limit}`,
    fetcher,
    { refreshInterval: 300000 }
  );
 
  if (isLoading) return (
    <div className="space-y-3">
      {Array.from({ length: limit }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-3">
          <div className="w-6 h-4 bg-white/5 shrink-0" />
          <div className="h-4 bg-white/5 flex-1" />
        </div>
      ))}
    </div>
  );
 
  const popular = data?.popular || [];
  if (popular.length === 0) return (
    <p className="text-[#555] font-mono text-xs">No data yet — views will appear once articles are read.</p>
  );
 
  return (
    <div className="space-y-4">
      {popular.map((item, i) => (
        <Link key={item.id}
          href={`/news/${item.id}`}
          className="flex items-start gap-3 group">
          <span className="text-[#FABF2C] font-black text-lg leading-none w-6 shrink-0">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <p className="text-white text-xs font-bold uppercase leading-snug group-hover:text-[#FABF2C] transition-colors line-clamp-2">
              {item.title || item.id}
            </p>
            <p className="text-[#555] font-mono text-[10px] mt-0.5">
              {item.views.toLocaleString()} views
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
