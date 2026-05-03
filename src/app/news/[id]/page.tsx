export const dynamic = 'force-dynamic';
 
import React from 'react';
import { notFound } from 'next/navigation';
import { getArticleById, getRelatedArticles, calculateReadingTime } from '@/lib/articles';
import { getSanityGlossary } from '@/lib/sanity';
import { ReadingProgress } from './_components/ReadingProgress';
import { StickyShareBar } from './_components/StickyShareBar';
import { ArticleSidebar } from './_components/ArticleSidebar';
import AppImage from '@/components/ui/AppImage';
import GlossaryTooltip from '@/components/common/GlossaryTooltip';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import type { WeightedArticle } from '@/lib/types';
import AdUnit from '@/components/monetization/AdUnit';
import AffiliateLink from '@/components/monetization/AffiliateLink';
import NewsletterCTA from '@/components/monetization/NewsletterCTA';
import ViewTracker from './_components/ViewTracker';
import { sanitizeHtml } from '@/lib/html-sanitize';
 
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com';
 
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return { title: 'Article Not Found' };
 
  const title = article.title;
  const description = article.body.slice(0, 160).replace(/\n/g, ' ');
  const category = article.categories[0] || 'market';
  const siteUrl = BASE_URL.replace(/\/$/, '');
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&source=${encodeURIComponent(article.source)}`;
 
  return {
    title: `${title} | CryptoBrainNews`,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/news/${id}`,
      siteName: 'CryptoBrainNews',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      type: 'article',
      publishedTime: new Date(article.published_on * 1000).toISOString(),
      authors: [article.author_name || 'CryptoBrain Editorial'],
      tags: article.categories,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      site: '@CryptoBrainNews',
    },
    alternates: { canonical: `${siteUrl}/news/${id}` },
  };
}
 
export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, related, glossary] = await Promise.all([
    getArticleById(id),
    getRelatedArticles(id, 4),
    getSanityGlossary().catch(() => []),
  ]);
 
  if (!article) notFound();
 
  const readingTime = calculateReadingTime(article.body);
  const siteUrl = BASE_URL.replace(/\/$/, '');
 
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.body.slice(0, 160),
    image: [article.image],
    datePublished: new Date(article.published_on * 1000).toISOString(),
    dateModified: new Date(article.published_on * 1000).toISOString(),
    author: [{ '@type': 'Person', name: article.author_name || 'CryptoBrain Editorial' }],
    publisher: {
      '@type': 'Organization',
      name: 'CryptoBrainNews',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/icon-192.png` },
    },
    url: `${siteUrl}/news/${id}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/news/${id}` },
    articleSection: article.categories[0] || 'Crypto',
    keywords: article.categories.join(', '),
  };
 
  return (
    <>
      <Script id="article-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ViewTracker articleId={id} title={article.title} category={article.categories[0] || 'news'} />
      <ReadingProgress />
 
      <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="flex gap-10">
          <StickyShareBar title={article.title} articleId={id} />
 
          <article className="flex-1 min-w-0 max-w-[800px]">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-[#FABF2C] text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                {article.categories[0] || 'Market News'}
              </span>
              <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest">
                {readingTime} min read • {new Date(article.published_on * 1000).toLocaleDateString()}
              </span>
            </div>
 
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-8 text-white uppercase tracking-tighter">
              {article.title}
            </h1>
 
            {article.author_name && (
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#1a1a1a]">
                <div className="w-8 h-8 rounded-full bg-[#FABF2C] flex items-center justify-center text-black font-black text-xs">
                  {article.author_name.charAt(0)}
                </div>
                <div>
                  <Link href={`/authors/${article.author_name.toLowerCase().replace(/\s+/g, "-")}`} className="text-white text-xs font-black uppercase tracking-widest hover:text-[#FABF2C] transition-colors">
                    {article.author_name}
                  </Link>
                  <p className="text-[#555] text-[10px] font-mono">CryptoBrain Editorial</p>
                </div>
              </div>
            )}
 
            <div className="relative w-full aspect-video mb-10 border border-[#1a1a1a] bg-[#0a0a0a]">
              <AppImage src={article.image} alt={article.title} fill className="object-cover" priority />
            </div>
 
            <div className="mb-10 bg-[#080808] border-l-2 border-[#FABF2C] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-white uppercase mb-1">Trade this Alpha</h4>
                <p className="text-xs text-[#888]">Get up to 50% off trading fees with our partners.</p>
              </div>
              <AffiliateLink exchange="mexc" className="bg-[#FABF2C] text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors text-center shrink-0">
                Trade on MEXC
              </AffiliateLink>
            </div>
 
            {/* Render raw HTML if present (AI-generated), sanitized before render */}
            {article.rawHtml ? (
              <div className="prose-article" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.rawHtml) }} />
            ) : (
              <div className="prose prose-invert max-w-none font-sans">
                {article.body.split('\n').map((para: string, idx: number) => (
                  <p key={idx} className="mb-6 text-lg text-[#ccc] leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            )}
 
            {article.sourceType === 'wire' && (
              <div className="mt-8 pt-8 border-t border-[#1a1a1a]">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-[#FABF2C] hover:underline text-xs font-black uppercase tracking-widest">
                  Read Full Story on {article.source} ↗
                </a>
              </div>
            )}
 
            <section className="mt-20 border-t border-[#1a1a1a] pt-16">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10">Related Intelligence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {related.map((rel: WeightedArticle) => (
                  <Link key={rel.id} href={rel.url.startsWith('http') ? rel.url : `/news/${rel.id}`} className="group">
                    <div className="relative aspect-video mb-4 overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a]">
                      <AppImage src={rel.image} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-all" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-[#FABF2C] transition-colors text-sm uppercase leading-snug">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </section>
          </article>
 
          <ArticleSidebar />
        </div>
      </main>
    </>
  );
}
