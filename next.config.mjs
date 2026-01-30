/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*.cloudworkstations.dev', 'localhost:3000'],
    },
  },
};
export default nextConfig;
