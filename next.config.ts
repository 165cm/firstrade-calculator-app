// next.config.ts
const nextConfig = {
  output: 'standalone',
  typescript: {
    // ビルド時の型チェックを無効化
    ignoreBuildErrors: true,
  },
  eslint: {
    // ビルド時のESLintチェックを無効化
    ignoreDuringBuilds: true,
  },
}

export default nextConfig;