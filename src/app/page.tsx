import Link from 'next/link';
import Image from 'next/image';
import { Download, TrendingUp, Smartphone, Zap, CheckCircle2, XCircle, Database, Quote, AlertTriangle, CreditCard, Lock, Gift } from 'lucide-react';
import { CURRENT_EDITION, IS_ON_SALE, RETURNING_USER_NOTICE, UPCOMING_EDITION } from '@/config/license';
import { CtaButtons } from '@/components/lp/CtaButtons';
import { MobileStickyCta } from '@/components/lp/MobileStickyCta';
import { ComparisonSection } from '@/components/lp/ComparisonSection';
import { FilingGuideSection } from '@/components/lp/FilingGuideSection';
import { TrustSection } from '@/components/lp/TrustSection';
import { LpFaqSection } from '@/components/lp/LpFaqSection';

// キャッシュを無効化し、常に最新のコンテンツを表示
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-clip">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy-900 text-white min-h-[90vh] flex items-center justify-center py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 noise-bg opacity-30 mix-blend-soft-light pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-teal/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse-slow delay-1000" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">

            {/* Badge */}
            <div className="animate-fade-up opacity-0 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-200 backdrop-blur-md mb-8">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent-teal shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-pulse"></span>
              <span className="tracking-widest">{IS_ON_SALE ? CURRENT_EDITION.label : `${UPCOMING_EDITION.label} 準備中`}・Firstrade専用</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up opacity-0 [animation-delay:100ms] text-[2.1rem] leading-[1.3] sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight mb-6 sm:leading-[1.2]">
              <span className="inline-block">Firstradeの確定申告、</span><br />
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-white to-accent-teal drop-shadow-sm">
                CSVを入れるだけ。
              </span>
            </h1>

            {/* Subheadline */}
            <p className="animate-fade-up opacity-0 [animation-delay:200ms] text-base sm:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed font-light tracking-wide">
              <span className="inline-block">配当金も売却損益も、</span><span className="inline-block">取引日ごとの為替レートで</span><br className="hidden sm:block" />
              <strong className="inline-block font-semibold text-white">日本円に自動換算・年間集計</strong>。<br />
              <span className="inline-block">年に何十回もの為替計算と</span><span className="inline-block">Excel作業から解放されます。</span>
            </p>

            {/* CTA Buttons */}
            <CtaButtons placement="hero" className="animate-fade-up opacity-0 [animation-delay:300ms]" />

            {/* Trust points */}
            <ul className="animate-fade-up opacity-0 [animation-delay:400ms] mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 text-left sm:text-center text-sm text-slate-300">
              <li className="flex sm:flex-col items-center gap-2 sm:gap-1">
                <CreditCard className="h-4 w-4 text-accent-teal flex-shrink-0" />
                {IS_ON_SALE ? (
                  <span>{CURRENT_EDITION.price}（{CURRENT_EDITION.priceJpyApprox}）<br className="hidden sm:block" />{CURRENT_EDITION.validUntil}まで追加料金なし</span>
                ) : (
                  <span>{UPCOMING_EDITION.label}は{CURRENT_EDITION.price}予定<br className="hidden sm:block" /><span className="sm:hidden">（</span>{UPCOMING_EDITION.validUntil}まで追加料金なし<span className="sm:hidden">）</span></span>
                )}
              </li>
              <li className="flex sm:flex-col items-center gap-2 sm:gap-1">
                <Lock className="h-4 w-4 text-accent-teal flex-shrink-0" />
                <span>CSVはサーバーに送信せず<br className="hidden sm:block" />ブラウザ内で計算</span>
              </li>
              <li className="flex sm:flex-col items-center gap-2 sm:gap-1">
                <CheckCircle2 className="h-4 w-4 text-accent-teal flex-shrink-0" />
                <span>無料でデモ・計算結果の<br className="hidden sm:block" />一部表示まで試せる</span>
              </li>
            </ul>

            {/* Product screenshot */}
            <div className="animate-fade-up opacity-0 [animation-delay:500ms] mt-12 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-black/40">
              <Image
                src="/images/dividend.png"
                alt="配当金明細の画面（取引日ごとに日本円へ換算し、月次・年間で集計）"
                width={1280}
                height={800}
                priority
                className="w-full h-auto rounded-xl"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Returning User Notice */}
      {RETURNING_USER_NOTICE && (
        <section className="relative bg-stone-50 py-6 z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto flex items-start gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
              <Gift className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-stone-700 leading-relaxed">
                <strong className="text-stone-900">{RETURNING_USER_NOTICE.title}</strong>
                <span className="mx-1">：</span>
                {RETURNING_USER_NOTICE.body}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Problem Section */}
      <section className="relative py-20 sm:py-32 bg-navy-800 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-teal/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-6 tracking-tight">
              なぜFirstradeの確定申告は<br />こんなに面倒なのか？
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
              国内証券と違い、特定口座のないFirstradeでは<br className="hidden sm:block" />
              すべての計算を自分で行わなければなりません。
            </p>
          </div>

          <p className="md:hidden mb-2 text-right text-xs text-slate-500">横にスワイプ →</p>
          <div className="-mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:mx-auto md:px-0 md:pb-0 md:overflow-visible md:grid [&>*]:w-[85%] [&>*]:flex-shrink-0 [&>*]:snap-center md:[&>*]:w-auto md:grid-cols-3 md:gap-10 max-w-6xl">
            <ProblemCard
              icon={<Database className="w-8 h-8" />}
              title="特定口座がない"
              description="国内証券のような自動サポートはありません。配当受取も売買も、すべて自分で日本円に換算し記録する必要があります。"
            />
            <ProblemCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="為替レート地獄"
              description="6月15日の配当、9月20日の配当... 取引のたびにその日の為替レートを調べて計算。年間60回以上繰り返すのは苦痛です。"
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
      <section className="relative py-20 sm:py-32 bg-navy-900 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <span className="text-accent-teal font-bold tracking-wider uppercase text-xs mb-3 block opacity-80">Features</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-6 tracking-tight">
              <span className="inline-block">FirstScopeで</span><span className="inline-block">解決できること</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed font-light">
              面倒な単純作業はツールに任せて、<br className="sm:hidden" />
              本当に大切な投資判断に時間を使いましょう。
            </p>
          </div>

          <p className="md:hidden mb-2 text-right text-xs text-slate-500">横にスワイプ →</p>
          <div className="-mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:mx-auto md:px-0 md:pb-0 md:overflow-visible md:grid [&>*]:w-[85%] [&>*]:flex-shrink-0 [&>*]:snap-center md:[&>*]:w-auto md:grid-cols-2 md:gap-6 max-w-5xl">
            <FeatureCard
              icon={<Download className="h-6 w-6 text-brand-400" />}
              title="配当金明細"
              description="Tax CenterのCSVをドロップするだけで、ECBレートで日本円に自動換算。月次・年間サマリーも自動生成。"
              imageSrc="/images/dividend.png"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-accent-teal" />}
              title="売却損益"
              description="Gain/Lossファイルから譲渡損益計算書に必要なデータを一発出力。特定口座のような利便性を。"
              imageSrc="/images/gainloss.png"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-amber-400" />}
              title="損益シミュレーター"
              description="Tax Centerの損益データをコピペするだけで、今年の確定損益を即座に計算。節税のための損出し戦略に役立ちます。"
              imageSrc="/images/simulator.png"
            />
            <FeatureCard
              icon={<Smartphone className="h-6 w-6 text-indigo-400" />}
              title="ポートフォリオ"
              description="【Beta】CSV不要。Firstradeの画面をコピーして貼り付けるだけで、瞬時に損益やバランスを分析。"
              imageSrc="/images/portfolio.png"
            />
          </div>

          <div className="mt-16 flex flex-col items-center gap-3">
            <p className="text-sm text-slate-400">まずはデモデータで、実際の計算画面を確認できます</p>
            <CtaButtons placement="mid_features" />
          </div>
        </div>
      </section>

      {/* How to use in filing */}
      <FilingGuideSection />

      {/* Comparison */}
      <ComparisonSection />

      {/* Trust: data handling, exchange rates, payment */}
      <TrustSection />

      {/* Can/Cannot Section */}
      <section className="relative py-16 sm:py-24 bg-navy-800 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-3xl font-heading font-extrabold text-white mb-6 tracking-tight">できること / できないこと</h2>
            <p className="text-slate-400 font-light">
              FirstScopeは「確定申告の補助」に特化したツールです。<br className="hidden sm:block" />
              機能の範囲を明確にし、あなたのニーズに合うかご確認ください。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-navy-900 rounded-3xl p-8 border border-accent-teal/20 shadow-[0_0_30px_rgba(45,212,191,0.05)] relative overflow-hidden group hover:border-accent-teal/40 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-teal/5 rounded-bl-full" />
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-accent-teal/10 rounded-lg text-accent-teal">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-heading">できること</h3>
              </div>
              <ul className="space-y-4">
                <CanItem text="配当金の日本円換算（ECBレート適用）" />
                <CanItem text="確定申告用CSV出力" />
                <CanItem text="譲渡損益の計算補助（取得費・譲渡価額）" />
                <CanItem text="外国税額控除に必要な源泉徴収額の集計" />
              </ul>
            </div>

            <div className="bg-navy-900 rounded-3xl p-8 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-bl-full" />
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 font-heading">できないこと</h3>
              </div>
              <ul className="space-y-4">
                <CannotItem text="税務署への直接申告（e-Tax連携など）" />
                <CannotItem text="個別の税務相談（税理士法に抵触するため）" />
                <CannotItem text="Firstrade以外の証券会社への対応" />
                <CannotItem text="仮想通貨や他の金融商品の計算" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 sm:py-24 bg-navy-900 border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-teal/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-3xl font-heading font-extrabold text-white mb-4 tracking-tight">
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

          <div className="mt-16 flex justify-center">
            <CtaButtons placement="mid_testimonials" />
          </div>
        </div>
      </section>

      {/* Developer Story Section */}
      <section className="relative py-16 sm:py-24 bg-navy-900 border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-500/50" />
              <span className="text-brand-400 font-bold tracking-wider uppercase text-xs">Developer Story</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-500/50" />
            </div>

            <h2 className="text-3xl font-heading font-extrabold text-white mb-8 text-center tracking-tight">
              開発者より
            </h2>

            <div className="relative bg-navy-800 p-8 sm:p-12 rounded-3xl border border-white/5 shadow-2xl">
              <Quote className="absolute top-8 left-8 h-10 w-10 text-brand-500/20" />
              <div className="relative z-10 space-y-6 text-slate-300 leading-loose font-serif text-lg">
                <p>
                  「毎年、憂鬱な気持ちで確定申告をしていました。税理士も高額だし、いつも手探りでやるしかない…」
                </p>
                <p>
                  ある読者の方から頂いたこの一通のメッセージが、すべての始まりでした。<br />
                  Firstradeでの投資は魅力的ですが、確定申告の壁は想像以上に高く、孤独です。
                </p>
                <p>
                  「この悩みを抱えているのは、私一人ではない」
                </p>
                <p>
                  そう気づき、同じFirstradeユーザーとして、自分の申告にも使うために作ったのがこのツールです。
                </p>
                <p>
                  公開後は利用者の方から寄せられた声をもとに、計算ロジックの見直しを重ね、自動テストで計算結果を検証しながら毎年改良を続けています。
                </p>
                <p>
                  面倒な確定申告の壁は、ツールに任せてサクッと乗り越えていきましょう！
                </p>
              </div>
              <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
                <div className="text-right">
                  <p className="text-white font-bold font-heading">ぱぱぞん</p>
                  <p className="text-xs text-slate-500">個人開発者 / 米国株投資家</p>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 overflow-hidden">
                  <Image
                    src="/images/Papazon.webp"
                    alt="Papazon"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 sm:py-24 bg-navy-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-3xl font-heading font-extrabold text-white mb-6 tracking-tight">使い方は、驚くほど簡単</h2>
            <p className="text-slate-400 font-light">
              複雑な設定は一切不要。3ステップで計算が完了します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-brand-500/0 via-brand-500/30 to-brand-500/0 z-0" />

            <StepCard
              number="01"
              title="CSVをアップロード"
              description="FirstradeからダウンロードしたCSVファイル（Tax Center / Gain&Loss）をドラッグ＆ドロップ。"
            />
            <StepCard
              number="02"
              title="自動計算・処理"
              description="システムが取引日ごとのECB為替レートを自動取得し、日本円換算と損益計算を一瞬で実行します。"
            />
            <StepCard
              number="03"
              title="結果を確認・保存"
              description="計算結果は画面で確認でき、Excel形式でダウンロードも可能。そのまま確定申告の基礎資料に。"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <LpFaqSection />

      {/* Footer CTA Section */}
      <section className="relative py-16 sm:py-24 bg-navy-900 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 z-0 noise-bg opacity-30 mix-blend-soft-light pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-white mb-8 leading-tight tracking-tight">
              確定申告のストレスから、<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-accent-teal">今すぐ解放されましょう。</span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed font-light">
              面倒な為替計算と集計作業を自動化して、<br />
              大切な時間を守りましょう。
            </p>

            <div className="flex justify-center">
              <CtaButtons placement="footer" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 pb-28 md:pb-8 bg-navy-900/80 text-slate-400 text-center text-sm border-t border-white/5 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
            <Link href="/" className="font-bold text-white hover:text-slate-300 transition-colors">
              FirstScope
            </Link>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs font-medium text-slate-400">
              <Link href="/legal" className="hover:text-white transition-colors">
                特定商取引法に基づく表記
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                プライバシーポリシー
              </Link>
              <Link
                href="/faq"
                className="hover:text-white transition-colors"
              >
                よくある質問
              </Link>
              <a
                href="https://majestic-gateway-e4a.notion.site/2d3e8c4088938053a31df1916c843dd0?pvs=105"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                お問い合わせ
              </a>
            </div>
          </div>
          <div className="mt-4 text-slate-500 text-xs text-center font-light">
            <p>© {new Date().getFullYear()} Nomad Family. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <MobileStickyCta />
    </div>
  );
}

function ProblemCard({ icon, title, description, isHighlight }: { icon: React.ReactNode; title: string; description: string; isHighlight?: boolean }) {
  return (
    <div className={`
      relative p-8 rounded-3xl border transition-all duration-300 group
      ${isHighlight
        ? 'bg-brand-900/20 border-brand-500/30 shadow-[0_0_30px_rgba(14,165,233,0.15)] z-10 md:-translate-y-4'
        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
      }
    `}>
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl transition-colors
        ${isHighlight ? 'bg-brand-500/20 text-brand-400' : 'bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10'}
      `}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-4 font-heading tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm font-light">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, imageSrc }: { icon: React.ReactNode; title: string; description: string; imageSrc?: string }) {
  return (
    <div className="group bg-navy-800 rounded-3xl p-2 border border-white/5 hover:border-white/10 transition-all duration-300">
      {imageSrc && (
        <div className="w-full aspect-[4/3] mb-4 rounded-2xl overflow-hidden bg-navy-900 relative">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      )}
      <div className="p-4 pt-2">
        <div className="flex items-center mb-3 text-brand-400">
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 mr-3 group-hover:text-accent-teal transition-colors">{icon}</div>
          <h3 className="text-lg font-bold text-white tracking-tight font-heading group-hover:text-brand-300 transition-colors">{title}</h3>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed font-light group-hover:text-slate-300 transition-colors">{description}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="group relative p-8 rounded-3xl bg-navy-800 border border-white/5 text-center hover:border-brand-500/30 transition-all duration-300">
      <div className="w-12 h-12 bg-white/5 text-brand-400 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 font-heading">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight font-heading">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-light">{description}</p>
    </div>
  )
}

function CanItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="h-5 w-5 text-accent-teal flex-shrink-0 mt-0.5" />
      <span className="text-slate-300 font-medium text-sm">{text}</span>
    </li>
  );
}

function CannotItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <XCircle className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
      <span className="text-slate-500 text-sm">{text}</span>
    </li>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="bg-navy-800 rounded-3xl p-8 border border-white/5 relative group hover:border-white/10 transition-colors">
      <Quote className="absolute top-8 left-8 h-8 w-8 text-brand-900/50" />
      <p className="relative z-10 text-slate-300 leading-loose mb-6 pt-6 font-light">「{quote}」</p>
      <div className="flex items-center gap-4 relative z-10 border-t border-white/5 pt-6">
        <div className="w-12 h-12 bg-gradient-to-br from-navy-700 to-navy-800 rounded-full flex items-center justify-center text-brand-400 font-bold text-lg border border-white/5">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-white font-heading">{name}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">{role}</p>
        </div>
      </div>
    </div>
  );
}