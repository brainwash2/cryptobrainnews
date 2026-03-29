export const revalidate = 3600;

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSanityAuthor, getPostsByAuthor } from '@/lib/sanity';
import AppImage from '@/components/ui/AppImage';
import type { Metadata } from 'next';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com').replace(/\/$/, '');

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getSanityAuthor(slug).catch(() => null);
  if (!author) return { title: 'Author Not Found' };
  return {
    title: `${author.name} — ${author.role || 'Author'} | CryptoBrainNews`,
    description: author.bio?.slice(0, 160) || `Articles by ${author.name} on CryptoBrainNews.`,
    openGraph: {
      title: author.name,
      description: author.bio?.slice(0, 160),
      images: author.avatarUrl ? [{ url: author.avatarUrl }] : [],
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const [author, posts] = await Promise.all([
    getSanityAuthor(slug).catch(() => null),
    getPostsByAuthor(slug).catch(() => []),
  ]);

  if (!author) notFound();

  // JSON-LD Person schema — Google uses this for E-E-A-T
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `${BASE}/authors/${slug}`,
    jobTitle: author.role || 'Author',
    description: author.bio,
    image: author.avatarUrl,
    sameAs: author.twitter ? [`https://twitter.com/${author.twitter}`] : [],
    worksFor: {
      '@type': 'Organization',
      name: 'CryptoBrainNews',
      url: BASE,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
        <div className="max-w-[1400px] mx-auto">

          {/* Author header */}
          <div className="flex flex-col md:flex-row gap-8 mb-16 pb-10 border-b border-[#1a1a1a]">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#FABF2C]/30 bg-[#111] shrink-0">
              {author.avatarUrl ? (
                <AppImage src={author.avatarUrl} alt={author.name} fill />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#FABF2C] text-black font-black text-4xl">
                  {author.name?.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              {author.role && (
                <span className="inline-block text-[9px] font-black uppercase tracking-widest text-[#FABF2C] bg-[#FABF2C]/10 px-2 py-1 mb-3">
                  {author.role}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                {author.name}
              </h1>
              {author.bio && (
                <p className="text-[#888] font-mono text-sm leading-relaxed max-w-2xl mb-4">
                  {author.bio}
                </p>
              )}
              <div className="flex items-center gap-4">
                {author.twitter && (
                  <a
                    href={`https://twitter.com/${author.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#555] hover:text-[#FABF2C] transition-colors text-xs font-mono"
                  >
                    @{author.twitter} ↗
                  </a>
                )}
                <span className="text-[#333] text-xs font-mono">
                  {(posts as any[]).length} article{(posts as any[]).length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Author's articles */}
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">
              Latest Articles
            </h2>

            {(posts as any[]).length === 0 ? (
              <p className="text-[#555] font-mono text-xs">No published articles yet.</p>
            ) : (
              <div className="divide-y divide-[#1a1a1a]">
                {(posts as any[]).map(post => (
                  <Link
                    key={post._id}
                    href={`/news/${post.slug}`}
                    className="flex gap-4 py-5 group"
                  >
                    {post.imageUrl && (
                      <div className="relative w-20 h-14 shrink-0 overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a]">
                        <AppImage src={post.imageUrl} alt={post.title} fill />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {post.category && (
                        <span className="text-[9px] font-black text-[#FABF2C] uppercase tracking-widest">
                          {post.category}
                        </span>
                      )}
                      <h3 className="text-white font-bold text-sm uppercase leading-snug group-hover:text-[#FABF2C] transition-colors line-clamp-2 mt-0.5">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-[#555] text-xs font-mono mt-1 line-clamp-1">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="text-[#333] text-[10px] font-mono mt-1">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12">
            <Link href="/authors" className="text-[#555] hover:text-[#FABF2C] transition-colors text-[10px] font-mono uppercase tracking-widest">
              ← All Authors
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
