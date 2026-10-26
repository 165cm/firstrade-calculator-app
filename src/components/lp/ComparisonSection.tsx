// src/components/lp/ComparisonSection.tsx
import { Check, Minus, X } from 'lucide-react';
import { CURRENT_EDITION } from '@/config/license';

type Mark = 'good' | 'fair' | 'bad';

interface Row {
  label: string;
  excel: { mark: Mark; text: string };
  accountant: { mark: Mark; text: string };
  firstscope: { mark: Mark; text: string };
}

const ROWS: Row[] = [
  {
    label: '費用',
    excel: { mark: 'good', text: '0円' },
    accountant: { mark: 'bad', text: '数万円〜（一般的な相場）' },
    firstscope: { mark: 'good', text: `${CURRENT_EDITION.price}（${CURRENT_EDITION.priceJpyApprox}）` },
  },
  {
    label: '作業時間',
    excel: { mark: 'bad', text: '数時間〜（取引数による）' },
    accountant: { mark: 'fair', text: '資料集めとやり取りが必要' },
    firstscope: { mark: 'good', text: 'CSVを入れて数分' },
  },
  {
    label: '為替レート',
    excel: { mark: 'bad', text: '取引日ごとに自分で調べる' },
    accountant: { mark: 'good', text: '税理士が対応' },
    firstscope: { mark: 'good', text: '取引日ごとに自動で適用' },
  },
  {
    label: '計算ミス',
    excel: { mark: 'bad', text: '手入力・数式のミスが起きやすい' },
    accountant: { mark: 'good', text: '起きにくい' },
    firstscope: { mark: 'good', text: '自動計算で手入力なし' },
  },
  {
    label: '税務の相談',
    excel: { mark: 'bad', text: 'できない' },
    accountant: { mark: 'good', text: 'できる' },
    firstscope: { mark: 'bad', text: 'できない（基礎資料の作成に特化）' },
  },
];

function MarkIcon({ mark }: { mark: Mark }) {
  if (mark === 'good') return <Check className="h-4 w-4 text-accent-teal flex-shrink-0" aria-label="良い" />;
  if (mark === 'fair') return <Minus className="h-4 w-4 text-amber-400 flex-shrink-0" aria-label="ふつう" />;
  return <X className="h-4 w-4 text-slate-500 flex-shrink-0" aria-label="不向き" />;
}

function Cell({ mark, text, highlight }: { mark: Mark; text: string; highlight?: boolean }) {
  return (
    <td className={`px-3 py-3 align-top ${highlight ? 'bg-brand-500/10' : ''}`}>
      <div className="flex items-start gap-2">
        <MarkIcon mark={mark} />
        <span className={highlight ? 'text-white font-medium' : 'text-slate-300'}>{text}</span>
      </div>
    </td>
  );
}

/**
 * 手作業・税理士・FirstScope の比較表
 */
export function ComparisonSection() {
  return (
    <section className="relative py-16 sm:py-24 bg-navy-800 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-accent-teal font-bold tracking-wider uppercase text-xs mb-3 block opacity-80">Comparison</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-4 tracking-tight">
            ほかの方法と比べると
          </h2>
          <p className="text-slate-400 font-light">
            税務の相談が必要なら税理士へ。<br className="sm:hidden" />
            申告の基礎資料を手早く正確に作るなら、FirstScope。
          </p>
        </div>

        {/* スマホ: 比較項目ごとのカード */}
        <div className="md:hidden space-y-3">
          {ROWS.map(row => (
            <div key={row.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-sm font-bold text-white">{row.label}</p>
              <dl className="space-y-2 text-sm">
                {[
                  { name: '手作業（Excel）', value: row.excel, highlight: false },
                  { name: '税理士に依頼', value: row.accountant, highlight: false },
                  { name: 'FirstScope', value: row.firstscope, highlight: true },
                ].map(({ name, value, highlight }) => (
                  <div
                    key={name}
                    className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2 ${highlight ? 'bg-brand-500/15 border border-brand-500/30' : ''}`}
                  >
                    <dt className={`whitespace-nowrap ${highlight ? 'font-bold text-white' : 'text-slate-400'}`}>{name}</dt>
                    <dd className="flex items-start gap-1.5 text-right">
                      <MarkIcon mark={value.mark} />
                      <span className={highlight ? 'text-white font-medium' : 'text-slate-300'}>{value.text}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        {/* PC: 表 */}
        <div className="hidden md:block max-w-4xl mx-auto overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-sm text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-3 py-3 font-medium w-[16%]"></th>
                <th className="px-3 py-3 font-medium">手作業（Excel）</th>
                <th className="px-3 py-3 font-medium">税理士に依頼</th>
                <th className="px-3 py-3 font-bold text-white bg-brand-500/20">FirstScope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ROWS.map(row => (
                <tr key={row.label}>
                  <th scope="row" className="px-3 py-3 font-medium text-slate-400 whitespace-nowrap align-top">{row.label}</th>
                  <Cell {...row.excel} />
                  <Cell {...row.accountant} />
                  <Cell {...row.firstscope} highlight />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
