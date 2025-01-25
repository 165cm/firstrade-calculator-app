// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation'; // 新規作成

export const metadata: Metadata = {
  title: 'Firstrade証券取引分析ツール',
  description: 'Firstrade証券の配当金・損益を簡単に計算できる無料ツール',
  openGraph: {
    title: 'Firstrade証券取引分析ツール',
    description: 'Firstrade証券の配当金・損益を簡単に計算できる無料ツール',
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
        <main className="min-h-screen bg-white">
          <Navigation />
          {children}
        </main>
      </body>
    </html>
  );
}