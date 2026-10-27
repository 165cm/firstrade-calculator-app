// src/components/legal/LegalLayout.tsx
// 特定商取引法に基づく表記・プライバシーポリシーの共通レイアウト
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Footer } from '@/components/common/Footer';

export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="max-w-3xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600">ホーム</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{title}</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">{title}</h1>
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-700">{children}</div>
      </div>
      <Footer />
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/** 項目名と内容の表（スマホでは縦に並べる） */
export function LegalTable({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {rows.map(row => (
        <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
          <dt className="font-semibold text-slate-900">{row.label}</dt>
          <dd className="min-w-0 break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
      {children}
    </a>
  );
}
