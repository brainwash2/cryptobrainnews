export const revalidate = 600;
 
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostsByTag, getAllTags } from '@/lib/sanity';
import { fetchCryptoNews } from '@/lib/news';
import AppImage from '@/components/ui/AppImage';
import type { Metadata } from 'next';
import type { WeightedArticle } from '@/lib/types';
 
const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com').replace(/\/$/, '');
 
interface Props { params: Promise<{ slug: string }>; }
 
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);
  return {
    title: `#${tag} — Articles & News | CryptoBrainNews`,
    description: `All CryptoBrainNews articles and analysis tagged with #${tag}.`,
    alternates: { canonical: `${BASE}/tags/${slug}` },
  };
}
 
export async function generateStaticParams() {
  const tags = await getAllTags().catch(() => []);
  return tags.map(tag => ({ slug: encodeURIComponent(tag) }));
}
 
export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);
 
  const [sanityPosts, wireArticles] = await Promise.all([
    getPostsByTag(tag).catch(() => []),
    fetchCryptoNews(10, tag).catch(() => []),
  ]);
 
  const editorialArticles: WeightedArticle[] = (sanityPosts as any[]).map(post => ({
    id: post.slug || post._id,
    title: post.title,
    body: post.excerpt || post.title,
    image: post.imageUrl || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800',
    source: 'CryptoBrain',
    published_on: Math.floor(new Date(post.publishedAt || Date.now()).getTime() / 1000),
    url: `/news/${post.slug}`,
    categories: [post.category || 'news'],
    tags: post.tags || [],
    weight: 100,
    sourceType: 'editorial' as const,
    author_name: post.authorName || 'CryptoBrain Editorial',
  }));
 
  const all = [...editorialArticles, ...wireArticles]
    .sort((a, b) => b.published_on - a.published_on);
 
  if (all.length === 0) notFound();
 
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12 border-b border-[#1a1a1a] pb-6 flex items-end justify-between">
          <div>
            <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-1">Tag</p>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              <span className="text-[#FABF2C]">#{tag}</span>
            </h1>
          </div>
          <p className="text-[#555] font-mono text-xs hidden md:block">{all.length} articles</p>
        </div>
 
        <div className="divide-y divide-[#1a1a1a]">
          {all.map(article => {
            const href = article.sourceType === 'editorial' ? `/news/${article.id}` : article.url;
            const isExternal = href.startsWith('http');
            return (
              <Link
                key={article.id}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="flex gap-5 py-6 group"
              >
                <div className="relative w-24 h-16 shrink-0 overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a]">
                  <AppImage src={article.image} alt={article.title} fill />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-[#FABF2C] uppercase tracking-widest">
                      {article.categories[0]}
                    </span>
                    {isExternal && (
                      <span className="text-[9px] font-mono text-[#555]">↗ {article.source}</span>
                    )}
                  </div>
                  <h2 className="text-white font-bold text-sm uppercase leading-snug group-hover:text-[#FABF2C] transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-[#333] text-[10px] font-mono mt-1">
                    {new Date(article.published_on * 1000).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
