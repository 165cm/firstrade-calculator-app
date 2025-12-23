// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Download, TrendingUp, Smartphone, Zap, ShieldCheck, CheckCircle2, XCircle, Database, Quote, AlertTriangle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-24 pb-40">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="/images/hero_bg.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900/95 to-blue-950/80" />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent z-10" />

        <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-4xl mx-auto sm:mx-0">
            <div className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300 mb-8 backdrop-blur-md shadow-lg shadow-blue-900/20 ring-1 ring-white/10">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2.5 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.6)]"></span>
              2025年版リリース
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.1]">
              Firstradeの<br className="sm:hidden" />確定申告を、<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-300 drop-shadow-sm">
                効率化・サポートする。
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-2xl leading-relaxed tracking-tight font-light">
              為替レートの確認、日本円への換算、年間取引の集計...<br className="hidden sm:block" />
              面倒な作業をすべて自動化して、最短ルートで完了。<br />
              もうExcelと格闘する必要はありません。
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center sm:justify-start">
              <a
                href="https://papazon.gumroad.com/l/firstrade-ja"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  今すぐ購入する
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
              <Link
                href="/dividend"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-200 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                無料で試す (配当金)
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-400/80 font-medium">
              ※2025年内はベータ機能（損益分析）も無料開放中
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
              なぜFirstradeの確定申告は<br />こんなに面倒なのか？
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              国内証券と違い、特定口座のないFirstradeでは<br className="hidden sm:block" />
              すべての計算を自分で行わなければなりません。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <ProblemCard
              icon={<Smartphone className="w-8 h-8" />} // Placeholder icon
              title="特定口座がない"
              description="国内証券のような自動サポートはありません。配当受取も売買も、すべて自分で日本円に換算し記録する必要があります。"
            />
            <ProblemCard
              icon={<TrendingUp className="w-8 h-8" />} // Placeholder
              title="為替レート地獄"
              description="6月15日の配当、9月20日の配当... 取引のたびにその日のTTMレートを調べて計算。年間60回以上繰り返すのは苦痛です。"
            />
            <ProblemCard
              icon={<AlertTriangle className="w-8 h-8" />}
              title="計算ミス = リスク"
              description="Excelでの手動計算はミスのもと。「その日のレートは？」「掛け算は合ってる？」常に不安がつきまといます。"
              isHighlight
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3 block">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
              FirstScopeで解決できること
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              面倒な単純作業はツールに任せて、<br className="sm:hidden" />
              本当に大切な投資判断に時間を使いましょう。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Download className="h-6 w-6 text-blue-600" />}
              title="配当金計算"
              description="Tax CenterのCSVをドロップするだけで、TTMレートで日本円に自動換算。月次・年間サマリーも自動生成。"
              imageSrc="/images/feature_dividend.png"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
              title="売買損益計算"
              description="Gain/Lossファイルから譲渡損益計算書に必要なデータを一発出力。特定口座のような利便性を。"
              imageSrc="/images/feature_gainloss.png"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-amber-500" />}
              title="コピペで即分析"
              description="【Beta】CSV不要。Firstradeの画面をコピーして貼り付けるだけで、瞬時に損益やバランスを分析。"
              imageSrc="/images/feature_portfolio.png"
            />
            <FeatureCard
              icon={<Smartphone className="h-6 w-6 text-violet-600" />}
              title="損益シミュレーター"
              description="売却タイミングを仮定した税金計算をシミュレーション。最適な売却戦略を見極められます。"
              imageSrc="/images/feature_simulator.png"
            />
          </div>
        </div>
      </section>

      {/* Data Source Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            {/* Decorative background blob */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />

            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/10 rotate-3 transition-transform hover:rotate-6">
                  <Database className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                  Frankfurter APIを採用
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  本ツールは、<strong className="text-slate-900 font-semibold bg-blue-50 px-1 py-0.5 rounded">欧州中央銀行(ECB)</strong>が公表する為替レートをソースとするオープンソースAPI「Frankfurter」を採用しています。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                    <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-slate-900 text-sm">公的データ</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed text-center md:text-left">ECB(欧州中央銀行)の公式レートを使用し信頼性を担保。</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                    <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-slate-900 text-sm">透明性</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed text-center md:text-left">公開されたデータソースで、税務調査時も説明が容易。</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                    <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-slate-900 text-sm">検証可能</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed text-center md:text-left">オープンソースAPIとして広く公開され誰でも確認可能。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Can/Cannot Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              できること / できないこと
            </h2>
            <p className="text-lg text-slate-600">
              ツールの機能と限界を、包み隠さずお伝えします。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle2 className="w-32 h-32 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-8 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-emerald-200/50 rounded-lg"><CheckCircle2 className="h-6 w-6 text-emerald-700" /></div>
                できること
              </h3>
              <ul className="space-y-4 relative z-10">
                <CanItem text="FirstradeのCSVファイル（Tax Center & Gain/Loss）のインポート" />
                <CanItem text="為替レートの自動取得（2019年以降・Frankfurter API）" />
                <CanItem text="日本円換算と月次・年間サマリーの自動生成" />
                <CanItem text="CSVエクスポート（有料機能）" />
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <XCircle className="w-32 h-32 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-slate-200/50 rounded-lg"><XCircle className="h-6 w-6 text-slate-700" /></div>
                できないこと
              </h3>
              <ul className="space-y-4 relative z-10">
                <CannotItem text="税務に関する個別のアドバイス（税理士法により禁止）" />
                <CannotItem text="確定申告書の自動提出（e-Taxファイル作成は不可）" />
                <CannotItem text="過去の為替レートの手動修正" />
              </ul>
            </div>
          </div>

          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 flex gap-4 items-start text-sm text-amber-900/80">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p><strong>ご注意:</strong> 源泉徴収額の自動取得率は約73%です。FirstradeのCSVに記載がない場合があるため、必ず月次明細(Statement)との突合が必要です。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              ユーザーの声
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <TestimonialCard
              quote="確定申告の作業時間が8時間から30分に短縮できました。特に為替レートの確認作業がなくなり本当に助かっています。"
              name="Aさん"
              role="都内在住・会社員"
            />
            <TestimonialCard
              quote="初めての確定申告でしたが、ツールのおかげで迷うことなく準備できました。画面もシンプルで使いやすいです。"
              name="Bさん"
              role="神奈川県・自営業"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3 block">Process</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              ご利用の流れ
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number="01"
              title="ライセンス購入"
              description="Gumroadにてライセンスキーを購入します。2025年版は2026年末まで有効です。"
            />
            <StepCard
              number="02"
              title="CSVアップロード"
              description="配当金CSVと売買損益CSVをドラッグ＆ドロップ。数秒で計算完了。"
            />
            <StepCard
              number="03"
              title="確認・エクスポート"
              description="自動計算結果を確認し、CSVをエクスポート。確定申告書作成に活用。"
            />
          </div>
        </div>
      </section>

      {/* Campaign Section */}
      <section className="py-24 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-md mb-8 ring-1 ring-white/20">
            <ShieldCheck className="h-5 w-5 text-yellow-300 mr-2" />
            <span className="text-sm font-bold text-yellow-200 tracking-wide uppercase">2025 Campaign Free</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight">
            今ならベータ機能が無料
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            損益計算およびポートフォリオ分析機能（CSV出力含む）は、<br className="hidden sm:block" />
            2025年末までライセンス未購入でもご自由にお使いいただけます。
          </p>
          <a
            href="https://papazon.gumroad.com/l/firstrade-ja"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            ライセンスを購入して全機能を使う
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
          <p className="mt-6 text-sm text-slate-500 mb-2">
            Gumroadのページへ移動します
          </p>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            ※Gumroadは、米国サンフランシスコを拠点とする、世界中のクリエイターが利用する安全な決済プラットフォームです。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-950 text-slate-500 text-center text-sm border-t border-slate-900">
        <p>© 2025 FirstScope. All rights reserved.</p>
      </footer>
    </div>
  );
}

function ProblemCard({ icon, title, description, isHighlight }: { icon: React.ReactNode; title: string; description: string; isHighlight?: boolean }) {
  return (
    <div className={`
      relative p-8 rounded-3xl border transition-all duration-300
      ${isHighlight
        ? 'bg-white border-amber-200 shadow-xl shadow-amber-100/50 z-10 sm:-translate-y-4'
        : 'bg-white border-slate-100 shadow-lg shadow-slate-200/50 hover:border-slate-300'
      }
    `}>
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl
        ${isHighlight ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}
      `}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, imageSrc }: { icon: React.ReactNode; title: string; description: string; imageSrc?: string }) {
  return (
    <div className="group bg-white rounded-3xl p-2 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300">
      {imageSrc && (
        <div className="w-full aspect-[4/3] mb-4 rounded-2xl overflow-hidden bg-slate-100 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4 pt-2">
        <div className="flex items-center mb-3">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 mr-3">{icon}</div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="group relative p-8 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/40 text-center hover:border-blue-100 hover:shadow-blue-900/5 transition-all duration-300">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        {number}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}

function CanItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
      <span className="text-slate-700 font-medium text-sm">{text}</span>
    </li>
  );
}

function CannotItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <XCircle className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
      <span className="text-slate-500 text-sm">{text}</span>
    </li>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow relative">
      <Quote className="absolute top-8 left-8 h-8 w-8 text-blue-100" />
      <p className="relative z-10 text-slate-700 leading-loose mb-6 pt-6 font-medium">「{quote}」</p>
      <div className="flex items-center gap-4 relative z-10 border-t border-slate-100 pt-6">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg shadow-inner">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">{role}</p>
        </div>
      </div>
    </div>
  );
}