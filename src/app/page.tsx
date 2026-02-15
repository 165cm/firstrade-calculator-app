import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Download, TrendingUp, Smartphone, Zap, ShieldCheck, CheckCircle2, XCircle, Database, Quote, AlertTriangle, CreditCard, Globe, Lock } from 'lucide-react';
import { ChatSupport } from '@/components/common/ChatSupport';

// キャッシュを無効化し、常に最新のコンテンツを表示
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
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
            <div className="animate-fade-up opacity-0 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-200 backdrop-blur-md mb-8 hover:border-brand-500/50 hover:bg-white/10 transition-colors duration-300">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent-teal shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-pulse"></span>
              <span className="tracking-widest uppercase">2025年版リリース</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up opacity-0 [animation-delay:100ms] text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight mb-6 leading-[1.2]">
              Firstradeの確定申告を<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-white to-accent-teal drop-shadow-sm">
                効率化・サポートする
              </span>
            </h1>

            {/* Subheadline */}
            <p className="animate-fade-up opacity-0 [animation-delay:200ms] text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed font-light tracking-wide">
              為替レートの確認、日本円への換算、年間取引の集計...<br className="hidden sm:block" />
              面倒な計算と集計を自動化して、最短ルートで完了。<br />
              もうExcelと格闘する必要はありません。
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-up opacity-0 [animation-delay:300ms] flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href="https://papazon.gumroad.com/l/firstrade-ja"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-navy-900 bg-white rounded-full hover:bg-brand-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  今すぐ購入する
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
              <Link
                href="/dividend"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-all backdrop-blur-md hover:-translate-y-0.5"
              >
                無料で試す
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-slate-500/50">
              <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-slate-500 to-transparent"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Campaign Section - Letter Style */}
      <section className="relative bg-stone-50 py-12 sm:py-16 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Letter card */}
            <div className="relative bg-white rounded-sm px-8 py-10 sm:px-14 sm:py-14 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-stone-200/80"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              {/* Top decorative line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-stone-300" />

              <p className="text-stone-400 text-xs tracking-[0.25em] text-center mb-8">
                2025年版をご検討中の皆さまへ
              </p>

              <div className="text-stone-700 text-[15px] sm:text-base leading-[2] tracking-wide text-center space-y-6">
                <p>
                  おかげさまで、FirstScopeは今年<br className="sm:hidden" />多くの方にご利用いただき、<br />
                  次年度の開発を支える基盤が<br className="sm:hidden" />整ってまいりました。
                </p>
                <p>
                  その感謝を形にするため、<br /><br className="sm:hidden" /><strong className="text-stone-900">2025年版をご購入いただいた方だけの<br className="sm:hidden" />限定特典</strong>として、<br />
                  次回以降のアップデート版で使える<br className="sm:hidden" /><strong className="text-stone-900">50%OFFクーポン</strong>をお届けします。
                </p>
                <p className="text-stone-500 text-sm leading-[1.9]">
                  今年ご購入いただければ、<br className="sm:hidden" />来年以降もずっとお得に。<br />
                  早期にお選びくださった方への、<br className="sm:hidden" />ささやかな恩返しです。
                </p>
                <p className="text-stone-400 text-xs leading-relaxed">
                  ※クーポンは次回版の発売時に<br className="sm:hidden" />Gumroadにご登録のメールアドレスへお届けします。<br />
                  ※すでにご購入済みの方にも<br className="sm:hidden" />適用させていただきます。
                </p>
              </div>

              {/* Bottom decorative line */}
              <div className="mt-10 flex items-center justify-center gap-3">
                <div className="w-8 h-px bg-stone-300" />
                <span className="text-stone-300 text-xs">✦</span>
                <div className="w-8 h-px bg-stone-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative py-32 bg-navy-800 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-teal/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-6 tracking-tight">
              なぜFirstradeの確定申告は<br />こんなに面倒なのか？
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
              国内証券と違い、特定口座のないFirstradeでは<br className="hidden sm:block" />
              すべての計算を自分で行わなければなりません。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
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
      <section className="relative py-32 bg-navy-900 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-accent-teal font-bold tracking-wider uppercase text-xs mb-3 block opacity-80">Features</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-6 tracking-tight">
              FirstScopeで解決できること
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed font-light">
              面倒な単純作業はツールに任せて、<br className="sm:hidden" />
              本当に大切な投資判断に時間を使いましょう。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      </section>

      {/* Data Source Section */}
      <section className="relative py-24 bg-navy-800 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto bg-navy-900/50 rounded-3xl p-8 sm:p-12 border border-white/5 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />

            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-600 to-navy-900 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-900/20 border border-white/10">
                  <Database className="h-9 w-9 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight font-heading">
                  Frankfurter APIを採用
                </h3>
                <p className="text-slate-400 mb-6 leading-relaxed font-light">
                  <strong className="text-white font-semibold bg-white/10 px-1 py-0.5 rounded mx-1">欧州中央銀行(ECB)</strong>公表の為替レートを使用。<br className="hidden sm:block" />
                  オープンソースAPI「Frankfurter」により、透明性と信頼性を担保しています。
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 flex-1">
                    <ShieldCheck className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <div>
                      <span className="block font-bold text-white text-sm">公的データ</span>
                      <span className="text-xs text-slate-400">ECB公式レートを使用</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 flex-1">
                    <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <div>
                      <span className="block font-bold text-white text-sm">透明性・検証可能</span>
                      <span className="text-xs text-slate-400">ソースが明確で誰でも確認可能</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Security Section */}
      <section className="relative py-24 bg-navy-900 border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-accent-teal/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <span className="text-accent-teal font-bold tracking-wider uppercase text-xs mb-3 block opacity-80">Security</span>
                <h2 className="text-3xl font-heading font-extrabold text-white mb-6 tracking-tight">
                  決済は<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-accent-teal">Gumroad</span>で安全に。
                </h2>
                <p className="text-lg text-slate-400 mb-8 leading-relaxed font-light">
                  世界中のクリエイターが利用するプラットフォーム「Gumroad」を採用。<br />
                  カード情報は当サイトには一切保存されません。
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400 border border-brand-500/20">
                      <Globe className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-slate-300">世界クラスの信頼性あるプラットフォーム</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-accent-teal/10 rounded-lg text-accent-teal border border-accent-teal/20">
                      <Lock className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-slate-300">高度な暗号化通信で保護された決済</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full max-w-md">
                <div className="bg-navy-800 rounded-3xl p-8 text-white shadow-2xl shadow-black/50 relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-teal/10 rounded-full blur-2xl" />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                      <CreditCard className="w-8 h-8 text-accent-teal" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 font-heading">Secure Payment</h3>
                    <p className="text-slate-500 text-sm mb-6">Powered by Gumroad</p>

                    <div className="w-full bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                      <span className="text-sm font-medium text-slate-300">256-bit SSL Encryption</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Can/Cannot Section */}
      <section className="relative py-24 bg-navy-800 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
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
      <section className="py-24 bg-navy-900 border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-teal/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
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
        </div>
      </section>

      {/* Developer Story Section */}
      <section className="relative py-24 bg-navy-900 border-t border-white/5 overflow-hidden">
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
                  そう気づき、プログラミング初心者の私がAIと共に5日間缶詰めになって開発したのが、このツールです。<br />
                  プロのような高度なシステムではないかもしれませんが、同じ悩みを持つ個人投資家として、「とにかく簡単に、憂鬱な作業を解消したい」という一心で作りました。
                </p>
                <p>
                  まずはこの面倒な確定申告という壁を、ツールを使ってサクッと乗り越えていきましょう！
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
      <section className="relative py-24 bg-navy-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
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

      {/* Footer CTA Section */}
      <section className="relative py-24 bg-navy-900 border-t border-white/5 overflow-hidden">
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

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <a
                href="https://papazon.gumroad.com/l/firstrade-ja"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-navy-900 bg-white rounded-full hover:bg-brand-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  今すぐ購入する
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
              <Link
                href="/dividend"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-all backdrop-blur-md hover:-translate-y-0.5"
              >
                無料で試す
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 py-12 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <span className="text-xl font-bold text-white font-heading tracking-tight mb-4 block">FirstScope</span>
              <p className="text-sm font-light leading-relaxed max-w-xs">
                Firstradeユーザーのための確定申告支援ツール。<br />
                複雑な為替計算を自動化し、投資家の時間を創出します。
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 font-heading">Product</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><Link href="/" className="hover:text-brand-300 transition-colors">Home</Link></li>
                <li><Link href="/dividend" className="hover:text-brand-300 transition-colors">Free Trial</Link></li>
                <li><a href="https://papazon.gumroad.com/l/firstrade-ja" target="_blank" rel="noopener noreferrer" className="hover:text-brand-300 transition-colors">Buy Now</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 font-heading">Legal</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><Link href="/privacy" className="hover:text-brand-300 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-brand-300 transition-colors">Terms of Service</Link></li>
                <li><Link href="/tokusho" className="hover:text-brand-300 transition-colors">特定商取引法に基づく表記</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-sm font-light text-slate-500">
            &copy; {new Date().getFullYear()} FirstScope (Papazon). All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProblemCard({ icon, title, description, isHighlight }: { icon: React.ReactNode; title: string; description: string; isHighlight?: boolean }) {
  return (
    <div className={`
      relative p-8 rounded-3xl border transition-all duration-300 group
      ${isHighlight
        ? 'bg-brand-900/20 border-brand-500/30 shadow-[0_0_30px_rgba(14,165,233,0.15)] z-10 sm:-translate-y-4'
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