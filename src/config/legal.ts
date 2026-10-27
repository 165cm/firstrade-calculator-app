// src/config/legal.ts
// 特定商取引法に基づく表記・プライバシーポリシーの内容
// 他のサービスで使い回せるよう、事業者の情報（OPERATOR）とサービス固有の情報（SERVICE_LEGAL）を分けている

import { CURRENT_EDITION, IS_ON_SALE, PURCHASE_URL, UPCOMING_EDITION } from '@/config/license';

/** 請求があった場合に開示する項目の表示 */
export const DISCLOSE_ON_REQUEST = 'ご請求があれば、遅滞なく電子メールでお知らせします。';

/** 事業者の情報（サービス共通） */
export const OPERATOR = {
  /** 販売事業者（屋号） */
  businessName: 'ぱぱぞん',
  /** 所在地の表示（詳細な住所は請求時に開示） */
  location: '東京都',
  /** 問い合わせ用のメールアドレス */
  email: 'papazon.service.desk@outlook.jp',
  /** 問い合わせフォーム */
  contactUrl: 'https://majestic-gateway-e4a.notion.site/2d3e8c4088938053a31df1916c843dd0?pvs=105',
} as const;

/** 外部サービス（プライバシーポリシーの「外部サービスの利用」に掲載） */
export interface ExternalService {
  name: string;
  provider: string;
  country: string;
  purpose: string;
  data: string;
  policyUrl: string;
}

/** サービス固有の情報 */
export const SERVICE_LEGAL = {
  serviceName: 'FirstScope',
  /** 問い合わせメールの件名の先頭（共用アドレスでサービスごとに仕分けるため） */
  mailSubjectTag: '[FirstScope]',
  siteUrl: 'https://firstrade.nomadkazoku.com',
  /** プライバシーポリシーの制定日・改定日 */
  privacyEstablished: '2026年10月27日',
  privacyUpdated: null as string | null,

  /** 特定商取引法に基づく表記：販売価格 */
  price: IS_ON_SALE
    ? `${CURRENT_EDITION.label}：${CURRENT_EDITION.price}（購入ページに表示する価格）`
    : `${UPCOMING_EDITION.label}：${CURRENT_EDITION.price}（予定。${UPCOMING_EDITION.releaseDate}発売予定）`,
  purchaseUrl: PURCHASE_URL,
  /** 引渡時期 */
  delivery: '決済の完了後、ご登録のメールアドレスにライセンスキーをお送りします。届かない場合はお問い合わせください。',
  /** 提供期間（ライセンスの有効期間） */
  licensePeriod: IS_ON_SALE
    ? `${CURRENT_EDITION.label}は${CURRENT_EDITION.validUntil}末までご利用いただけます。`
    : `${UPCOMING_EDITION.label}は${UPCOMING_EDITION.validUntil}末までご利用いただけます。`,
  /** 動作環境 */
  environment: 'Google Chrome、Safari、Microsoft Edge、Firefox の最新版（PCでのご利用を推奨）。JavaScriptとブラウザの保存機能（localStorage）が有効である必要があります。',
  /** 返品・キャンセル */
  refund: [
    'デジタル商品の性質上、購入後の返品・返金・キャンセルは原則としてお受けしておりません。',
    'ただし、本サービスの不具合により利用できず、お問い合わせ後も解決できない場合は、購入日から14日以内にご連絡いただいたものに限り、返金に応じます。',
    '購入前に、無料のデモと無料版で動作をご確認ください。',
  ],

  /** プライバシーポリシー：外部サービス */
  externalServices: [
    {
      name: 'Gumroad',
      provider: 'Gumroad, Inc.',
      country: '米国',
      purpose: '商品の販売・決済、ライセンスキーの発行と照会',
      data: '購入時に入力されたメールアドレス・氏名・決済情報、ライセンスキー',
      policyUrl: 'https://gumroad.com/privacy',
    },
    {
      name: 'Google Cloud',
      provider: 'Google LLC',
      country: '米国（サーバーは日本国内のリージョン）',
      purpose: 'サイトの公開（サーバー）、アクセスログの記録',
      data: 'IPアドレス、ブラウザの種類、アクセス日時、アクセスしたURL',
      policyUrl: 'https://policies.google.com/privacy?hl=ja',
    },
    {
      name: 'Google アナリティクス',
      provider: 'Google LLC',
      country: '米国',
      purpose: 'アクセス状況の分析',
      data: 'Cookie等の識別子、閲覧したページ、ボタンの操作、ブラウザ・端末の情報、おおよその地域',
      policyUrl: 'https://policies.google.com/privacy?hl=ja',
    },
    {
      name: 'Gemini API（チャットサポート）',
      provider: 'Google LLC',
      country: '米国',
      purpose: 'チャットサポートの回答の生成',
      data: 'チャットに入力された内容',
      policyUrl: 'https://policies.google.com/privacy?hl=ja',
    },
    {
      name: 'Notion（お問い合わせフォーム）',
      provider: 'Notion Labs, Inc.',
      country: '米国',
      purpose: 'お問い合わせの受付',
      data: 'フォームに入力された内容（メールアドレス等）',
      policyUrl: 'https://www.notion.so/notion/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091',
    },
  ] satisfies ExternalService[],
} as const;

/** 問い合わせ用のmailtoリンク（件名にサービス名を入れ、受信側で仕分けられるようにする） */
export const CONTACT_MAILTO = `mailto:${OPERATOR.email}?subject=${encodeURIComponent(`${SERVICE_LEGAL.mailSubjectTag} お問い合わせ`)}`;
