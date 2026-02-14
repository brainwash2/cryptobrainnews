import React from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import HomepageInteractive from './components/HomepageInteractive';
import { getRealNews } from '@/lib/api';

export default async function Homepage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  let news = await getRealNews();

  // Filter news if a category is selected (e.g., BTC, ETH, DEFI)
  if (category) {
    const term = category.toUpperCase();
    news = news.filter(a => 
      a.categories?.some(c => c.toUpperCase().includes(term)) || 
      a.title.toUpperCase().includes(term) ||
      a.body.toUpperCase().includes(term)
    );
  }

  const carouselSlides = news.slice(0, 3).map(a => ({
    id: a.id,
    headline: a.title,
    summary: a.body.substring(0, 150) + "...",
    image: a.image,
    alt: a.title,
    category: 'NEWS',
    articleUrl: `/news/${a.id}`,
  }));

  const newsArticles = news.slice(3).map(a => ({
    id: a.id,
    thumbnail: a.image,
    alt: a.title,
    headline: a.title,
    excerpt: a.body.substring(0, 100) + "...",
    category: a.source.toUpperCase(),
    timestamp: new Date(a.published_on * 1000).toLocaleDateString(),
    articleUrl: `/news/${a.id}`,
  }));

  const trendingStories = news.slice(0, 5).map((a, i) => ({
    id: a.id,
    headline: a.title,
    category: a.source.toUpperCase(),
    articleUrl: `/news/${a.id}`,
    isHot: i < 2,
  }));

  return (
    <div className="container mx-auto px-4 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb />
        {category && (
          <span className="text-[10px] font-black bg-primary text-black px-2 py-1 uppercase tracking-widest">
            Filtering: {category}
          </span>
        )}
      </div>
      <HomepageInteractive
        carouselSlides={carouselSlides}
        newsArticles={newsArticles}
        trendingStories={trendingStories}
      />
    </div>
  );
}
