'use client';
import React from 'react';

export default function ArticleReaderInteractive({ article }: any) {
  return (
    <div className="max-w-3xl mx-auto bg-card border border-border p-8 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <span className="bg-primary text-black px-2 py-1 text-xs font-bold uppercase">{article.category}</span>
        <span className="text-gray-400 text-sm">{article.publishedDate}</span>
      </div>
      <h1 className="text-4xl font-serif font-bold text-white mb-8">{article.title}</h1>
      <div className="prose prose-invert max-w-none">
        {article.content.map((block: any, i: number) => (
          <div key={i} className="mb-4">
            {block.type === 'heading' ? <h2 className="text-2xl font-bold mt-8 mb-4">{block.text}</h2> : <p className="text-gray-300 leading-relaxed">{block.text}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
