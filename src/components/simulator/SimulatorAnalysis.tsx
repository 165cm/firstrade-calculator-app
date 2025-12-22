// src/components/simulator/SimulatorAnalysis.tsx
'use client';

import React, { useState, useEffect, useImperativeHandle } from 'react';
import type { SimulatorSummary, SimulatorEntry } from '@/types/simulator';
import { parseGainLossText, buildGainLossSummary } from '@/utils/simulator/parseGainLoss';
import { getExchangeRate, DEFAULT_RATE } from '@/data/exchangeRates';
import { exportSimulatorToCsv, downloadCsv } from '@/utils/export/csvExport';
import { GainLossInput } from './GainLossInput';
import { GainLossSummaryComponent } from './GainLossSummary';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const SUMMARY_STORAGE_KEY = 'simulator-summary';

export interface SimulatorHandle {
    clear: () => void;
    downloadCSV: () => void;
}

interface Props {
    onDataStatusChange?: (hasData: boolean) => void;
}

export const SimulatorAnalysis = React.forwardRef<SimulatorHandle, Props>(({ onDataStatusChange }, ref) => {
    const [summary, setSummary] = useState<SimulatorSummary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [inputCollapsed, setInputCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [defaultRateWarning, setDefaultRateWarning] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // localStorageから分析結果を復元
    useEffect(() => {
        try {
            const saved = localStorage.getItem(SUMMARY_STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.summary) {
                    setSummary(data.summary);
                    setInputCollapsed(true); // 結果があれば入力を折りたたむ
                }
                if (data.defaultRateWarning) {
                    setDefaultRateWarning(data.defaultRateWarning);
                }
            }
        } catch (e) {
            console.warn('Failed to restore summary from localStorage:', e);
        }
        setIsInitialized(true);
    }, []);

    // データの状態変更を親に通知
    useEffect(() => {
        if (isInitialized) {
            onDataStatusChange?.(!!summary);
        }
    }, [summary, isInitialized, onDataStatusChange]);

    // localStorageに分析結果を保存
    useEffect(() => {
        if (!isInitialized) return;
        try {
            if (summary) {
                localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify({
                    summary,
                    defaultRateWarning
                }));
            } else {
                localStorage.removeItem(SUMMARY_STORAGE_KEY);
            }
        } catch (e) {
            console.warn('Failed to save summary to localStorage:', e);
        }
    }, [summary, defaultRateWarning, isInitialized]);

    const handleClearResults = () => {
        setSummary(null);
        setDefaultRateWarning(null);
        setInputCollapsed(false);
        try {
            localStorage.removeItem(SUMMARY_STORAGE_KEY);
        } catch (e) {
            console.warn('Failed to clear summary from localStorage:', e);
        }
    };

    useImperativeHandle(ref, () => ({
        clear: handleClearResults,
        downloadCSV: () => {
            if (!summary) return;
            try {
                const timestamp = new Date().toISOString().split('T')[0];
                const csvContent = exportSimulatorToCsv(summary.entries);
                downloadCsv(csvContent, `売買シミュレーション_${timestamp}.csv`);
            } catch (error) {
                console.error('Export error:', error);
            }
        }
    }));

    const handleSubmit = async (text: string) => {
        setError(null);
        setDefaultRateWarning(null);
        setIsLoading(true);

        try {
            const { entries, shortTermSummary, longTermSummary } = parseGainLossText(text);

            if (entries.length === 0) {
                setError('有効な損益データが見つかりませんでした。フォーマットを確認してください。');
                setIsLoading(false);
                return;
            }

            // デフォルトレートを使用した日付を追跡
            const datesWithDefaultRate: string[] = [];

            // 為替レートを取得して円換算
            const entriesWithJpy: SimulatorEntry[] = await Promise.all(
                entries.map(async (entry) => {
                    try {
                        const [rateAcquired, rateSold] = await Promise.all([
                            getExchangeRate(entry.dateAcquired),
                            getExchangeRate(entry.dateSold)
                        ]);

                        // デフォルトレートが使用されたかチェック
                        if (rateAcquired === DEFAULT_RATE) {
                            datesWithDefaultRate.push(entry.dateAcquired);
                        }
                        if (rateSold === DEFAULT_RATE) {
                            datesWithDefaultRate.push(entry.dateSold);
                        }

                        return {
                            ...entry,
                            exchangeRateAcquired: rateAcquired,
                            exchangeRateSold: rateSold,
                            salesProceedsJpy: entry.salesProceeds * rateSold,
                            adjustedCostJpy: entry.adjustedCost * rateAcquired,
                            netGainLossJpy: (entry.salesProceeds * rateSold) - (entry.adjustedCost * rateAcquired)
                        };
                    } catch (e) {
                        console.warn(`為替レート取得エラー: ${entry.symbol}`, e);
                        return entry;
                    }
                })
            );

            // デフォルトレートの警告を設定
            if (datesWithDefaultRate.length > 0) {
                const uniqueDates = [...new Set(datesWithDefaultRate)].sort();
                setDefaultRateWarning(
                    `一部の日付（${uniqueDates.slice(0, 3).join(', ')}${uniqueDates.length > 3 ? '...' : ''}）の為替データがないため、デフォルト値（${DEFAULT_RATE}円）を使用しています。`
                );
            }

            const summaryData = buildGainLossSummary(entriesWithJpy, shortTermSummary, longTermSummary);
            setSummary(summaryData);

            // 分析後は入力を折りたたむ
            setInputCollapsed(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : '計算中にエラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    };

    const handleError = (message: string) => {
        setError(message);
    };

    return (
        <div className="space-y-4">
            {/* シミュレーターバナー */}
            <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800 text-sm">売買シミュレーター</AlertTitle>
                <AlertDescription className="text-blue-700 text-xs">
                    Firstradeの Gain/Loss 画面からコピペして損益を計算できます。年度末のCSVファイルを待たずに税金対策が可能です。
                </AlertDescription>
            </Alert>

            {/* デフォルトレート警告 */}
            {defaultRateWarning && (
                <Alert className="bg-orange-50 border-orange-200">
                    <AlertTitle className="text-orange-800 text-sm">為替レート警告</AlertTitle>
                    <AlertDescription className="text-orange-700 text-xs">
                        {defaultRateWarning}
                    </AlertDescription>
                </Alert>
            )}

            {/* 分析結果（入力より先に表示） */}
            {summary && (
                <div>
                    <GainLossSummaryComponent summary={summary} />
                </div>
            )}

            {/* テキスト入力（分析後は折りたたみ） */}
            <GainLossInput
                onSubmit={handleSubmit}
                onError={handleError}
                isCollapsed={inputCollapsed}
                onToggle={() => setInputCollapsed(!inputCollapsed)}
                isLoading={isLoading}
            />

            {/* エラー表示 */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
});

SimulatorAnalysis.displayName = 'SimulatorAnalysis';
