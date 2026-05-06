/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabaseusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
  },
  optimizeFonts: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
    ],
  },
};

module.exports = nextConfig;
