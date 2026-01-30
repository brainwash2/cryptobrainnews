import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface TrendingStory {
  id: string;
  headline: string;
  category: string;
  articleUrl: string;
  isHot: boolean;
}

interface TrendingStoriesProps {
  stories: TrendingStory[];
}

const TrendingStories = ({ stories }: TrendingStoriesProps) => {
  return (
    <aside className="bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="FireIcon" size={24} className="text-primary" />
        <h2 className="text-2xl font-bold text-foreground font-heading">
          Trending Stories
        </h2>
      </div>
      <div className="space-y-4">
        {stories.map((story, index) => (
          <Link
            key={story.id}
            href={story.articleUrl}
            className="block group"
          >
            <article className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-muted text-foreground font-bold font-data text-sm">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs font-bold font-caption">
                    {story.category}
                  </span>
                  {story.isHot && (
                    <Icon name="FireIcon" size={16} className="text-error" />
                  )}
                </div>
                <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-smooth line-clamp-2">
                  {story.headline}
                </h3>
              </div>
            </article>
          </Link>
        ))}
      </div>
      <Link
        href="/homepage"
        className="block mt-6 text-center py-3 border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth font-medium text-sm"
      >
        View All Trending
      </Link>
    </aside>
  );
};

export default TrendingStories;
