export const revalidate = 120;
 
import React from 'react';
import { notFound } from 'next/navigation';
import { getArticlesByCategory } from '@/lib/articles';
import { NEWS_CATEGORIES } from '@/lib/news-categories';
import CointelegraphCard from '@/components/news/CointelegraphCard';
import type { Metadata } from 'next';
 
interface Props { params: Promise<{ slug: string }>; }
 
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = NEWS_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return { title: 'Category Not Found' };
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com';
  return {
    title: `${cat.label} News | CryptoBrainNews`,
    description: `Latest ${cat.label} news and analysis from top crypto sources.`,
    openGraph: {
      title: `${cat.label} News`,
      description: `Latest ${cat.label} news and analysis.`,
      url: `${BASE}/news/category/${slug}`,
      images: [{ url: `${BASE}/api/og?title=${encodeURIComponent(cat.label + ' News')}&category=${slug}`, width: 1200, height: 630 }],
    },
  };
}
 
export async function generateStaticParams() {
  return NEWS_CATEGORIES.map(cat => ({ slug: cat.slug }));
}
 
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = NEWS_CATEGORIES.find(c => c.slug === slug);
  if (!cat) notFound();
 
  const articles = await getArticlesByCategory(slug);
 
  return (
    <main className="min-h-screen bg-[#050505] font-sans">
      <div className="py-10 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-10 border-b border-[#1a1a1a] pb-6 flex items-end justify-between">
            <div>
              <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-1">Category</p>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                <span className="text-[#FABF2C]">{cat.label}</span> News
              </h1>
            </div>
            <p className="text-[#555] font-mono text-xs hidden md:block">{articles.length} articles</p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map(article => (
              <CointelegraphCard key={article.id} article={article} />
            ))}
          </div>
 
          {articles.length === 0 && (
            <div className="py-32 text-center border border-dashed border-[#1a1a1a]">
              <p className="text-[#555] font-mono text-xs uppercase tracking-widest animate-pulse">
                Loading {cat.label} intelligence…
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
