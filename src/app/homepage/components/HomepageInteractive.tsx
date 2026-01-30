'use client';

import React from 'react';
import HeroCarousel from './HeroCarousel';
import NewsCard from './NewsCard';
import TrendingStories from './TrendingStories';

interface CarouselSlide {
  id: string;
  headline: string;
  summary: string;
  image: string;
  alt: string;
  category: string;
  articleUrl: string;
}

interface NewsArticle {
  id: string;
  thumbnail: string;
  alt: string;
  headline: string;
  excerpt: string;
  category: string;
  timestamp: string;
  articleUrl: string;
}

interface TrendingStory {
  id: string;
  headline: string;
  category: string;
  articleUrl: string;
  isHot: boolean;
}

interface HomepageInteractiveProps {
  carouselSlides: CarouselSlide[];
  newsArticles: NewsArticle[];
  trendingStories: TrendingStory[];
}

const HomepageInteractive = ({
  carouselSlides,
  newsArticles,
  trendingStories,
}: HomepageInteractiveProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Carousel */}
      <section className="mb-8">
        <HeroCarousel slides={carouselSlides} />
      </section>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* News Masonry Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  id={article.id}
                  thumbnail={article.thumbnail}
                  alt={article.alt}
                  headline={article.headline}
                  excerpt={article.excerpt}
                  category={article.category}
                  timestamp={article.timestamp}
                  articleUrl={article.articleUrl}
                />
              ))}
            </div>
          </div>

          {/* Trending Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <TrendingStories stories={trendingStories} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageInteractive;
