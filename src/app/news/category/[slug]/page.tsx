export const revalidate = 120;

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticlesByCategory } from '@/lib/articles';
import { NEWS_CATEGORIES } from '@/lib/news-categories';
import CointelegraphCard from '@/components/news/CointelegraphCard';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }>; }

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  market:       'Price action, macro trends, and institutional trading signals.',
  bitcoin:      'BTC network data, miner activity, and Bitcoin-native developments.',
  ethereum:     'ETH staking, L2 ecosystem, and Ethereum protocol upgrades.',
  defi:         'Protocols, liquidity, yield strategies, and on-chain activity.',
  nft:          'Collections, marketplace volume, and digital asset culture.',
  regulation:   'Policy, enforcement actions, and compliance developments worldwide.',
  research:     'Deep-dive analysis, on-chain data, and institutional reports.',
  layer2:       'Rollups, bridges, fee markets, and L2 adoption metrics.',
  rwa:          'Tokenized real-world assets, bonds, credit, and TradFi convergence.',
  'ai-crypto':  'AI agents, DePAI protocols, and the x402 machine economy.',
  stablecoins:  'USDT, USDC, yield-bearing stables, and algorithmic designs.',
  institutional:'ETFs, corporate treasuries, BlackRock, JPMorgan, and TradFi.',
  restaking:    'EigenLayer, EtherFi, liquid restaking, and AVS economics.',
  depin:        'Decentralized physical infrastructure — Helium, Render, and more.',
  prediction:   'Polymarket, Kalshi, and onchain prediction market outcomes.',
  'bitcoin-l2': 'Stacks, Lightning Network, Rootstock, and Bitcoin scaling.',
};

const CATEGORY_ICONS: Record<string, string> = {
  market:       '📈',
  bitcoin:      '₿',
  ethereum:     'Ξ',
  defi:         '🔄',
  nft:          '🖼',
  regulation:   '⚖️',
  research:     '🔬',
  layer2:       '⚡',
  rwa:          '🏦',
  'ai-crypto':  '🤖',
  stablecoins:  '💵',
  institutional:'🏛',
  restaking:    '🔗',
  depin:        '📡',
  prediction:   '🎯',
  'bitcoin-l2': '⚡',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = NEWS_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return { title: 'Category Not Found' };
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com';
  return {
    title: `${cat.label} News | CryptoBrainNews`,
    description: CATEGORY_DESCRIPTIONS[slug] || `Latest ${cat.label} news and analysis from top crypto sources.`,
    openGraph: {
      title: `${cat.label} News`,
      description: CATEGORY_DESCRIPTIONS[slug] || `Latest ${cat.label} news and analysis.`,
      url: `${BASE}/news/category/${slug}`,
      images: [{ url: `${BASE}/api/og?title=${encodeURIComponent(cat.label + ' News')}&category=${slug}`, width: 1200, height: 630 }],
    },
  };
}

export async function generateStaticParams() {
  return NEWS_CATEGORIES.map(cat => ({ slug: cat.slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = NEWS_CATEGORIES.find(c => c.slug === slug);
  if (!cat) notFound();

  const articles = await getArticlesByCategory(slug);
  const icon = CATEGORY_ICONS[slug] || '📰';
  const description = CATEGORY_DESCRIPTIONS[slug];

  return (
    <main className="min-h-screen bg-[#050505] font-sans">
      <div className="py-10 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* Category header */}
          <div className="mb-10 border-b border-[#1a1a1a] pb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#555] border border-[#1a1a1a] px-2 py-1">
                Category
              </span>
              <span className="text-[10px] font-mono text-[#555]">{icon}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
                  <span className="text-[#FABF2C]">{cat.label}</span> News
                </h1>
                {description && (
                  <p className="text-[#555] font-mono text-xs leading-relaxed max-w-xl">
                    {description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-widest border border-[#1a1a1a] text-[#555] px-3 py-1.5">
                  {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                </span>
              </div>
            </div>

            {/* Sibling category quick-links */}
            <div className="flex flex-wrap gap-2 mt-6">
              {NEWS_CATEGORIES.filter(c => c.slug !== slug).slice(0, 8).map(c => (
                <Link
                  key={c.slug}
                  href={`/news/category/${c.slug}`}
                  className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border border-[#1a1a1a] text-[#555] hover:border-[#FABF2C] hover:text-[#FABF2C] transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map(article => (
              <CointelegraphCard key={article.id} article={article} />
            ))}
          </div>

          {articles.length === 0 && (
            <div className="py-32 text-center border border-dashed border-[#1a1a1a]">
              <p className="text-[#555] font-mono text-xs uppercase tracking-widest animate-pulse">
                Loading {cat.label} intelligence…
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
