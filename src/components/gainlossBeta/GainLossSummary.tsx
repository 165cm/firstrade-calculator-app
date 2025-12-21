// src/components/gainlossBeta/GainLossSummary.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { GainLossSummary as GainLossSummaryType, GainLossEntry, TermSummary } from '@/types/gainlossBeta';
import { HelpTooltip } from '../common/Tooltip';


interface Props {
    summary: GainLossSummaryType;
}

/**
 * 金額をフォーマット（コンパクト版）
 */
function formatUSD(value: number): string {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return isNegative ? `-$${formatted}` : `$${formatted}`;
}

function formatJPY(value: number): string {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const formatted = Math.round(absValue).toLocaleString('ja-JP');
    return isNegative ? `-¥${formatted}` : `¥${formatted}`;
}

/**
 * コンパクトな期間サマリー行
 */
const TermSummaryRow: React.FC<{
    label: string;
    term: TermSummary;
    colorClass: string;
}> = ({ label, term, colorClass }) => (
    <tr className={`border-b ${colorClass}`}>
        <td className="py-2 px-2 font-medium text-sm">{label}</td>
        <td className="py-2 px-2 text-right text-sm">{formatUSD(term.salesProceeds)}</td>
        <td className="py-2 px-2 text-right text-sm">{formatUSD(term.adjustedCost)}</td>
        <td className={`py-2 px-2 text-right text-sm font-bold ${term.netGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatUSD(term.netGainLoss)}
        </td>
        <td className={`py-2 px-2 text-right text-sm font-bold ${term.netGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {term.netGainLossJpy !== undefined ? formatJPY(term.netGainLossJpy) : '-'}
        </td>
        <td className="py-2 px-2 text-right text-xs text-gray-500">
            {term.gainPercent.toFixed(1)}%
        </td>
    </tr>
);

/**
 * 取引明細テーブル（コンパクト版）
 */
const CompactEntriesTable: React.FC<{ entries: GainLossEntry[] }> = ({ entries }) => {
    const [showAll, setShowAll] = useState(false);
    const shortTermEntries = entries.filter(e => e.termType === 'short');
    const longTermEntries = entries.filter(e => e.termType === 'long');

    const displayLimit = 15;
    const totalEntries = entries.length;
    const displayEntries = showAll ? entries : entries.slice(0, displayLimit);

    if (entries.length === 0) return null;

    return (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-xs">
                <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                        <th className="px-1.5 py-1.5 text-left w-16">Symbol</th>
                        <th className="px-1.5 py-1.5 text-center w-8">種別</th>
                        <th className="px-1.5 py-1.5 text-right w-12">数量</th>
                        <th className="px-1.5 py-1.5 text-center w-20">取得日</th>
                        <th className="px-1.5 py-1.5 text-center w-20">売却日</th>
                        <th className="px-1.5 py-1.5 text-right w-16">売却額</th>
                        <th className="px-1.5 py-1.5 text-right w-16">取得費</th>
                        <th className="px-1.5 py-1.5 text-right w-16">損益USD</th>
                        <th className="px-1.5 py-1.5 text-right w-20">損益JPY</th>
                    </tr>
                </thead>
                <tbody>
                    {displayEntries.map((entry, idx) => (
                        <tr
                            key={`${entry.symbol}-${idx}`}
                            className={`border-b border-gray-100 hover:bg-gray-50 ${entry.termType === 'short' ? 'bg-blue-50/30' : 'bg-green-50/30'
                                }`}
                        >
                            <td className="px-1.5 py-1">
                                <span className="font-medium">{entry.symbol}</span>
                                {entry.isWashSale && <span className="ml-0.5 text-orange-500 text-[10px]">WS</span>}
                            </td>
                            <td className="px-1.5 py-1 text-center">
                                <span className={`text-[10px] px-1 py-0.5 rounded ${entry.termType === 'short'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}>
                                    {entry.termType === 'short' ? '短' : '長'}
                                </span>
                            </td>
                            <td className="px-1.5 py-1 text-right tabular-nums">{entry.qty.toFixed(2)}</td>
                            <td className="px-1.5 py-1 text-center tabular-nums text-gray-600">{entry.dateAcquired.slice(5)}</td>
                            <td className="px-1.5 py-1 text-center tabular-nums text-gray-600">{entry.dateSold.slice(5)}</td>
                            <td className="px-1.5 py-1 text-right tabular-nums">{formatUSD(entry.salesProceeds)}</td>
                            <td className="px-1.5 py-1 text-right tabular-nums">{formatUSD(entry.adjustedCost)}</td>
                            <td className={`px-1.5 py-1 text-right tabular-nums font-medium ${entry.netGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatUSD(entry.netGainLoss)}
                            </td>
                            <td className={`px-1.5 py-1 text-right tabular-nums ${(entry.netGainLossJpy || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {entry.netGainLossJpy !== undefined ? formatJPY(entry.netGainLossJpy) : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 展開/折りたたみ & 統計 */}
            <div className="flex justify-between items-center mt-2 px-1 text-xs text-gray-500">
                <div className="flex gap-3">
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        短期: {shortTermEntries.length}件
                    </span>
                    <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        長期: {longTermEntries.length}件
                    </span>
                </div>
                {totalEntries > displayLimit && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-blue-600 hover:underline"
                    >
                        {showAll ? '折りたたむ' : `全${totalEntries}件を表示`}
                    </button>
                )}
            </div>
        </div>
    );
};

export const GainLossSummaryComponent: React.FC<Props> = ({ summary }) => {
    const shortTermEntries = summary.entries.filter(e => e.termType === 'short');
    const longTermEntries = summary.entries.filter(e => e.termType === 'long');

    return (
        <div className="space-y-3">
            {/* メインサマリー表 */}
            <Card>
                <CardContent className="py-3">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 text-gray-500 text-xs">
                                    <th className="py-1.5 px-2 text-left">区分</th>
                                    <th className="py-1.5 px-2 text-right">売却収入</th>
                                    <th className="py-1.5 px-2 text-right">取得費</th>
                                    <th className="py-1.5 px-2 text-right">純損益(USD)</th>
                                    <th className="py-1.5 px-2 text-right">純損益(JPY)</th>
                                    <th className="py-1.5 px-2 text-right">利益率</th>
                                </tr>
                            </thead>
                            <tbody>
                                <TermSummaryRow
                                    label="短期譲渡"
                                    term={summary.shortTerm}
                                    colorClass="bg-blue-50/50"
                                />
                                <TermSummaryRow
                                    label="長期譲渡"
                                    term={summary.longTerm}
                                    colorClass="bg-green-50/50"
                                />
                                <TermSummaryRow
                                    label="合計"
                                    term={summary.total}
                                    colorClass="bg-gray-100 font-bold"
                                />
                            </tbody>
                        </table>
                    </div>

                    {/* ハイライト情報 */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 pt-3 border-t text-xs">
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500">取引件数:</span>
                            <span className="font-medium">{summary.entries.length}件</span>
                            <span className="text-gray-400">
                                (短期{shortTermEntries.length}/長期{longTermEntries.length})
                            </span>
                        </div>
                        {summary.shortTerm.wsLossDisallowed > 0 && (
                            <div className="flex items-center gap-1 text-orange-600">
                                <span>WS損失不算入:</span>
                                <span className="font-medium">{formatUSD(summary.shortTerm.wsLossDisallowed)}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500">処理日時:</span>
                            <span className="text-gray-400">{new Date(summary.processedAt).toLocaleString('ja-JP')}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 取引明細（コンパクト版） */}
            <Card>
                <CardHeader className="py-2 pb-1">
                    <CardTitle className="text-sm">取引明細</CardTitle>
                </CardHeader>
                <CardContent className="py-2 pt-0">
                    <CompactEntriesTable entries={summary.entries} />
                </CardContent>
            </Card>
        </div>
    );
};
