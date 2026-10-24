// src/config/license.ts
// 販売中の年度版の表示設定（画面・チャットの文言に使用）
// 新しい年度版の販売開始時に、ここを書き換えてデプロイする
// ※ ライセンス判定そのものはサーバーの環境変数 GUMROAD_PRODUCTS で行う

export const CURRENT_EDITION = {
  /** 版名 */
  label: '2025年版',
  /** 有効期限の表示 */
  validUntil: '2026年12月',
  /** 価格の表示 */
  price: '$25',
} as const;

/** 購入ページ（Gumroad）のURL。環境変数 NEXT_PUBLIC_GUMROAD_PRODUCT_URL があればそちらを優先 */
export const PURCHASE_URL =
  process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL || 'https://papazon.gumroad.com/l/firstrade-ja';
