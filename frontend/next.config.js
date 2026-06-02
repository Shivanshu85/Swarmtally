/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output enables the minimal Docker image (used in frontend/Dockerfile)
  // Comment this out if you are NOT using Docker
  output: 'standalone',

  // Allow the Next.js Image component to load images from the FastAPI backend
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/outputs/**',
      },
      {
        // Render deployment – replace with your actual Render service subdomain
        protocol: 'https',
        hostname: '*.onrender.com',
        pathname: '/outputs/**',
      },
    ],
  },

  // Disable eslint errors during builds (warnings still shown)
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig

