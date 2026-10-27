// src/components/lp/LpFaqSection.tsx
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { CURRENT_EDITION } from '@/config/license';

const FAQS: { question: string; answer: string }[] = [
  {
    question: '無料でどこまで使えますか？',
    answer:
      'デモデータですべての機能をお試しいただけます。ご自身のCSVを読み込んだ場合も、ドル建ての年間合計と明細の一部を画面で確認でき、正しく計算できるかを無料で確かめられます。確定申告に使う円換算の合計、すべての明細、CSVの出力はライセンスでご利用いただけます。',
  },
  {
    question: 'CSVはどこからダウンロードしますか？',
    answer:
      'Firstradeにログインし、配当は Accounts → Tax Center → Download Account Information、売却損益は Accounts → Gain/Loss の画面からダウンロードできます。画面つきの手順は「CSVのダウンロード方法」のページで解説しています。',
  },
  {
    question: '入力したデータは安全ですか？',
    answer:
      'CSVの内容はサーバーに送信されず、お使いのブラウザの中だけで計算・保存されます。「入力データをリセット」でいつでも削除できます。',
  },
  {
    question: '為替レートは何を使っていますか？',
    answer:
      '欧州中央銀行（ECB）の参照レートを、取引日ごとに自動で適用しています。国税庁の原則であるTTM（仲値）との差は通常わずかですが、金額の大きい取引はTTMでのご確認をおすすめします。',
  },
  {
    question: 'Form 1042-Sが届くのを待つべきですか？',
    answer:
      '1042-Sは発行期限が3月15日のため、申告期限に間に合わないことが多い書類です。まずFirstScopeのデータで期限内に申告し、1042-Sが届いてから内容を確認する進め方が一般的です。',
  },
  {
    question: 'ライセンスの有効期限は？',
    answer: `${CURRENT_EDITION.label}は${CURRENT_EDITION.validUntil}末までご利用いただけます。購入時の${CURRENT_EDITION.price}以外に追加料金はかかりません。`,
  },
];

/**
 * LP用のよくある質問（購入前の不安を解消する質問に絞る）
 */
export function LpFaqSection() {
  return (
    <section className="relative py-16 sm:py-24 bg-navy-800 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-accent-teal font-bold tracking-wider uppercase text-xs mb-3 block opacity-80">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">よくある質問</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map(faq => (
            <details key={faq.question} className="group rounded-2xl border border-white/10 bg-white/5 open:bg-white/[0.07]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-white font-medium [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{faq.answer}</p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          そのほかの質問は
          <Link href="/faq" className="mx-1 text-brand-300 underline hover:text-brand-200">よくある質問ページ</Link>
          をご覧ください。
        </p>
      </div>
    </section>
  );
}
