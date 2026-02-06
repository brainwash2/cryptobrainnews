import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Breadcrumb from '@/components/common/Breadcrumb';
import HomepageInteractive from './components/HomepageInteractive';
import { getRealNews } from '@/lib/api';
import { supabase } from '@/lib/supabase-client';

export default async function Homepage() {
  // 1. Fetch Real Industry News from API
  const apiNews = await getRealNews();
  
  // 2. Fetch Internal Analysis from SUPABASE
  const { data: internalArticles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // 3. Merge them: Internal analysis takes priority (Hero Slides)
  const carouselSlides = (internalArticles || []).length > 0 
    ? internalArticles!.map((art: any) => ({
        id: art.id,
        headline: art.title,
        summary: art.content.substring(0, 150) + "...",
        image: art.image_url,
        category: "ANALYSIS",
        articleUrl: `/news/${art.id}` // STAYS INTERNAL
      }))
    : apiNews.slice(0, 3).map((a: any) => ({
        id: a.id,
        headline: a.title,
        summary: a.body.substring(0, 150) + "...",
        image: a.image,
        category: "NEWS",
        articleUrl: `/news/${a.id}` // STAYS INTERNAL
      }));

  const newsArticles = apiNews.slice(3).map((a: any) => ({
    id: a.id,
    thumbnail: a.image,
    headline: a.title,
    excerpt: a.body.substring(0, 100) + "...",
    category: a.source.toUpperCase(),
    timestamp: "Real-time",
    articleUrl: `/news/${a.id}` // STAYS INTERNAL
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header /><PriceTicker />
      <div className="pt-4">
        <div className="container mx-auto px-4 lg:px-8">
          <Breadcrumb />
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