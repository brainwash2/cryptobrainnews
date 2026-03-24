export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import SearchResultsClient from './_components/SearchResultsClient';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q} | CryptoBrainNews` : 'Search | CryptoBrainNews' };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 border-b border-[#1a1a1a] pb-6">
          <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-1">Search</p>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            {q ? (
              <>Results for <span className="text-[#FABF2C]">&ldquo;{q}&rdquo;</span></>
            ) : (
              <>Search <span className="text-[#FABF2C]">Intelligence</span></>
            )}
          </h1>
        </div>

        <Suspense fallback={
          <div className="py-20 text-center">
            <p className="text-[#555] font-mono text-xs uppercase tracking-widest animate-pulse">
              Scanning wire…
            </p>
          </div>
        }>
          <SearchResultsClient initialQuery={q} />
        </Suspense>
      </div>
    </main>
  );
}
