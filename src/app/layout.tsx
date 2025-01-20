// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Firstrade配当金円換算ツール',
  description: 'Firstrade証券の配当金を日本円に換算するツール',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-white">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}