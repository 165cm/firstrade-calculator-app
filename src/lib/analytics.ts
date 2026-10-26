// src/lib/analytics.ts
// アクセス解析のイベント送信（解析ツールが読み込まれていない場合は何もしない）
// ※ 金額やCSVの内容など、利用者のデータは送らないこと

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: EventParams) => void;
  }
}

export type AnalyticsEvent =
  | 'cta_purchase_click'
  | 'cta_demo_click'
  | 'demo_start'
  | 'csv_upload'
  | 'export_dialog_open'
  | 'license_verified';

export function trackEvent(event: AnalyticsEvent, params?: EventParams): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', event, params);
    }
  } catch {
    // 計測の失敗で画面の動作を妨げない
  }
}
