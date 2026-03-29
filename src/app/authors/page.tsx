import React from 'react';
import Link from 'next/link';
import { getAllSanityAuthors } from '@/lib/sanity';
import AppImage from '@/components/ui/AppImage';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Our Authors | CryptoBrainNews',
  description: 'Meet the analysts and editors behind CryptoBrainNews institutional crypto intelligence.',
};

export default async function AuthorsPage() {
  const authors = await getAllSanityAuthors().catch(() => []);

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12 border-b border-[#1a1a1a] pb-6">
          <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-1">Editorial</p>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Our <span className="text-[#FABF2C]">Authors</span>
          </h1>
          <p className="text-[#555] font-mono text-xs mt-2">
            Institutional analysts, on-chain researchers, and crypto journalists.
          </p>
        </div>

        {authors.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#1a1a1a]">
            <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
              No authors yet — add them in Sanity Studio
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(authors as any[]).map(author => (
              <Link
                key={author._id}
                href={`/authors/${author.slug}`}
                className="group border border-[#1a1a1a] p-6 hover:border-[#FABF2C]/30 transition-colors bg-[#0a0a0a]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#1a1a1a] bg-[#111] shrink-0">
                    {author.avatarUrl ? (
                      <AppImage src={author.avatarUrl} alt={author.name} fill />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#FABF2C] text-black font-black text-xl">
                        {author.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-white font-black uppercase tracking-tight group-hover:text-[#FABF2C] transition-colors">
                      {author.name}
                    </h2>
                    {author.role && (
                      <p className="text-[#FABF2C] text-[9px] font-mono uppercase tracking-widest mt-0.5">
                        {author.role}
                      </p>
                    )}
                  </div>
                </div>
                {author.bio && (
                  <p className="text-[#888] text-xs font-mono leading-relaxed line-clamp-3">
                    {author.bio}
                  </p>
                )}
                {author.twitter && (
                  <p className="text-[#555] text-[10px] font-mono mt-3">@{author.twitter}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
