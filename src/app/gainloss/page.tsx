// src/app/gainloss/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { GainLossFileUploader } from '@/components/gainloss/GainLossFileUploader';
import { ExportButton } from '@/components/common/ExportButton';
import { exportGainLossToCsv, downloadCsv } from '@/utils/export/csvExport';
import GainLossSummary from '@/components/gainloss/GainLossSummary';
import { DEMO_GAINLOSS_DATA } from '@/utils/demoData';

import { ProgressIndicator, ProgressState, createInitialProgress } from '@/components/common/ProgressIndicator';
import type { GainLossSummary as GainLossSummaryType, RawGainLossData } from '@/types/gainloss';
import { processGainLossData } from '@/utils/gainloss/processGainLoss';
import { calculateGainLossSummary } from '@/utils/gainloss/calculateSummary';
import { getDefaultRateUsedDates, clearDefaultRateTracking, DEFAULT_RATE } from '@/data/exchangeRates';
import { HelpTooltip } from '@/components/common/Tooltip';
import { Footer } from '@/components/common/Footer';

const STORAGE_KEY = 'gainloss_data';

export default function GainLossPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressState>(createInitialProgress());
  const [summary, setSummary] = useState<GainLossSummaryType | null>(null);
  const [defaultRateDates, setDefaultRateDates] = useState<string[]>([]);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // 初回マウント時にlocalStorageからデータを復元
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedDemoFlag = localStorage.getItem(STORAGE_KEY + '_isDemoData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSummary(parsed);
        setHasCachedData(true);
        // デモデータフラグも復元
        if (storedDemoFlag === 'true') {
          setIsDemoData(true);
        }
      }
    } catch (e) {
      console.error('Failed to restore gainloss data from localStorage:', e);
    }
  }, []);

  const handleUpload = async (data: RawGainLossData[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // デフォルト値追跡をクリア
      clearDefaultRateTracking();
      // デモデータかどうか判定
      const isDemo = data === DEMO_GAINLOSS_DATA;
      setIsDemoData(isDemo);

      const total = data.length;

      // フェーズ1: データ変換
      setProgress({
        phase: 'データを変換中...',
        current: 0,
        total,
        percentage: 10
      });

      const processedData = await processGainLossData(data);

      // フェーズ2: 為替レート取得・計算
      setProgress({
        phase: '為替レート取得・計算中...',
        current: Math.floor(total * 0.3),
        total,
        percentage: 40
      });

      // 少し待ってUIを更新（Reactのバッチ更新対策）
      await new Promise(resolve => setTimeout(resolve, 0));

      const calculatedSummary = await calculateGainLossSummary(processedData);

      // フェーズ3: 完了
      setProgress({
        phase: '完了',
        current: total,
        total,
        percentage: 100
      });

      setSummary(calculatedSummary);
      setHasCachedData(true);

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(calculatedSummary));
        // デモデータフラグも保存
        localStorage.setItem(STORAGE_KEY + '_isDemoData', isDemo ? 'true' : 'false');
      } catch (e) {
        console.error('Failed to save gainloss data to localStorage:', e);
      }

      // デフォルト値を使用した日付を取得
      const usedDates = getDefaultRateUsedDates();
      setDefaultRateDates(usedDates);
    } catch (e) {
      setError(e instanceof Error ? e.message : '損益データの処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + '_isDemoData');
    setSummary(null);
    setDefaultRateDates([]);
    setHasCachedData(false);
    setIsDemoData(false);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">売却損益</h1>
            <p className="text-sm text-slate-500 mt-1">FirstradeのCSVから株式売却益を計算し、確定申告用の円換算レポートを作成</p>
          </div>
          <div className="flex gap-3">
            {!summary && (
              <button
                onClick={() => handleUpload(DEMO_GAINLOSS_DATA)}
                className="bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium text-blue-700 shadow-sm border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                デモデータをインポート
              </button>
            )}

            {summary && (
              <>
                <ExportButton
                  bypassLicense={isDemoData}
                  onClick={() => setIsExportDialogOpen(true)}
                />

                <Dialog
                  isOpen={isExportDialogOpen}
                  onClose={() => setIsExportDialogOpen(false)}
                  title="CSVエクスポート形式の選択"
                >
                  <div className="flex flex-col space-y-4">
                    <p className="text-sm text-slate-500">
                      用途に合わせて出力形式を選択してください。
                    </p>

                    {/* 日本方式ボタン (上・目立つ配置) */}
                    <Button
                      className="w-full h-auto p-4 flex flex-col items-start space-y-1 bg-slate-900 hover:bg-slate-800"
                      onClick={() => {
                        if (!summary) return;
                        try {
                          const timestamp = new Date().toISOString().split('T')[0];
                          const allTrades = summary.symbolSummary.flatMap(symbolData =>
                            symbolData.trades.map(trade => ({
                              ...trade,
                              symbol: symbolData.symbol
                            }))
                          ).sort((a, b) =>
                            new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
                          );
                          const csvContent = exportGainLossToCsv(allTrades, 'JP');
                          downloadCsv(csvContent, `損益計算書_${timestamp}.csv`);
                          setIsExportDialogOpen(false);
                        } catch (error) {
                          console.error('Export error:', error);
                        }
                      }}
                    >
                      <div className="font-bold text-base">🇯🇵 日本方式</div>
                      <span className="text-xs text-slate-300 font-normal text-left block">
                        シンプルな「売却額 - 取得額」で計算します。
                      </span>
                    </Button>

                    {/* 米国方式ボタン (下・控えめ) */}
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-start space-y-1 text-slate-600 border-slate-300 hover:bg-slate-50"
                      onClick={() => {
                        if (!summary) return;
                        try {
                          const timestamp = new Date().toISOString().split('T')[0];
                          const allTrades = summary.symbolSummary.flatMap(symbolData =>
                            symbolData.trades.map(trade => ({
                              ...trade,
                              symbol: symbolData.symbol
                            }))
                          ).sort((a, b) =>
                            new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
                          );
                          const csvContent = exportGainLossToCsv(allTrades, 'US');
                          downloadCsv(csvContent, `損益計算書_米国方式_${timestamp}.csv`);
                          setIsExportDialogOpen(false);
                        } catch (error) {
                          console.error('Export error:', error);
                        }
                      }}
                    >
                      <div className="font-bold text-base text-slate-600">🇺🇸 米国方式</div>
                      <span className="text-xs text-slate-400 font-normal text-left block">
                        Wash Sale調整を含みます。明細と照合したい方向け。
                      </span>
                    </Button>

                    <div className="pt-2 text-center text-xs text-slate-500">
                      <a href="/guide/washsale" className="text-blue-600 hover:underline">
                        計算方法の違いについて（Wash Sale解説ページ）
                      </a>
                    </div>
                  </div>
                </Dialog>
              </>
            )}
            {hasCachedData && (
              <button
                onClick={handleClearCache}
                className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                入力データをリセット
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm" role="alert">
              {error}
            </div>
          )}

          {defaultRateDates.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-sm" role="alert">
              <p className="text-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>
                  デフォルト為替レート({DEFAULT_RATE}円)使用: {defaultRateDates.map(d => {
                    const date = new Date(d);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }).join(', ')}
                  <HelpTooltip text="確定申告時は、三菱UFJ銀行等のTTM（仲値）を確認し、必要に応じて手動で修正してください。差額は通常数百円程度です。" />
                </span>
              </p>
            </div>
          )}

          {!summary && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <GainLossFileUploader
                onUpload={handleUpload}
                onError={setError}
              />
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <ProgressIndicator progress={progress} />
            </div>
          )}

          {!isLoading && summary && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <GainLossSummary summary={summary} />
            </div>
          )}
        </div>


      </div>
      <Footer />
    </>
  );
}
