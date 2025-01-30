// next.config.ts
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  headers: async () => [
    {
      source: '/service-worker.js',
      headers: [
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
        {
          key: 'Cache-Control',
          value: 'no-store, max-age=0',
        },
      ],
    },
  ],
};

export default nextConfig;