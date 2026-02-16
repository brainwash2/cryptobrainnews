import React from 'react';
import { notFound } from 'next/navigation';
import { getArticleById, getRelatedArticles, calculateReadingTime } from '@/lib/articles';
import { ReadingProgress } from './_components/ReadingProgress';
import { StickyShareBar } from './_components/StickyShareBar';
import { ArticleSidebar } from './_components/ArticleSidebar';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, related] = await Promise.all([
    getArticleById(id),
    getRelatedArticles(id, 4),
  ]);

  if (!article) notFound();

  return (
    <>
      <ReadingProgress />
      <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="flex gap-10">
          <StickyShareBar title={article.title} articleId={id} />

          <article className="flex-1 min-w-0 max-w-[800px]">
            <span className="inline-block bg-primary text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest mb-6">
              {article.categories[0]}
            </span>

            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-8 text-white uppercase tracking-tighter">
              {article.title}
            </h1>

            <div className="relative w-full aspect-video mb-10 border border-white/5">
              <AppImage src={article.image} alt={article.title} fill className="object-cover" priority />
            </div>

            <div className="prose prose-invert max-w-none">
              {article.body.split('\n').filter(Boolean).map((para, idx) => (
                <p key={idx} className="mb-6 text-lg text-gray-300 leading-relaxed font-body">
                  {para}
                </p>
              ))}
            </div>

            {/* RELATED */}
            <section className="mt-20 border-t border-white/5 pt-16">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10">Related Intelligence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {related.map((rel) => (
                  <Link key={rel.id} href={rel.url.startsWith('http') ? rel.url : `/news/${rel.id}`} className="group">
                    <div className="relative aspect-video mb-4 overflow-hidden border border-white/5">
                       <AppImage src={rel.image} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-all" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-primary transition-colors text-sm uppercase leading-snug">
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
