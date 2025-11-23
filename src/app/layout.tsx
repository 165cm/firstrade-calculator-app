// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import ClientLayout from '@/components/ClientLayout';
import CacheDebugger from '@/components/CacheDebugger';

export const metadata: Metadata = {
  title: 'Firstrade証券取引分析ツール(β) v1.5.0',
  description: 'Firstrade証券の配当金・損益を簡単に計算。基本機能無料、CSVエクスポートは買い切りライセンス',
  openGraph: {
    title: 'Firstrade証券取引分析ツール(β) v1.5.0',
    description: 'Firstrade証券の配当金・損益を簡単に計算。基本機能無料、CSVエクスポートは買い切りライセンス',
    url: 'https://firstrade.nomadkazoku.com',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning={true}>
        <ClientLayout>
          <main className="min-h-screen bg-white">
            <Navigation />
            {children}
          </main>
          {process.env.NODE_ENV === 'development' && <CacheDebugger />}
        </ClientLayout>
      </body>
    </html>
  );
}