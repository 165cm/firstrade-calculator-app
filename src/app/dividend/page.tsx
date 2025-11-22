// src/app/dividend/page.tsx
'use client';
import { useState } from 'react';
import { DividendFileUploader } from '@/components/dividend/DividendFileUploader';
import InfoSection from '@/components/InfoSection';
import { DividendSummary, processDividendData } from '@/utils/dividend/DividendSummary';
import { ProgressIndicator, ProgressState, createInitialProgress } from '@/components/common/ProgressIndicator';
import type {
  ProcessedDividendData,
  RawDividendData
} from '@/types/dividend';
import { getExchangeRate, getDefaultRateUsedDates, clearDefaultRateTracking, DEFAULT_RATE } from '@/data/exchangeRates';
import { HelpTooltip } from '@/components/common/Tooltip';

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

      // デフォルト値を使用した日付を取得
      const usedDates = getDefaultRateUsedDates();
      setDefaultRateDates(usedDates);
    } catch (e) {
      setError(e instanceof Error ? e.message : '配当データの処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {error}
        </div>
      )}

      {defaultRateDates.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4" role="alert">
          <p className="text-sm">
            ⚠️ デフォルト為替レート({DEFAULT_RATE}円)使用: {defaultRateDates.map(d => {
              const date = new Date(d);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }).join(', ')}
            <HelpTooltip text="確定申告時は、三菱UFJ銀行等のTTM（仲値）を確認し、必要に応じて手動で修正してください。差額は通常数百円程度です。" />
          </p>
        </div>
      )}

      <DividendFileUploader
        onUpload={handleDividendData}
        onError={setError}
      />

      {isLoading && (
        <ProgressIndicator progress={progress} />
      )}

      {!isLoading && (dividendData.dividends.length > 0 || dividendData.interest.length > 0) && (
        <div className="space-y-6">
          <DividendSummary data={dividendData} />
        </div>
      )}
      <InfoSection />
    </div>
  );
}
