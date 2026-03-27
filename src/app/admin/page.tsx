export const dynamic = 'force-dynamic';
 
import React from 'react';
import { getAllPostsAdmin } from '@/lib/sanity';
import Link from 'next/link';
 
const STUDIO_URL = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
  `https://cryptobrainnews.sanity.studio`;
 
const STATUS_STYLES: Record<string, string> = {
  published: 'bg-[#00d672]/10 text-[#00d672] border-[#00d672]/30',
  draft:     'bg-[#FABF2C]/10 text-[#FABF2C] border-[#FABF2C]/30',
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  archived:  'bg-[#333] text-[#555] border-[#444]',
};
 
export default async function AdminPage() {
  let posts: any[] = [];
  let fetchError = '';
 
  try {
    posts = await getAllPostsAdmin();
  } catch (err: any) {
    fetchError = err.message || 'Failed to fetch posts. Check SANITY_API_TOKEN.';
  }
 
  const published  = posts.filter(p => p.status === 'published').length;
  const drafts     = posts.filter(p => p.status === 'draft').length;
  const scheduled  = posts.filter(p => p.status === 'scheduled').length;
 
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1200px] mx-auto">
 
        {/* Header */}
        <div className="flex items-end justify-between mb-10 border-b border-[#1a1a1a] pb-6">
          <div>
            <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-1">Internal</p>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
              Editorial <span className="text-[#FABF2C]">Dashboard</span>
            </h1>
          </div>
          <a
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FABF2C] text-black px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
          >
            Open Sanity Studio ↗
          </a>
        </div>
 
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Posts', value: posts.length, color: 'text-white' },
            { label: 'Published',   value: published,    color: 'text-[#00d672]' },
            { label: 'Drafts',      value: drafts,       color: 'text-[#FABF2C]' },
            { label: 'Scheduled',   value: scheduled,    color: 'text-blue-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
              <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-2">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
 
        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-10">
          <a
            href={`${STUDIO_URL}/desk/post`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#111] border border-[#333] text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:border-[#FABF2C] transition-colors"
          >
            + New Article
          </a>
          <a
            href={`${STUDIO_URL}/desk/author`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#111] border border-[#333] text-[#888] px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:border-[#FABF2C] transition-colors"
          >
            Manage Authors
          </a>
          <Link
            href="/news"
            className="flex items-center gap-2 bg-[#111] border border-[#333] text-[#888] px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:border-[#FABF2C] transition-colors"
          >
            View Live News →
          </Link>
        </div>
 
        {/* Error state */}
        {fetchError && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 mb-6 font-mono text-xs">
            ⚠ {fetchError}
            <p className="mt-1 text-[#555]">Make sure SANITY_API_TOKEN is set in your .env.local</p>
          </div>
        )}
 
        {/* Posts table */}
        <div className="border border-[#1a1a1a]">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#0a0a0a] border-b border-[#1a1a1a]">
            <span className="col-span-5 text-[9px] font-black text-[#555] uppercase tracking-widest">Title</span>
            <span className="col-span-2 text-[9px] font-black text-[#555] uppercase tracking-widest">Category</span>
            <span className="col-span-2 text-[9px] font-black text-[#555] uppercase tracking-widest">Status</span>
            <span className="col-span-2 text-[9px] font-black text-[#555] uppercase tracking-widest">Date</span>
            <span className="col-span-1 text-[9px] font-black text-[#555] uppercase tracking-widest">Edit</span>
          </div>
 
          {posts.length === 0 && !fetchError && (
            <div className="px-4 py-12 text-center">
              <p className="text-[#555] font-mono text-xs">No posts found. Create your first article in Sanity Studio.</p>
            </div>
          )}
 
          {posts.map((post, i) => (
            <div
              key={post._id}
              className={`grid grid-cols-12 gap-4 px-4 py-3 items-center border-b border-[#0f0f0f] hover:bg-[#0a0a0a] transition-colors ${i % 2 === 0 ? '' : 'bg-[#050505]'}`}
            >
              <div className="col-span-5">
                <p className="text-white text-xs font-bold truncate leading-snug">{post.title || 'Untitled'}</p>
                {post.authorName && (
                  <p className="text-[#555] text-[10px] font-mono mt-0.5">{post.authorName}</p>
                )}
              </div>
              <div className="col-span-2">
                <span className="text-[9px] font-black text-[#888] uppercase tracking-widest bg-[#111] px-2 py-0.5 border border-[#222]">
                  {post.category || '—'}
                </span>
              </div>
              <div className="col-span-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${STATUS_STYLES[post.status] || STATUS_STYLES.draft}`}>
                  {post.status || 'draft'}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-[#555] text-[10px] font-mono">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : new Date(post._createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="col-span-1">
                <a
                  href={`${STUDIO_URL}/desk/post;${post._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FABF2C] text-[10px] font-black hover:text-white transition-colors uppercase"
                >
                  Edit ↗
                </a>
              </div>
            </div>
          ))}
        </div>
 
        {/* RSS Import section */}
        <div className="mt-10 border border-[#1a1a1a] p-6">
          <h2 className="text-xs font-black text-white uppercase tracking-widest mb-4">
            RSS → Sanity Importer
          </h2>
          <p className="text-[#555] font-mono text-xs mb-4">
            Use this endpoint to import RSS articles as Sanity drafts:
          </p>
          <pre className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 text-[11px] font-mono text-[#888] overflow-x-auto">
{`curl -X POST /api/admin/import-rss \\
  -H "Content-Type: application/json" \\
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \\
  -d '{
    "feedUrl": "https://cointelegraph.com/rss",
    "category": "market",
    "dryRun": true
  }'`}
          </pre>
          <p className="text-[#333] font-mono text-[10px] mt-3">
            Set ADMIN_SECRET and SANITY_API_TOKEN in .env.local to enable writes.
          </p>
        </div>
      </div>
    </main>
  );
}
