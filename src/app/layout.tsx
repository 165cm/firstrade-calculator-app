// src/app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import Navigation from '@/components/Navigation';
import ClientLayout from '@/components/ClientLayout';

const BASE_URL = 'https://firstrade.nomadkazoku.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'FirstScope 2025 | Firstrade確定申告サポートツール',
    template: '%s | FirstScope 2025',
  },
  description: 'Firstrade証券の確定申告を効率化。配当金・売却損益の自動計算、為替レート自動取得、CSVエクスポート機能を提供するプロフェッショナル分析ツール。',
  keywords: ['Firstrade', '確定申告', '配当金', '売却損益', '為替レート', 'TTM', 'ポートフォリオ', '米国株', '外国税額控除'],
  authors: [{ name: 'Nomad Family' }],
  creator: 'Nomad Family',
  publisher: 'Nomad Family',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    siteName: 'FirstScope 2025',
    title: 'FirstScope 2025 | Firstrade確定申告サポートツール',
    description: 'Firstrade証券の確定申告を効率化。配当金・売却損益の自動計算、為替レート自動取得、CSVエクスポート機能を提供。',
    url: BASE_URL,
    locale: 'ja_JP',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FirstScope 2025 - Firstrade確定申告サポートツール',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FirstScope 2025 | Firstrade確定申告サポートツール',
    description: 'Firstrade証券の確定申告を効率化。配当金・売却損益の自動計算、為替レート自動取得機能を提供。',
    images: ['/images/og-image.png'],
  },
}

// Service Workerの強制クリーンアップスクリプト
const swCleanupScript = `
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister().then(function(success) {
        if (success) console.log('Service Worker unregistered');
      });
    }
  });
  // キャッシュも削除
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <script dangerouslySetInnerHTML={{ __html: swCleanupScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': `${BASE_URL}/#website`,
                  url: BASE_URL,
                  name: 'FirstScope 2025',
                  description: 'Firstrade証券の確定申告を効率化するプロフェッショナル分析ツール',
                  publisher: {
                    '@id': `${BASE_URL}/#organization`,
                  },
                  inLanguage: 'ja',
                },
                {
                  '@type': 'Organization',
                  '@id': `${BASE_URL}/#organization`,
                  name: 'Nomad Family',
                  url: 'https://www.nomadkazoku.com',
                  logo: {
                    '@type': 'ImageObject',
                    url: `${BASE_URL}/images/og-image.png`,
                  },
                },
                {
                  '@type': 'SoftwareApplication',
                  name: 'FirstScope 2025',
                  applicationCategory: 'FinanceApplication',
                  operatingSystem: 'Web Browser',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'JPY',
                    description: '2025年末までベータ機能無料開放中',
                  },
                  description: 'Firstrade証券の確定申告をサポートするツール。配当金明細、売却損益計算、ポートフォリオ分析機能を提供。',
                  featureList: [
                    '配当金明細の自動計算',
                    '売却損益の日本円換算',
                    'TTM為替レート自動取得',
                    'CSVエクスポート',
                    'ポートフォリオ分析',
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning={true} className="bg-slate-50">
        <ClientLayout>
          <div className="min-h-screen">
            <Navigation />
            {children}
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
