/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'images.cryptocompare.com' },
      { protocol: 'https', hostname: 'resources.cryptocompare.com' },
      { protocol: 'https', hostname: 'resources.cryptocompare.com' },
      { protocol: 'https', hostname: 'img.rocket.new' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
    ],
    dangerouslyAllowSVG: true,
  },
  allowedDevOrigins: ['*.cloudworkstations.dev'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'cryptobrainnews.com', '*.vercel.app'],
    },
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    }];
  },
  async redirects() {
    return [{ source: '/homepage', destination: '/', permanent: true }];
  },
};
export default nextConfig;
