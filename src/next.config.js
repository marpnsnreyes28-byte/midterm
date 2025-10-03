/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable the app directory
    appDir: true,
  },
  // Configure image domains if needed
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: true, // For development/static export
  },
  // Ensure client-side rendering for dynamic components
  output: 'standalone',
  // Configure for potential static export
  trailingSlash: true,
  // Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;