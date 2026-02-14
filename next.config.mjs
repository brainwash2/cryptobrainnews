/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack settings
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // Whitelist external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resources.cryptocompare.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
      }
    ],
  },
  
  // Cloud Workstation fix (Keep this from previous steps)
  experimental: {
    allowedDevOrigins: ['*.cloudworkstations.dev', 'localhost:3000'],
  },
};

export default nextConfig;
