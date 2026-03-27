import React from 'react';
import type { Metadata } from 'next';
import BookmarksClient from './_components/BookmarksClient';
 
export const metadata: Metadata = {
  title: 'Saved Articles | CryptoBrainNews',
  description: 'Your personal reading list of saved crypto articles.',
};
 
export default function BookmarksPage() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 border-b border-[#1a1a1a] pb-6">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Saved <span className="text-[#FABF2C]">Articles</span>
          </h1>
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest mt-1">
            Your personal reading list
          </p>
        </div>
        <BookmarksClient />
      </div>
    </main>
  );
}
