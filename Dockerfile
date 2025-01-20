FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 開発環境用の設定ファイルをコピー
RUN cp src/config/exportConfig.default.ts src/config/exportConfig.ts

RUN npm run build

ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

CMD ["npm", "start"]