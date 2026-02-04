import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Breadcrumb from '@/components/common/Breadcrumb';
import HomepageInteractive from './components/HomepageInteractive';
import { getRealNews, getLivePrices } from '@/lib/api';

export const metadata: Metadata = {
  title: 'CryptoBrainNews | Professional Crypto Intelligence',
  description: 'Breaking news, real-time market data, and deep DeFi analytics.',
};

export default async function Homepage() {
  // Parallel Fetch: High Frequency Data + News
  const [news, marketData] = await Promise.all([
    getRealNews(),
    getLivePrices('usd')
  ]);

  // Map Real News to Hero Carousel (Top 3 Stories)
  const carouselSlides = news.slice(0, 3).map((article: any) => ({
    id: String(article.id),
    headline: article.title,
    summary: article.body?.substring(0, 160) + "...",
    image: article.image,
    alt: article.title,
    category: article.source?.toUpperCase() || "BREAKING",
    articleUrl: `/news/${article.id}` // STAYS INTERNAL
  }));

  // Map News to Grid (Remaining Stories)
  const newsArticles = news.slice(3).map((article: any) => ({
    id: String(article.id),
    thumbnail: article.image,
    alt: article.title,
    headline: article.title,
    excerpt: article.body?.substring(0, 100) + "...",
    category: article.source?.toUpperCase() || "NEWS",
    timestamp: "LIVE",
    articleUrl: `/news/${article.id}` // STAYS INTERNAL
  }));

  // Trending Sidebar (Mocked for layout consistency)
  const trendingStories = news.slice(0, 5).map((article: any, i: number) => ({
    id: `t-${i}`,
    headline: article.title,
    category: "TRENDING",
    articleUrl: `/news/${article.id}`,
    isHot: i < 2
  }));

  return (
    <div className="min-h-screen bg-background text-white">
      {/* 1. Newsroom Shell */}
      <Header />
      <PriceTicker />
      
      {/* 2. Main Terminal Content */}
      <div className="pt-4">
        <div className="container mx-auto px-4 lg:px-8">
          <Breadcrumb />
        </div>
        
        {/* 3. Interactive Data & Content Layers */}
        <HomepageInteractive 
          carouselSlides={carouselSlides} 
          newsArticles={newsArticles} 
          trendingStories={trendingStories} 
        />
      </div>
    </div>
  );
}