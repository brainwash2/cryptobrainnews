import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface NewsCardProps {
  id: string;
  thumbnail: string;
  alt: string;
  headline: string;
  excerpt: string;
  category: string;
  timestamp: string;
  articleUrl: string;
}

const NewsCard = ({
  id,
  thumbnail,
  alt,
  headline,
  excerpt,
  category,
  timestamp,
  articleUrl,
}: NewsCardProps) => {
  return (
    <Link href={articleUrl} className="block group">
      <article className="bg-card border border-border overflow-hidden transition-smooth hover:border-primary">
        <div className="relative h-48 overflow-hidden">
          <AppImage
            src={thumbnail}
            alt={alt}
            fill
            className="object-cover transition-smooth group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold font-caption">
              {category}
            </span>
            <span className="text-xs text-muted-foreground font-caption">
              {timestamp}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3 font-heading line-clamp-2 group-hover:text-primary transition-smooth">
            {headline}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
          <div className="flex items-center gap-2 mt-4 text-primary text-sm font-medium">
            <span>Read More</span>
            <Icon name="ArrowRightIcon" size={16} />
          </div>
        </div>
      </article>
    </Link>
  );
};

export default NewsCard;
