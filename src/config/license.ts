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

/**
 * 販売状態（年度版の切り替え時期に書き換える）
 * - preparing: 次の年度版の準備中。サイト全体で購入ボタンを止め、発売予定を案内する
 * - presale:   前年版の購入者向けの先行販売中。エクスポート画面（割引コード欄つき）からのみ購入できる
 * - on_sale:   一般販売中
 *
 * 先行販売に切り替えるときは、CURRENT_EDITION も新しい年度版に書き換える
 */
export type SalesStatus = 'preparing' | 'presale' | 'on_sale';
export const SALES_STATUS = 'preparing' as SalesStatus;

/** 準備中・先行販売中に案内する次の年度版 */
export const UPCOMING_EDITION = {
  label: '2026年版',
  /** 有効期限の表示 */
  validUntil: '2027年12月',
  /** 前年版の購入者向けの先行販売の時期 */
  presaleDate: '2027年1月中旬',
  /** 一般販売の開始日 */
  releaseDate: '2027年2月1日',
} as const;

/** サイト全体（LP・ナビ・アプリ内の案内）で購入ボタンを出すか */
export const IS_ON_SALE = SALES_STATUS === 'on_sale';

/** エクスポート画面から購入できるか（先行販売中は、メールで案内したリピーターがここから購入する） */
export const IS_EXPORT_PURCHASE_OPEN = SALES_STATUS !== 'preparing';

/** 購入ボタンの代わりに表示する案内（一般販売中は null） */
export const SALES_NOTICE: { short: string; long: string } | null =
  SALES_STATUS === 'preparing'
    ? {
      short: `${UPCOMING_EDITION.label}は${UPCOMING_EDITION.releaseDate}発売予定`,
      long: `${UPCOMING_EDITION.label}は${UPCOMING_EDITION.releaseDate}に発売予定です。前年版をご購入の方は、${UPCOMING_EDITION.presaleDate}から先行してご購入いただけます（Gumroadご登録のメールアドレスにご案内します）。`,
    }
    : SALES_STATUS === 'presale'
      ? {
        short: `${UPCOMING_EDITION.label}は${UPCOMING_EDITION.releaseDate}から一般販売`,
        long: `${UPCOMING_EDITION.label}は${UPCOMING_EDITION.releaseDate}から一般販売します。前年版をご購入の方は、お届けしたメールのご案内から先行してご購入いただけます。`,
      }
      : null;

/** 製品名（例: FirstScope 2025） */
export const PRODUCT_NAME = `FirstScope ${CURRENT_EDITION.year}`;

/**
 * 既存ユーザー向けのお知らせ（LPに表示）。表示しない場合は null
 * 前年版の購入者への半額クーポンの案内など
 */
export const RETURNING_USER_NOTICE: { title: string; body: string } | null = {
  title: '2025年版をご購入の方へ',
  body: '2026年版は、一般販売に先がけて2027年1月中旬から先行してご購入いただけます。50%OFFクーポンとあわせて、Gumroadご登録のメールアドレスへご案内します。',
};

/** 購入ページ（Gumroad）のURL。環境変数 NEXT_PUBLIC_GUMROAD_PRODUCT_URL があればそちらを優先 */
export const PURCHASE_URL =
  process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL || 'https://papazon.gumroad.com/l/firstrade-ja';

/** LPの「デモで体験」ボタンの遷移先（配当金明細のデモデータを自動で読み込む） */
export const DEMO_URL = '/dividend?demo=1';
