import React from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import HomepageInteractive from './components/HomepageInteractive';
import { getRealNews } from '@/lib/api';
import { supabase } from '@/lib/supabase-client';

export default async function Homepage() {
  const apiNews = await getRealNews();
  const { data: internalArticles } = await supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(5);

  const carouselSlides = (internalArticles || []).length > 0 
    ? internalArticles!.map((art: any) => ({
        id: art.id,
        headline: art.title,
        summary: art.content.substring(0, 150) + "...",
        image: art.image_url,
        category: "ANALYSIS",
        articleUrl: `/news/${art.id}`
      }))
    : apiNews.slice(0, 3).map((a: any) => ({
        id: a.id,
        headline: a.title,
        summary: a.body.substring(0, 150) + "...",
        image: a.image,
        category: "NEWS",
        articleUrl: `/news/${a.id}`
      }));

  const newsArticles = apiNews.slice(3).map((a: any) => ({
    id: a.id,
    thumbnail: a.image,
    headline: a.title,
    excerpt: a.body.substring(0, 100) + "...",
    category: a.source.toUpperCase(),
    timestamp: "Real-time",
    articleUrl: `/news/${a.id}`
  }));

  return (
    <div className="pt-4">
      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumb />
        <HomepageInteractive carouselSlides={carouselSlides} newsArticles={newsArticles} trendingStories={[]} />
      </div>
    </div>
  );
}
