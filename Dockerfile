FROM node:18-slim AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# ソースコードのコピー
COPY . .

# プロダクションビルド
RUN npm run build

# 実行用の軽量イメージ
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# 必要なファイルのみコピー
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# プロダクション依存関係のみインストール
RUN npm ci --only=production

EXPOSE 3000

# スタンドアローンサーバーを起動
CMD ["node", "server.js"]