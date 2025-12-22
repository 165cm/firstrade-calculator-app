// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Download, TrendingUp, Smartphone, Zap, ShieldCheck } from 'lucide-react';

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
                効率化・サポート
              </span>
              する。
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              配当金や売買損益の複雑な日本円換算作業をサポート。
              CSVをドラッグ＆ドロップするだけで、計算の手間を大幅に削減します。
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

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              FirstScopeが選ばれる理由
            </h2>
            <p className="text-lg text-slate-600">
              面倒な手作業から解放され、投資判断に必要な時間を確保しましょう。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <FeatureCard
              icon={<Download className="h-6 w-6 text-blue-600" />}
              title="配当金計算"
              description="Tax CenterのCSVをドロップするだけで、TTMレートで日本円に自動換算。確定申告用データを即座に生成。"
            />
            {/* Feature 2 */}
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-green-600" />}
              title="売買損益計算"
              description="Gain/Lossファイルから譲渡損益計算書に必要なデータを一発出力。特定口座のような利便性を。"
            />
            {/* Feature 3 */}
            <FeatureCard
              icon={<Smartphone className="h-6 w-6 text-purple-600" />}
              title="モバイル完全対応"
              description="スマホやタブレットでの快適な操作を実現。いつでもどこでも、資産状況をチェックできます。"
            />
            {/* Feature 4 */}
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-amber-500" />}
              title="コピペで即分析"
              description="【Beta】CSV不要。Firstradeの画面をコピーして貼り付けるだけで、瞬時に損益やバランスを分析。"
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
              title="キー認証"
              description="アプリ右上の「認証」ボタンからキーを入力し、全機能をアンロック。"
            />
            <StepCard
              number="03"
              title="分析スタート"
              description="CSVをアップロードするか、テキストを貼り付けて、自動計算を実行。"
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
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