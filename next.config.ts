// next.config.ts

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // App Router is default in Next.js 16
  // Turbopack is the default bundler in Next.js 16
  experimental: {
    // Enable server actions (stable in Next.js 16)
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

export default nextConfig