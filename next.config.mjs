/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'images.cryptocompare.com' },
      { protocol: 'https', hostname: 'resources.cryptocompare.com' },
      { protocol: 'https', hostname: 'img.rocket.new' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: '**.cointelegraph.com' },
      { protocol: 'https', hostname: '**.coindesk.com' },
      { protocol: 'https', hostname: '**.theblock.co' },
      { protocol: 'https', hostname: '**.blockworks.co' },
      { protocol: 'https', hostname: '**.bitcoinmagazine.com' },
      { protocol: 'https', hostname: '**.thedefiant.io' },
      { protocol: 'https', hostname: '**.cryptoslate.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
    dangerouslyAllowSVG: true,
  },
  // Allow Firebase Studio cloudworkstations preview + Replit preview + local dev
  allowedDevOrigins: [
    '*.cloudworkstations.dev',
    '*.riker.replit.dev',
    '*.replit.dev',
    'localhost:3000',
    'localhost:3001',
    'localhost:3002',
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001',
        'localhost:3002',
        'cryptobrainnews.com',
        '*.vercel.app',
        '*.cloudworkstations.dev',
      ],
    },
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'X-Llms-Txt', value: '/llms.txt' },
        { key: 'Link', value: '< /llms.txt >; rel="alternate"; type="text/markdown"' },
      ],
    }];
  },
  async redirects() {
    return [
      { source: '/homepage', destination: '/', permanent: true },
      { source: '/prices', destination: '/price-indexes', permanent: true },
    ];
  },
};
export default nextConfig;
