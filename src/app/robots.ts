import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow:[
        '/dashboard/',       // Protect private operator data
        '/api/',             // Protect raw API endpoints
        '/admin/',           // Protect Sanity studio/admin routes
        '/_next/',           // Protect internal Next.js assets
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
