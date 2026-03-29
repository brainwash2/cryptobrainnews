import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllSanityAuthors } from '@/lib/sanity';
import AppImage from '@/components/ui/AppImage';
 
const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com').replace(/\/$/, '');
 
export const metadata: Metadata = {
  title: 'About CryptoBrainNews | Institutional Crypto Intelligence',
  description: 'CryptoBrainNews is an institutional-grade crypto intelligence terminal combining real-time news, on-chain data, and AI analysis.',
  alternates: { canonical: `${BASE}/about` },
};
 
export const revalidate = 3600;
 
export default async function AboutPage() {
  const authors = await getAllSanityAuthors().catch(() => []);
 
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'CryptoBrainNews',
    url: BASE,
    logo: { '@type': 'ImageObject', url: `${BASE}/icon-192.png` },
    description: 'Institutional-grade crypto intelligence terminal.',
    foundingDate: '2024',
    masthead: `${BASE}/about`,
    actionAccessibilityRequirement: {
      '@type': 'ActionAccessSpecification',
      category: 'free',
      availabilityStarts: '2024-01-01',
    },
  };
 
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
        <div className="max-w-[900px] mx-auto">
 
          {/* Header */}
          <div className="mb-16 pb-10 border-b border-[#1a1a1a]">
            <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-2">About</p>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-6">
              CryptoBrain<span className="text-[#FABF2C]">News</span>
            </h1>
            <p className="text-[#888] font-mono text-sm leading-relaxed max-w-2xl">
              CryptoBrainNews is an institutional-grade crypto intelligence terminal delivering
              real-time market news, on-chain data analysis, and AI-powered briefings to
              traders, analysts, and protocol teams worldwide.
            </p>
          </div>
 
          {/* Mission */}
          <section className="mb-16">
            <h2 className="text-xs font-black text-[#FABF2C] uppercase tracking-[0.3em] mb-6">Our Mission</h2>
            <div className="border-l-2 border-[#FABF2C] pl-6 space-y-4">
              <p className="text-[#ccc] leading-relaxed">
                We combine editorial journalism with AI-powered data pipelines to give
                crypto professionals the signal, not the noise. Every article is fact-checked
                against on-chain data and published with a named author accountable for their analysis.
              </p>
              <p className="text-[#ccc] leading-relaxed">
                Our coverage spans breaking market news, DeFi protocol analysis, regulatory
                developments, and institutional on-chain flows — curated for professionals
                who need depth, not headlines.
              </p>
            </div>
          </section>
 
          {/* Editorial standards */}
          <section className="mb-16">
            <h2 className="text-xs font-black text-[#FABF2C] uppercase tracking-[0.3em] mb-6">Editorial Standards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Named Authors', desc: 'Every piece is published under a named analyst or journalist accountable for its content.' },
                { title: 'On-Chain Verification', desc: 'Price and volume claims are verified against live blockchain data before publication.' },
                { title: 'Source Disclosure', desc: 'Wire articles clearly indicate their external source. Editorial content is original.' },
                { title: 'Correction Policy', desc: 'Errors are corrected promptly and transparently with a note in the article.' },
              ].map(item => (
                <div key={item.title} className="border border-[#1a1a1a] p-5 bg-[#0a0a0a]">
                  <h3 className="text-white font-black uppercase text-xs tracking-widest mb-2">{item.title}</h3>
                  <p className="text-[#888] font-mono text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
 
          {/* Team */}
          {(authors as any[]).length > 0 && (
            <section className="mb-16">
              <h2 className="text-xs font-black text-[#FABF2C] uppercase tracking-[0.3em] mb-6">Editorial Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(authors as any[]).map(author => (
                  <Link
                    key={author._id}
                    href={`/authors/${author.slug}`}
                    className="flex items-center gap-4 border border-[#1a1a1a] p-4 bg-[#0a0a0a] group hover:border-[#FABF2C]/30 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#1a1a1a] bg-[#111] shrink-0">
                      {author.avatarUrl ? (
                        <AppImage src={author.avatarUrl} alt={author.name} fill />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#FABF2C] text-black font-black text-lg">
                          {author.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-black uppercase text-xs group-hover:text-[#FABF2C] transition-colors">{author.name}</p>
                      <p className="text-[#555] font-mono text-[10px] mt-0.5">{author.role || 'Contributor'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
 
          {/* Contact */}
          <section className="border-t border-[#1a1a1a] pt-10">
            <h2 className="text-xs font-black text-[#FABF2C] uppercase tracking-[0.3em] mb-6">Contact</h2>
            <div className="font-mono text-xs text-[#888] space-y-2">
              <p>Editorial: <a href="mailto:editorial@cryptobrainnews.com" className="text-[#FABF2C] hover:underline">editorial@cryptobrainnews.com</a></p>
              <p>Press & Partnerships: <a href="mailto:press@cryptobrainnews.com" className="text-[#FABF2C] hover:underline">press@cryptobrainnews.com</a></p>
              <p>Advertising: <Link href="/advertise" className="text-[#FABF2C] hover:underline">View media kit →</Link></p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
