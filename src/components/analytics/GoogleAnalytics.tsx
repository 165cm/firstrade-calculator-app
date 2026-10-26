// src/components/analytics/GoogleAnalytics.tsx
import Script from 'next/script';
import { GA_MEASUREMENT_ID, ANALYTICS_HOSTNAME } from '@/config/analytics';

/**
 * Google Analytics 4 の読み込み
 * 測定IDが設定されていて、本番のドメインで開かれたときだけ計測する（お試しサイトや開発環境は計測しない）
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || !/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)) return null;

  return (
    <Script id="ga4-init" strategy="afterInteractive">
      {`if (location.hostname === '${ANALYTICS_HOSTNAME}') {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', '${GA_MEASUREMENT_ID}');
}`}
    </Script>
  );
}
