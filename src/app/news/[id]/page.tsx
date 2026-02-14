import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleById, getRelatedArticles, calculateReadingTime } from '@/lib/api';
import { ReadingProgress } from './_components/ReadingProgress';
import { StickyShareBar } from './_components/StickyShareBar';
import { ArticleSidebar } from './_components/ArticleSidebar';
import Image from 'next/image';
import Link from 'next/link';
import type { NewsArticle } from '@/lib/types';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return { title: 'Article Not Found' };
  return {
    title: article.title,
    description: article.body.slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.body.slice(0, 160),
      images: article.image ? [{ url: article.image }] : [],
      type: 'article',
      publishedTime: new Date(article.published_on * 1000).toISOString(),
    },
  };
}

export default async function NewsArticlePage({ params }: any) {
  const { id } = await params;
  const [article, related] = await Promise.all([
    getArticleById(id), 
    getRelatedArticles(id, 4)
  ]);
  
  if (!article) notFound();

  const readingTime = calculateReadingTime(article.body);
  const publishDate = new Date(article.published_on * 1000).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });

  return (
    <>
      <ReadingProgress />
      <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="flex gap-6 lg:gap-10">
          <StickyShareBar title={article.title} articleId={id} />
          <article className="flex-1 min-w-0 max-w-[780px]">
            {article.categories && article.categories[0] && (
              <span className="inline-block bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest mb-5">
                {article.categories[0]}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] mb-6 text-foreground font-heading">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-primary">CB</div>
              <div>
                <div className="font-semibold text-foreground">CryptoBrain Editorial</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-caption">
                  <time dateTime={new Date(article.published_on * 1000).toISOString()}>{publishDate}</time>
                  <span>·</span>
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>
            {article.image && (
              <figure className="mb-10">
                <div className="relative w-full aspect-video overflow-hidden bg-card">
                  <Image src={article.image} alt={article.title} fill sizes="(max-width: 768px) 100vw, 780px"
                         className="object-cover" priority />
                </div>
                <figcaption className="text-xs text-muted-foreground mt-2 font-caption">Source: {article.source}</figcaption>
              </figure>
            )}
            <div className="article-body prose prose-invert prose-lg max-w-none">
              {article.body.split('\n').filter(Boolean).map((para: string, idx: number) => (
                <p key={idx} className="mb-6 text-[17px] leading-[1.85] text-foreground/90 font-body">{para}</p>
              ))}
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
                {article.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 text-xs bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer font-caption">#{tag}</span>
                ))}
              </div>
            )}
            <div className="mt-10 p-6 bg-card border border-border">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary border-2 border-primary flex items-center justify-center text-lg font-bold text-primary shrink-0">CB</div>
                <div>
                  <h4 className="font-bold text-foreground mb-1 font-heading text-lg">CryptoBrain Editorial</h4>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    Our editorial team combines on‑chain analytics with institutional market intelligence.
                  </p>
                </div>
              </div>
            </div>
            {related.length > 0 && (
              <section className="mt-14">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 font-heading">
                  <span className="w-8 h-0.5 bg-primary" /> Related Stories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {related.map((rel: NewsArticle) => (
                    <Link key={rel.id} href={`/news/${rel.id}`} className="group block bg-card border border-border hover:border-primary/50 transition-colors overflow-hidden">
                      {rel.image && (
                        <div className="relative aspect-video">
                          <Image src={rel.image} alt={rel.title} fill sizes="(max-width: 768px) 100vw, 380px"
                                 className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 font-heading">
                          {rel.title}
                        </h4>
                        <span className="text-xs text-muted-foreground mt-2 block font-caption">{rel.source}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
          <ArticleSidebar />
        </div>
      </main>
    </>
  );
}
