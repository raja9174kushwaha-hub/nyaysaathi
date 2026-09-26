/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    },
  ],
}

export default nextConfig
