import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.vercel.app';

  // Core public routes to index
  const routes =[
    '',
    '/news',
    '/data/markets/spot',
    '/prices',
    '/events',
    '/airdrops',
    '/learning',
    '/pricing',
    '/docs',
    '/agent-registry',
    '/agent-registry/sandbox',
    '/agent-registry/analytics'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/news' ? 'hourly' : 'daily',
    priority: route === '' ? 1.0 : route.startsWith('/docs') ? 0.9 : 0.8,
  }));
}
