import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Breadcrumb from '@/components/common/Breadcrumb';
import HomepageInteractive from './components/HomepageInteractive';
import { getRealNews } from '@/lib/api';

export default async function Homepage({ searchParams }: any) {
  // Handle URL params like /homepage?cat=btc
  const params = await searchParams;
  const category = params.cat || '';

  const news = await getRealNews(category);

  // Layout logic: Top 3 are Hero, next 12 are Grid
  const carouselSlides = news.slice(0, 3).map((article: any) => ({
    id: String(article.id),
    headline: article.title,
    summary: article.body.substring(0, 160) + "...",
    image: article.image,
    category: category ? category.toUpperCase() : article.source.toUpperCase(),
    articleUrl: `/news/${article.id}` // Always Internal
  }));

  const newsArticles = news.slice(3).map((article: any) => ({
    id: String(article.id),
    thumbnail: article.image,
    headline: article.title,
    excerpt: article.body.substring(0, 100) + "...",
    category: article.source.toUpperCase(),
    timestamp: "Real-time",
    articleUrl: `/news/${article.id}` // Always Internal
  }));

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <PriceTicker />
      <div className="pt-4">
        <div className="container mx-auto px-4 lg:px-8">
          <Breadcrumb />
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary">
              {category ? `${category} Intelligence` : "Global News Feed"}
            </h2>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>
        </div>
        <HomepageInteractive 
          carouselSlides={carouselSlides} 
          newsArticles={newsArticles} 
          trendingStories={[]} 
        />
      </div>
    </div>
  );
}
