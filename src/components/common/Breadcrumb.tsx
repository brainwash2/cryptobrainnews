'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items && items.length > 0) {
      return items;
    }

    // Start with Home
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/homepage' }
    ];

    // Split path, filtering out empty strings
    const pathSegments = pathname.split('/').filter(segment => segment);

    // Map for pretty labels
    const pathMap: Record<string, string> = {
      'homepage': 'Home',
      'price-indexes': 'Price Indexes',
      'markets-overview': 'Markets Overview',
      'de-fi-analytics': 'DeFi Analytics',
      'article-reader': 'Article Reader'
    };

    let currentPath = '';
    
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      
      // Prevent adding "Home" twice if we are on /homepage
      if (currentPath === '/homepage') return;

      const label = pathMap[segment] || segment.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  // If we are just on Home, don't show breadcrumbs
  if (breadcrumbItems.length <= 1 && pathname === '/homepage') {
    return null;
  }

  return (
    <nav 
      className={`flex items-center gap-2 py-4 text-sm font-caption ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={item.path}>
            {!isFirst && (
              <Icon 
                name="ChevronRightIcon" 
                size={16} 
                className="text-muted-foreground" 
              />
            )}
            {isLast ? (
              <span 
                className="text-primary font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.path}
                className="text-muted-foreground hover:text-foreground transition-smooth"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
