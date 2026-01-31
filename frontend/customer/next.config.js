/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Trailing slash for better static hosting
  trailingSlash: true,
}

module.exports = nextConfig
