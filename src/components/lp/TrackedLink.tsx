// src/components/lp/TrackedLink.tsx
'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackEvent, type AnalyticsEvent } from '@/lib/analytics';

interface Props {
  href: string;
  event: AnalyticsEvent;
  /** どのボタンかを区別するためのラベル（例: hero, mid_features, sticky） */
  placement: string;
  className?: string;
  children: ReactNode;
}

/**
 * クリックを計測するリンク。外部URL（http〜）は新しいタブで開く
 */
export function TrackedLink({ href, event, placement, className, children }: Props) {
  const handleClick = () => trackEvent(event, { placement });

  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={handleClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
