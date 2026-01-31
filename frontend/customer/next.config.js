/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disabled static export due to dynamic routes
  // output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Trailing slash for better static hosting
  trailingSlash: true,
}

module.exports = nextConfig
