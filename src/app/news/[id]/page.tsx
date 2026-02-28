import React from 'react';
import { notFound } from 'next/navigation';
import { getArticleById, getRelatedArticles, calculateReadingTime } from '@/lib/articles';
import { ReadingProgress } from './_components/ReadingProgress';
import { StickyShareBar } from './_components/StickyShareBar';
import { ArticleSidebar } from './_components/ArticleSidebar';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import type { Metadata } from 'next';

// Monetization Components
import AdUnit from '@/components/monetization/AdUnit';
import AffiliateLink from '@/components/monetization/AffiliateLink';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return { title: 'Article Not Found' };
  return { title: `${article.title} | CryptoBrainNews` };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, related] = await Promise.all([
    getArticleById(id),
    getRelatedArticles(id, 4),
  ]);

  if (!article) notFound();

  const readingTime = calculateReadingTime(article.body);
  const paragraphs = article.body.split('\n').filter(Boolean);

  return (
    <>
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

            <div className="relative w-full aspect-video mb-10 border border-[#1a1a1a] bg-[#0a0a0a]">
              <AppImage src={article.image} alt={article.title} fill className="object-cover" priority />
            </div>

            {/* Affiliate Callout Block */}
            <div className="mb-10 bg-[#080808] border-l-2 border-[#FABF2C] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-white uppercase mb-1">Trade this Alpha</h4>
                <p className="text-xs text-[#888]">Get up to 50% off trading fees with our partners.</p>
              </div>
              <AffiliateLink exchange="mexc" className="bg-[#FABF2C] text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors text-center shrink-0">
                Trade on MEXC
              </AffiliateLink>
            </div>

            <div className="prose prose-invert max-w-none font-sans">
              {paragraphs.map((para, idx) => (
                <React.Fragment key={idx}>
                  <p className="mb-6 text-lg text-[#ccc] leading-relaxed">
                    {para}
                  </p>
                  {/* Inject an Ad after the 2nd paragraph */}
                  {idx === 1 && <AdUnit />}
                </React.Fragment>
              ))}
            </div>

            {/* Link to original source if it's wire content */}
            {article.sourceType === 'wire' && (
              <div className="mt-8 pt-8 border-t border-[#1a1a1a]">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-[#FABF2C] hover:underline text-xs font-black uppercase tracking-widest">
                  Read Full Story on {article.source} ↗
                </a>
              </div>
            )}

            <section className="mt-20 border-t border-[#1a1a1a] pt-16">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10">
                Related Intelligence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {related.map((rel) => (
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
