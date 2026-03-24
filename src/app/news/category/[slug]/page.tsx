export const dynamic = 'force-dynamic';

import React from 'react';
import { notFound } from 'next/navigation';
import { fetchNewsByCategory } from '@/lib/news';
import { NEWS_CATEGORIES } from '@/lib/news-categories';
import { getSanityPostsByCategory } from '@/lib/sanity';
import CointelegraphCard from '@/components/news/CointelegraphCard';
import type { WeightedArticle } from '@/lib/types';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = NEWS_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return { title: 'Category Not Found' };
  return { title: `${cat.label} News | CryptoBrainNews` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = NEWS_CATEGORIES.find(c => c.slug === slug);
  if (!cat) notFound();

  const [wireArticles, sanityPosts] = await Promise.all([
    fetchNewsByCategory(slug, 30),
    getSanityPostsByCategory(slug).catch(() => []),
  ]);

  // Map sanity posts to WeightedArticle shape
  const editorialArticles: WeightedArticle[] = (sanityPosts as any[]).map(post => ({
    id: post.slug || post._id,
    title: post.title,
    body: post.excerpt || post.title,
    image: post.imageUrl || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800',
    source: 'CryptoBrain',
    published_on: Math.floor(new Date(post.publishedAt || Date.now()).getTime() / 1000),
    url: `/news/${post.slug}`,
    categories: [post.category || cat.label],
    tags: [],
    weight: 100,
    sourceType: 'editorial' as const,
    author_name: 'CryptoBrain Editorial',
  }));

  const all = [...editorialArticles, ...wireArticles]
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return b.published_on - a.published_on;
    });

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 border-b border-[#1a1a1a] pb-6 flex items-end justify-between">
          <div>
            <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-1">
              Category
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              <span className="text-[#FABF2C]">{cat.label}</span> News
            </h1>
          </div>
          <p className="text-[#555] font-mono text-xs hidden md:block">
            {all.length} articles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {all.map(article => (
            <CointelegraphCard key={article.id} article={article} />
          ))}
        </div>

        {all.length === 0 && (
          <div className="py-32 text-center border border-dashed border-[#1a1a1a]">
            <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
              Loading {cat.label} intelligence…
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
