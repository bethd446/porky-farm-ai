/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript - ignorer les erreurs de build pour le moment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint - ignorer les erreurs de build pour le moment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Images - configuration pour production
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'blob.v0.app',
      },
    ],
  },
  
  // Headers de securite supplementaires
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ]
  },
  
  // Redirections pour SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/app',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
  
  // Optimisations de production
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Compression
  compress: true,
}

export default nextConfig
