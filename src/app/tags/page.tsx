export const revalidate = 3600;
 
import React from 'react';
import Link from 'next/link';
import { getAllTags } from '@/lib/sanity';
import type { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'All Topics | CryptoBrainNews',
  description: 'Browse all topics and tags covered by CryptoBrainNews.',
};
 
export default async function TagsPage() {
  const tags = await getAllTags().catch(() => []);
 
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12 border-b border-[#1a1a1a] pb-6">
          <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-1">Browse</p>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            All <span className="text-[#FABF2C]">Topics</span>
          </h1>
        </div>
 
        {tags.length === 0 ? (
          <p className="text-[#555] font-mono text-xs">
            No tags yet — add tags to articles in Sanity Studio.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#888] hover:border-[#FABF2C] hover:text-[#FABF2C] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
