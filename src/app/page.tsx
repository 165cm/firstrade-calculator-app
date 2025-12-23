// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Download, TrendingUp, Smartphone, Zap, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Database, Quote } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-32">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/images/hero_bg.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-900/50" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300 mb-6 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
              2025年版リリース
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Firstradeの確定申告計算を<br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                3分で完了
              </span>
              させよう。
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              為替レートの確認、日本円への換算、年間取引の集計...
              面倒な作業をすべて自動化。もうExcelと格闘する必要はありません。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <a
                href="https://papazon.gumroad.com/l/firstrade-ja"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/25"
              >
                今すぐ購入 (Gumroad)
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <Link
                href="/dividend"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-200 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-all backdrop-blur-sm"
              >
                無料で試す (配当金)
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              ※2025年内はベータ機能（損益分析）も無料開放中
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-gradient-to-b from-slate-100 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-amber-100 rounded-full mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              なぜFirstradeの確定申告は<br className="sm:hidden" />こんなに面倒なのか？
            </h2>
            <p className="text-lg text-slate-600">
              国内証券と違い、すべて自分で計算しなければなりません。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ProblemCard
              title="「特定口座」がない"
              description="国内証券のような自動税計算はありません。すべての取引（配当、売買）を自分で日本円に換算して記録する必要があります。"
            />
            <ProblemCard
              title="為替レート地獄"
              description="配当や売買のたびに、その日のTTMレートを確認して計算... 1回の取引ならまだしも、年間60回以上繰り返すのは苦痛です。"
            />
            <ProblemCard
              title="具体例"
              description="「6月15日の配当 $24.74... その日のレートは ¥142.57... えーと、3,527円？」これを全取引で行うと、丸一日かかることも。"
              isHighlight
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              FirstScopeで解決できること
            </h2>
            <p className="text-lg text-slate-600">
              面倒な手作業から解放され、投資判断に必要な時間を確保しましょう。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Download className="h-6 w-6 text-blue-600" />}
              title="配当金計算"
              description="Tax CenterのCSVをドロップするだけで、TTMレートで日本円に自動換算。月次・年間サマリーも自動生成。"
              imageSrc="/images/feature_dividend.png"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-green-600" />}
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
              icon={<Smartphone className="h-6 w-6 text-purple-600" />}
              title="損益シミュレーター"
              description="売却タイミングを仮定した税金計算をシミュレーション。最適な売却戦略を見極められます。"
              imageSrc="/images/feature_simulator.png"
            />
          </div>
        </div>
      </section>

      {/* Data Source Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Database className="h-12 w-12 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  信頼できる為替データを採用
                </h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  本ツールは、<strong className="text-slate-900">欧州中央銀行(ECB)</strong>が公表する為替レートをソースとするオープンソースAPI「<strong className="text-slate-900">Frankfurter</strong>」を採用しています。
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>公的機関のデータ:</strong> ECBは欧州連合(EU)の中央銀行であり、世界的に信頼される為替レートの発信元です。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>透明性と信頼性:</strong> 公開APIを使用するため、計算結果の根拠が明確で、税務調査時にも説明しやすくなります。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>無料・オープンソース:</strong> 商用利用可能なライセンスで公開されており、誰でも検証可能です。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Can/Cannot Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              できること / できないこと
            </h2>
            <p className="text-lg text-slate-600">
              正直にお伝えします。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                できること
              </h3>
              <ul className="space-y-4">
                <CanItem text="FirstradeのCSVファイル（Tax Center & Gain/Loss）のインポート" />
                <CanItem text="為替レートの自動取得（2019年以降・Frankfurter API使用）" />
                <CanItem text="日本円換算と月次・年間サマリーの自動生成" />
                <CanItem text="CSVエクスポート（有料機能）" />
              </ul>
            </div>

            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <h3 className="text-xl font-bold text-red-800 mb-6 flex items-center gap-2">
                <XCircle className="h-6 w-6" />
                できないこと
              </h3>
              <ul className="space-y-4">
                <CannotItem text="税務に関する個別のアドバイス（税理士法により禁止）" />
                <CannotItem text="確定申告書の自動提出（e-Taxファイル作成は不可）" />
                <CannotItem text="過去の為替レートの手動修正" />
              </ul>
            </div>
          </div>

          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-800">
              <strong>ご注意:</strong> 源泉徴収額の自動取得率は約73%です。FirstradeのCSVに記載がない場合があるため、必ず月次明細(Statement)との突合が必要です。
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              ユーザーの声
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <TestimonialCard
              quote="確定申告の作業時間が8時間から30分に短縮できました。特に為替レートの確認作業がなくなり助かっています。"
              name="Aさん"
              role="都内在住・会社員"
            />
            <TestimonialCard
              quote="初めての確定申告でしたが、ツールのおかげで迷うことなく準備できました。"
              name="Bさん"
              role="神奈川県・自営業"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              ご利用の流れ
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-xl backdrop-blur-md mb-8">
            <ShieldCheck className="h-8 w-8 text-yellow-300 mr-3" />
            <span className="text-xl font-bold text-yellow-300">2025 Campaign Free</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            今ならベータ機能が無料
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            損益計算およびポートフォリオ分析機能（CSV出力含む）は、<br />
            2025年末までライセンス未購入でもご自由にお使いいただけます。
          </p>
          <a
            href="https://papazon.gumroad.com/l/firstrade-ja"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-blue-900 bg-white rounded-lg hover:bg-blue-50 transition-all shadow-lg"
          >
            ライセンスを購入して全機能を使う (Gumroad)
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-center text-sm border-t border-slate-800">
        <p>© 2025 FirstScope. All rights reserved.</p>
      </footer>
    </div>
  );
}

function ProblemCard({ title, description, isHighlight }: { title: string; description: string; isHighlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${isHighlight ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
      <h3 className={`text-lg font-bold mb-3 ${isHighlight ? 'text-amber-800' : 'text-slate-900'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${isHighlight ? 'text-amber-700' : 'text-slate-600'}`}>{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, imageSrc }: { icon: React.ReactNode; title: string; description: string; imageSrc?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      {imageSrc && (
        <div className="w-full mb-6 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-xl bg-slate-50 mr-3">{icon}</div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center">
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg ring-4 ring-white">
        {number}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}

function CanItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
      <span className="text-green-800">{text}</span>
    </li>
  );
}

function CannotItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <span className="text-red-800">{text}</span>
    </li>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
      <Quote className="h-8 w-8 text-blue-200 mb-4" />
      <p className="text-slate-700 leading-relaxed mb-6">「{quote}」</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-slate-900">{name}</p>
          <p className="text-sm text-slate-500">{role}</p>
        </div>
      </div>
    </div>
  );
}