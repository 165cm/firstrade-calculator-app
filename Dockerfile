# Dockerfile
FROM node:18-slim AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# ソースコードのコピー
COPY . .

# プロダクションビルド
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 実行用の軽量イメージ
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED=1

# 非rootユーザーを作成（Cloud Runセキュリティ更新対応）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 必要なファイルのみコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 非rootユーザーに切り替え
USER nextjs

EXPOSE 3000

# スタンドアローンサーバーを起動
CMD ["node", "server.js"]