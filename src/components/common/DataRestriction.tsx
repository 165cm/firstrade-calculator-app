// src/components/common/DataRestriction.tsx
'use client';

import React from 'react';

interface DataRestrictionProps {
    isLicensed: boolean;
    visibleCount: number;
    totalCount: number;
    children: React.ReactNode;
    productUrl?: string;
}

/**
 * 未認証ユーザー向けにデータ表示を制限するラッパーコンポーネント
 * - 認証済み: 全データ表示
 * - 未認証: visibleCount件のみ表示 + ブラーオーバーレイ
 */
export function DataRestriction({
    isLicensed,
    visibleCount,
    totalCount,
    children,
    productUrl = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL || '#'
}: DataRestrictionProps) {
    const hiddenCount = totalCount - visibleCount;

    if (isLicensed || hiddenCount <= 0) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            {children}

            {/* ブラーオーバーレイ */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-20" />

            {/* 認証促進メッセージ */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center py-6 bg-gradient-to-t from-slate-50 to-transparent z-20">
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 text-center max-w-md">
                    <div className="flex items-center justify-center gap-2 text-slate-700 mb-2">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-medium">残り {hiddenCount} 件のデータがあります</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                        ライセンスを認証すると、すべてのデータを表示・CSVエクスポートできます
                    </p>
                    <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        ライセンスを購入
                    </a>
                </div>
            </div>
        </div>
    );
}

/**
 * テーブル行を制限するユーティリティ
 * @param items 全アイテム配列
 * @param isLicensed ライセンス認証済みか
 * @param visibleCount 未認証時の表示件数
 * @returns 表示するアイテム配列
 */
export function restrictItems<T>(
    items: T[],
    isLicensed: boolean,
    visibleCount: number = 3
): T[] {
    if (isLicensed) {
        return items;
    }
    return items.slice(0, visibleCount);
}
