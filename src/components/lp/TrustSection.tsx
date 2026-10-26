// src/components/lp/TrustSection.tsx
import { CreditCard, Lock, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

function TrustCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-white/5 p-2.5 text-accent-teal">{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-white font-heading">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-slate-400">{children}</div>
    </div>
  );
}

/**
 * データの扱い・為替レート・決済についての安心材料
 */
export function TrustSection() {
  return (
    <section className="relative py-16 sm:py-24 bg-navy-800 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-accent-teal font-bold tracking-wider uppercase text-xs mb-3 block opacity-80">Trust</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            安心して使っていただくために
          </h2>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          <TrustCard icon={<Lock className="h-5 w-5" />} title="データはブラウザ内で処理">
            <p>読み込んだCSVの内容はサーバーに送信されず、お使いのブラウザの中だけで計算・保存されます。</p>
            <p className="text-xs text-slate-500">※ 配当利回りの計算で株価を自動取得する場合のみ、銘柄コードを送信します。</p>
          </TrustCard>
          <TrustCard icon={<RefreshCw className="h-5 w-5" />} title="為替レートは取引日ごとに自動適用">
            <p>欧州中央銀行（ECB）の参照レートを毎週更新し、取引日ごとに適用します。換算に使ったレートはCSVにも出力されます。</p>
            <p className="text-xs text-slate-500">※ 国税庁の原則はTTM（仲値）です。差は通常わずかですが、金額の大きい取引はTTMでのご確認をおすすめします。</p>
          </TrustCard>
          <TrustCard icon={<CreditCard className="h-5 w-5" />} title="決済はGumroadで安全に">
            <p>世界中のクリエイターが使う決済サービス「Gumroad」を利用しています。カード情報は当サイトに保存されません。</p>
          </TrustCard>
        </div>
      </div>
    </section>
  );
}
