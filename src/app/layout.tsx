// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'FirstScope 2025',
  description: 'Firstrade証券の資産運用を最適化するプロフェッショナル分析ツール',
  openGraph: {
    title: 'FirstScope 2025',
    description: 'Firstrade証券の資産運用を最適化するプロフェッショナル分析ツール',
    url: 'https://firstrade.nomadkazoku.com',
    type: 'website',
  }
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
