// src/app/dividend/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { DividendFileUploader } from '@/components/dividend/DividendFileUploader';

import { DividendSummary, processDividendData } from '@/utils/dividend/DividendSummary';
import { ExportButton } from '@/components/common/ExportButton';
import { exportDividendToCsv, downloadCsv } from '@/utils/export/csvExport';
import { ProgressIndicator, ProgressState, createInitialProgress } from '@/components/common/ProgressIndicator';
import type {
  ProcessedDividendData,
  RawDividendData
} from '@/types/dividend';
import { getExchangeRate, getDefaultRateUsedDates, clearDefaultRateTracking, DEFAULT_RATE } from '@/data/exchangeRates';
import { HelpTooltip } from '@/components/common/Tooltip';

const STORAGE_KEY = 'dividend_data';

export default function DividendPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressState>(createInitialProgress());
  const [dividendData, setDividendData] = useState<ProcessedDividendData>({
    dividends: [],
    interest: [],
    other: [],
    withholding: []
  });
  const [defaultRateDates, setDefaultRateDates] = useState<string[]>([]);
  const [hasCachedData, setHasCachedData] = useState(false);

  // 初回マウント時にlocalStorageからデータを復元
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDividendData(parsed);
        setHasCachedData(true);
      }
    } catch (e) {
      console.error('Failed to restore dividend data from localStorage:', e);
    }
  }, []);

  const handleDividendData = async (rawData: RawDividendData[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // デフォルト値追跡をクリア
      clearDefaultRateTracking();

      const total = rawData.length;

      // フェーズ1: 為替レート取得
      setProgress({
        phase: '為替レート取得中...',
        current: 0,
        total,
        percentage: 0
      });

      const processedRawData = [];
      for (let i = 0; i < rawData.length; i++) {
        const data = rawData[i];
        const exchangeRate = await getExchangeRate(data.TradeDate);
        const amount = typeof data.Amount === 'string' ? parseFloat(data.Amount) : data.Amount;

        processedRawData.push({
          ...data,
          Amount: amount,
          exchangeRate,
          amountJPY: amount * exchangeRate
        });

        // 進捗を更新（10件ごと、または最後）
        if (i % 10 === 0 || i === rawData.length - 1) {
          setProgress({
            phase: '為替レート取得中...',
            current: i + 1,
            total,
            percentage: Math.round(((i + 1) / total) * 80)
          });
        }
      }

      // フェーズ2: データ分類
      setProgress({
        phase: 'データを分類中...',
        current: total,
        total,
        percentage: 90
      });

      const processedData = await processDividendData(processedRawData);

      setProgress({
        phase: '完了',
        current: total,
        total,
        percentage: 100
      });

      setDividendData(processedData);
      setHasCachedData(true);

      // localStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(processedData));
      } catch (e) {
        console.error('Failed to save dividend data to localStorage:', e);
      }

      // デフォルト値を使用した日付を取得
      const usedDates = getDefaultRateUsedDates();
      setDefaultRateDates(usedDates);
    } catch (e) {
      setError(e instanceof Error ? e.message : '配当データの処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDividendData({
      dividends: [],
      interest: [],
      other: [],
      withholding: []
    });
    setDefaultRateDates([]);
    setHasCachedData(false);
  };

  const hasData = dividendData.dividends.length > 0 || dividendData.interest.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">配当金明細</h1>
          <p className="text-sm text-slate-500 mt-1">配当金の計算と年間サマリーの表示</p>
        </div>
        <div className="flex gap-3">
          {hasData && (
            <ExportButton onClick={() => {
              const timestamp = new Date().toISOString().split('T')[0];
              const exportData = [
                ...dividendData.dividends,
                ...dividendData.interest,
                ...dividendData.other
              ];
              const csvContent = exportDividendToCsv(exportData);
              downloadCsv(csvContent, `配当金明細_${timestamp}.csv`);
            }} />
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

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <DividendFileUploader
            onUpload={handleDividendData}
            onError={setError}
          />
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <ProgressIndicator progress={progress} />
          </div>
        )}

        {!isLoading && hasData && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <DividendSummary data={dividendData} />
          </div>
        )}
      </div>


    </div>
  );
}
