// src/components/lp/FilingGuideSection.tsx
import { ArrowRight, FileText } from 'lucide-react';

interface GuideItem {
  source: string;
  output: string;
  destination: string;
}

const ITEMS: GuideItem[] = [
  {
    source: '配当金明細のCSV',
    output: '配当・利子の円換算額（年間合計・明細）',
    destination: '確定申告書の配当所得の計算',
  },
  {
    source: '配当金明細のCSV',
    output: '米国で源泉徴収された税額（円換算）',
    destination: '外国税額控除に関する明細書',
  },
  {
    source: '売却損益のCSV',
    output: '譲渡価額・取得費（取引日ごとの円換算）',
    destination: '株式等に係る譲渡所得等の金額の計算明細書',
  },
];

/**
 * 出力したデータを申告のどこで使うかの見本
 */
export function FilingGuideSection() {
  return (
    <section className="relative py-16 sm:py-24 bg-navy-900 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-accent-teal font-bold tracking-wider uppercase text-xs mb-3 block opacity-80">How to use</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-4 tracking-tight">
            出力したデータは、<br className="sm:hidden" />申告のここで使います
          </h2>
          <p className="text-slate-400 font-light">
            日本円に換算した数字を、そのまま申告書類の作成に使えます。
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {ITEMS.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5"
            >
              <div className="sm:w-[38%]">
                <p className="text-xs text-slate-500 mb-1">{item.source}</p>
                <p className="text-white font-medium">{item.output}</p>
              </div>
              <ArrowRight className="hidden sm:block h-5 w-5 text-accent-teal flex-shrink-0" />
              <div className="flex items-center gap-2 sm:flex-1 rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 py-2">
                <FileText className="h-4 w-4 text-brand-300 flex-shrink-0" />
                <span className="text-sm text-brand-100">{item.destination}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="max-w-4xl mx-auto mt-6 text-xs text-slate-500 leading-relaxed">
          ※ FirstScopeは申告の基礎資料を作るツールです。課税方式の選択や具体的な記入方法は、国税庁の案内または税理士にご確認ください。
          Form 1042-Sが申告期限に間に合わない場合の進め方は、<a href="/faq" className="underline hover:text-slate-300">よくある質問</a>で解説しています。
        </p>
      </div>
    </section>
  );
}
