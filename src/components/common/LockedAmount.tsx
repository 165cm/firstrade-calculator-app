// src/components/common/LockedAmount.tsx
'use client';

import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { PURCHASE_URL } from '@/config/license';

/**
 * ライセンス未認証のときに金額をぼかして表示する
 * ※ 実際の金額はDOMに出さず、ダミーの文字列をぼかして表示する（開発者ツールで読めないように）
 */
export function LockedAmount({ locked, children, placeholder = '¥0,000,000' }: {
  locked: boolean;
  children: ReactNode;
  placeholder?: string;
}) {
  if (!locked) return <>{children}</>;

  return (
    <span className="inline-flex items-center gap-1.5 select-none" title="ライセンス認証後に表示されます">
      <span className="blur-[6px]" aria-hidden="true">{placeholder}</span>
      <Lock className="h-3.5 w-3.5 text-gray-400" aria-label="ライセンス認証後に表示" />
    </span>
  );
}

/**
 * 円換算の合計がライセンス限定であることの案内
 */
export function LockedAmountNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="flex-1 leading-relaxed">
        <Lock className="mr-1 inline h-4 w-4 align-[-2px]" />
        {children ?? (
          <>確定申告に使う<strong>円換算の合計</strong>は、ライセンス認証後に表示されます。ドル建ての合計と明細の一部は無料で確認できます。</>
        )}
        <span className="block text-xs text-amber-700 mt-1">認証は「CSVエクスポート」ボタンから行えます。</span>
      </p>
      <a
        href={PURCHASE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        ライセンスを購入
      </a>
    </div>
  );
}
