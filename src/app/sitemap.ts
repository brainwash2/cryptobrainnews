import { MetadataRoute } from 'next';
import { getLivePrices } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.vercel.app';

  // Static Pages
  const staticRoutes = ['', '/news', '/data/markets/spot', '/price-indexes', '/events', '/airdrops'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Coin Pages (Top 100 for SEO)
  try {
    const coins = await getLivePrices();
    const coinRoutes = coins.map((coin) => ({
      url: `${baseUrl}/coins/${coin.id.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    }));
    return [...staticRoutes, ...coinRoutes];
  } catch (error) {
    return staticRoutes;
  }
}
