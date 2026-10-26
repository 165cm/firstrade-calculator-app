// src/config/analytics.ts
// アクセス解析の設定

/** Google Analytics 4 の測定ID（例: G-XXXXXXXXXX）。未設定（null）の場合は計測しない */
export const GA_MEASUREMENT_ID: string | null = 'G-HTSXW36N5R';

/** 計測する本番のドメイン（お試しサイト・開発環境のアクセスを混ぜないため） */
export const ANALYTICS_HOSTNAME = 'firstrade.nomadkazoku.com';
