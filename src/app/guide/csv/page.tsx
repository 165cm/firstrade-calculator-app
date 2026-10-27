// src/app/guide/csv/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Footer } from '@/components/common/Footer';

export const metadata: Metadata = {
  title: 'CSVのダウンロード方法',
  description: 'FirstScopeで使う配当金と売却損益のCSVを、Firstradeからダウンロードする手順を画面つきで解説します。',
};

function Step({ no, children }: { no: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
        {no}
      </span>
      <div className="pt-0.5 text-slate-700 leading-relaxed">{children}</div>
    </li>
  );
}

function Menu({ children }: { children: ReactNode }) {
  return <strong className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-900">{children}</strong>;
}

function Screenshot({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  return (
    <figure>
      {/* スマホでは画像が小さくなるため、タップで原寸を開けるようにする */}
      <a href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" />
      </a>
      <figcaption className="mt-1 text-xs text-slate-400 sm:hidden">画像をタップすると拡大できます</figcaption>
    </figure>
  );
}

export default function CsvGuidePage() {
  return (
    <>
      <div className="max-w-4xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600">ホーム</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">CSVのダウンロード方法</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            FirstradeからCSVをダウンロードする方法
          </h1>
          <p className="text-slate-600 leading-relaxed">
            FirstScopeでは、配当金と売却損益で別々のCSVを使います。どちらもPCのブラウザでFirstradeにログインしてダウンロードしてください。
          </p>
        </header>

        {/* 配当金 */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            1. 配当金明細のCSV
          </h2>
          <ol className="space-y-4 mb-6">
            <Step no={1}>上のメニューの <Menu>Accounts</Menu> を押します。</Step>
            <Step no={2}>下に並ぶメニューから <Menu>Tax Center</Menu> を押します。</Step>
            <Step no={3}>左側のメニューにある <Menu>Download Account Information</Menu> を押します。</Step>
          </ol>
          <Screenshot
            src="/images/guide/firstrade-tax-center.webp"
            alt="FirstradeのTax Center画面。Accounts、Tax Center、Download Account Informationの位置"
            width={1400}
            height={1030}
          />
          <ol start={4} className="space-y-4 my-6">
            <Step no={4}>Download Format で <Menu>Excel CSV files</Menu> を選びます。</Step>
            <Step no={5}>
              Start Date と End Date に、<strong>確定申告する年の1月1日と12月31日</strong>を入れます。
              <span className="block text-sm text-slate-500 mt-1">例：2025年分なら「01/01/2025」と「12/31/2025」（月/日/年の順）</span>
            </Step>
            <Step no={6}><Menu>DOWNLOAD</Menu> を押すと、CSVがダウンロードされます。</Step>
          </ol>
          <Screenshot
            src="/images/guide/firstrade-download-account.webp"
            alt="Download Account Information画面。Excel CSV filesを選び、期間を入れてDOWNLOADを押す"
            width={1400}
            height={547}
          />
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <p>期間に複数の年が入っていると、配当が年をまたいで合算されてしまいます。必ず1年分（1月1日〜12月31日）でダウンロードしてください。</p>
            <p className="mt-2">このCSVには売買などの取引も含まれますが、FirstScopeが配当と利子だけを取り出して集計します。</p>
          </div>
        </section>

        {/* 売却損益 */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            2. 売却損益のCSV
          </h2>
          <ol className="space-y-4 mb-6">
            <Step no={1}>上のメニューの <Menu>Accounts</Menu> を押します。</Step>
            <Step no={2}>下に並ぶメニューから <Menu>Gain/Loss</Menu> を押します。</Step>
            <Step no={3}>
              右上の表示が確定申告する年（例：「2025 Tax Year Gain-Loss Information」）になっていることを確認して、<Menu>Download CSV</Menu> を押します。
            </Step>
          </ol>
          <Screenshot
            src="/images/guide/firstrade-gainloss.webp"
            alt="FirstradeのGain/Loss画面。右上のDownload CSVの位置"
            width={1400}
            height={295}
          />
        </section>

        <div className="mb-10 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
          <p>
            ダウンロードしたCSVは、開いて編集・保存せずにそのまま読み込んでください。Excelなどで保存し直すと、形式が変わって読み込めなくなることがあります。
          </p>
          <p className="mt-2">
            Firstradeの画面は変わることがあります。この手順と画面が違う場合は、
            <Link href="/faq" className="text-blue-600 hover:underline">よくある質問</Link>のお問い合わせ先からお知らせください。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dividend" className="inline-flex justify-center rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700">
            配当金明細を開く
          </Link>
          <Link href="/gainloss" className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50">
            売却損益を開く
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
