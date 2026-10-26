// src/components/lp/MobileStickyCta.tsx
'use client';

import { useEffect, useState } from 'react';
import { CURRENT_EDITION, DEMO_URL, PURCHASE_URL } from '@/config/license';
import { TrackedLink } from './TrackedLink';

// ファーストビューを過ぎたら表示する（px）
const SHOW_AFTER_SCROLL = 600;

/**
 * スマホ用の画面下固定の購入バー（PCでは表示しない）
 */
export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > SHOW_AFTER_SCROLL);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden={!isVisible}
      className={`md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-navy-900/95 backdrop-blur-md px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="flex gap-3">
        <TrackedLink
          href={DEMO_URL}
          event="cta_demo_click"
          placement="sticky"
          className="flex-1 inline-flex items-center justify-center rounded-full border border-white/20 py-3 text-sm font-medium text-slate-200"
        >
          デモを試す
        </TrackedLink>
        <TrackedLink
          href={PURCHASE_URL}
          event="cta_purchase_click"
          placement="sticky"
          className="flex-[1.4] inline-flex items-center justify-center rounded-full bg-white py-3 text-sm font-bold text-navy-900"
        >
          {CURRENT_EDITION.price}で購入する
        </TrackedLink>
      </div>
    </div>
  );
}
