// src/config/license.ts
// 販売中の年度版の表示設定（画面・LP・チャットの文言に使用）
// 新しい年度版の販売開始時に、ここを書き換えてデプロイする
// ※ ライセンス判定そのものはサーバーの環境変数 GUMROAD_PRODUCTS で行う

export const CURRENT_EDITION = {
  /** 年度（製品名・タイトルに使用） */
  year: '2025',
  /** 版名 */
  label: '2025年版',
  /** 有効期限の表示 */
  validUntil: '2026年12月',
  /** 価格の表示 */
  price: '$25',
  /** 価格の円換算の目安（LPに表示） */
  priceJpyApprox: '約3,800円',
  /** 構造化データ用の価格（数値・USD） */
  priceValue: '25',
} as const;

/** 製品名（例: FirstScope 2025） */
export const PRODUCT_NAME = `FirstScope ${CURRENT_EDITION.year}`;

/**
 * 既存ユーザー向けのお知らせ（LPに表示）。表示しない場合は null
 * 前年版の購入者への半額クーポンの案内など
 */
export const RETURNING_USER_NOTICE: { title: string; body: string } | null = {
  title: '2025年版をご購入の方へ',
  body: '次回版（2026年版）で使える50%OFFクーポンを、発売時にGumroadご登録のメールアドレスへお届けします。',
};

/** 購入ページ（Gumroad）のURL。環境変数 NEXT_PUBLIC_GUMROAD_PRODUCT_URL があればそちらを優先 */
export const PURCHASE_URL =
  process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL || 'https://papazon.gumroad.com/l/firstrade-ja';

/** LPの「デモで体験」ボタンの遷移先（配当金明細のデモデータを自動で読み込む） */
export const DEMO_URL = '/dividend?demo=1';
