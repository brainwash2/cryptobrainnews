import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'images.cryptocompare.com' },
      { protocol: 'https', hostname: 'img.rocket.new' }, // Keep for legacy mock data
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*'], // Required for IDX/Vercel flexibility
    },
  },
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
  // Redirects (Consolidating Routes)
  async redirects() {
    return [
      { source: '/homepage', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
