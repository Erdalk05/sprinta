import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@sprinta/shared', '@sprinta/api'],
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
