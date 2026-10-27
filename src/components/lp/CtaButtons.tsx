// src/components/lp/CtaButtons.tsx
import { ArrowRight, CalendarClock, PlayCircle } from 'lucide-react';
import { CURRENT_EDITION, DEMO_URL, IS_ON_SALE, PURCHASE_URL, SALES_NOTICE } from '@/config/license';
import { TrackedLink } from './TrackedLink';

interface Props {
  /** 計測用の配置ラベル */
  placement: string;
  className?: string;
}

/**
 * 購入ボタンとデモ体験ボタンの組
 */
export function CtaButtons({ placement, className = '' }: Props) {
  // 販売前は購入ボタンの代わりに発売予定を表示し、デモを主なボタンにする
  if (!IS_ON_SALE) {
    return (
      <div className={`flex flex-col items-center gap-3 w-full sm:w-auto ${className}`}>
        <TrackedLink
          href={DEMO_URL}
          event="cta_demo_click"
          placement={placement}
          className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-navy-900 bg-white rounded-full hover:bg-brand-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-0.5"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          デモで30秒体験（登録不要）
        </TrackedLink>
        {SALES_NOTICE && (
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <CalendarClock className="h-4 w-4 text-accent-teal flex-shrink-0" />
            {SALES_NOTICE.short}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto ${className}`}>
      <TrackedLink
        href={PURCHASE_URL}
        event="cta_purchase_click"
        placement={placement}
        className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-navy-900 bg-white rounded-full hover:bg-brand-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-0.5"
      >
        <span className="relative z-10 flex items-center">
          {CURRENT_EDITION.price}で購入する
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </TrackedLink>
      <TrackedLink
        href={DEMO_URL}
        event="cta_demo_click"
        placement={placement}
        className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-200 bg-white/5 border border-white/15 rounded-full hover:bg-white/10 hover:text-white transition-all backdrop-blur-md hover:-translate-y-0.5"
      >
        <PlayCircle className="mr-2 h-4 w-4" />
        デモで30秒体験（登録不要）
      </TrackedLink>
    </div>
  );
}
