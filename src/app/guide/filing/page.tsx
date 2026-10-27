// src/app/guide/filing/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { Footer } from '@/components/common/Footer';

export const metadata: Metadata = {
  title: '確定申告での使い方',
  description: 'FirstScopeで円換算した配当・源泉徴収額・売却損益を、確定申告のどの書類で使うかを解説します。',
};

// 国税庁の参考ページ
const NTA_LINKS = {
  keisan: 'https://www.keisan.nta.go.jp/',
  dividend: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1330.htm',
  foreignTaxCredit: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1240.htm',
  // 記載例は年度ごとにURLが変わるため、毎年確認する
  stock: 'https://www.nta.go.jp/taxes/shiraberu/shinkoku/tebiki/2024/kisairei/kabushiki/index.htm',
};

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

/** FirstScopeのどの数字を使うか */
function NumberRow({ label, where, use }: { label: string; where: string; use: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{where}</p>
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-sm text-slate-600">→ {use}</p>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

export default function FilingGuidePage() {
  return (
    <>
      <div className="max-w-4xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600">ホーム</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">確定申告での使い方</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            FirstScopeの数字を、確定申告で使うには
          </h1>
          <p className="text-slate-600 leading-relaxed">
            FirstScopeで円換算した数字が、一般的に確定申告のどの書類・項目で使われるかをまとめました。
            国税庁の「確定申告書等作成コーナー」で申告する場合を例にしています。
          </p>
        </header>

        <div className="mb-10">
          <Note>
            <p className="font-semibold mb-1">はじめにお読みください</p>
            <p>
              このページは一般的な案内です。課税方式の選び方や、ご自身の場合にどう申告するかは、
              申告する方の状況によって変わります。判断に迷う場合は、
              <ExtLink href={NTA_LINKS.keisan}>国税庁の確定申告書等作成コーナー</ExtLink>
              の案内、お近くの税務署、または税理士にご確認ください。
              作成コーナーの画面名は年度によって変わることがあります。
            </p>
          </Note>
        </div>

        {/* 1. 配当 */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            1. 配当金・利子
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <NumberRow
              where="配当金明細の画面"
              label="年間配当金（円換算）"
              use="配当所得の収入金額"
            />
            <NumberRow
              where="配当金明細の画面"
              label="年間利子（円換算）"
              use="利子の扱いは配当と異なる場合があります（下の注意を参照）"
            />
          </div>
          <div className="space-y-3 text-slate-700 leading-relaxed">
            <p>
              作成コーナーでは、所得税の申告書を作る流れの中で「配当所得」の入力画面に進み、銘柄（または支払者）と収入金額を入力します。
              Firstradeは米国の証券会社なので、日本の所得税は源泉徴収されていません。
            </p>
            <p>
              配当所得は「総合課税」と「申告分離課税」から課税方式を選べます。どちらが有利かは、ほかの所得の金額などによって変わります。
              詳しくは国税庁の<ExtLink href={NTA_LINKS.dividend}>配当所得の解説</ExtLink>をご覧ください。
            </p>
          </div>
          <div className="mt-4">
            <Note>
              画面上部の「配当所得（合計）」は、配当と利子を合わせた金額です。
              Firstradeの預り金に付く利子は、配当とは別の所得として扱われる場合があります。申告では「年間配当金」と「年間利子」を分けて確認してください。
            </Note>
          </div>
        </section>

        {/* 2. 外国税額控除 */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            2. 米国で源泉徴収された税金（外国税額控除）
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <NumberRow
              where="配当金明細の画面"
              label="源泉徴収額（外国税額控除用）の円換算"
              use="外国税額控除に関する明細書の外国所得税額"
            />
          </div>
          <div className="space-y-3 text-slate-700 leading-relaxed">
            <p>
              米国株の配当からは、通常、米国の税金が差し引かれています。この税金は「外国税額控除」を申告すると、日本の税金から差し引ける場合があります。
              作成コーナーでは、税額控除を入力する画面の「外国税額控除」から明細書を作成します。
            </p>
            <p>
              控除できる金額には上限があります。詳しくは国税庁の<ExtLink href={NTA_LINKS.foreignTaxCredit}>外国税額控除の解説</ExtLink>をご覧ください。
            </p>
          </div>
          <div className="mt-4">
            <Note>
              <p>
                FirstScopeは、CSVの説明欄に源泉徴収の記載がある配当だけを自動で集計します。記載のない源泉徴収は集計に含まれないため、Firstradeの取引履歴などで確認してください。
              </p>
              <p className="mt-2">
                米国の源泉徴収の正式な書類は Form 1042-S です。届くのが申告期限に間に合わない場合の進め方は、
                <Link href="/faq" className="text-blue-600 hover:underline">よくある質問</Link>で解説しています。
              </p>
            </Note>
          </div>
        </section>

        {/* 3. 売却損益 */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            3. 株の売却損益
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <NumberRow
              where="売却損益のCSVエクスポート"
              label="売却価格（円）の合計"
              use="譲渡による収入金額"
            />
            <NumberRow
              where="売却損益のCSVエクスポート"
              label="取得価格（円）の合計"
              use="取得費"
            />
          </div>
          <div className="space-y-3 text-slate-700 leading-relaxed">
            <p>
              株の売却益は「株式等に係る譲渡所得等の金額の計算明細書」で計算します。作成コーナーでは、株式等の譲渡所得の入力画面から作成します。
              海外の証券会社の口座は、国内の証券会社の「特定口座」にあたる仕組みがないため、自分で計算して申告します。
            </p>
            <p>
              詳しくは国税庁の<ExtLink href={NTA_LINKS.stock}>株式等の譲渡所得の記載例</ExtLink>をご覧ください。
            </p>
          </div>
          <div className="mt-4">
            <Note>
              <p>
                海外の証券会社を通じた売却で生じた損失は、国内の証券会社の場合とは扱いが異なり、配当との損益通算や翌年以降への繰越ができない場合があります。
                損失が出た年は、税務署または税理士に確認することをおすすめします。
              </p>
              <p className="mt-2">
                FirstScopeの損益は、日本の方式（Wash Saleの調整なし）で計算しています。
                米国の方式との違いは<Link href="/guide/washsale" className="text-blue-600 hover:underline">Wash Saleの解説</Link>をご覧ください。
              </p>
            </Note>
          </div>
        </section>

        {/* 4. 為替レート */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            4. 円換算の為替レートについて
          </h2>
          <p className="text-slate-700 leading-relaxed">
            FirstScopeは、欧州中央銀行（ECB）の参照レートを取引日ごとに使って円換算しています。
            国税庁の原則は取引日のTTM（仲値）です。差は通常わずかですが、金額の大きい取引はTTMでのご確認をおすすめします。
            換算に使ったレートは、CSVエクスポートに取引ごとに出力されます。
          </p>
        </section>

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
