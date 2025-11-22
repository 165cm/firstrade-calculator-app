// src/app/gainloss/page.tsx
'use client';
import { useState } from 'react';
import { GainLossFileUploader } from '@/components/gainloss/GainLossFileUploader';
import GainLossSummary from '@/components/gainloss/GainLossSummary';
import InfoSection from '@/components/InfoSection';
import { ProgressIndicator, ProgressState, createInitialProgress } from '@/components/common/ProgressIndicator';
import type { GainLossSummary as GainLossSummaryType, RawGainLossData } from '@/types/gainloss';
import { processGainLossData } from '@/utils/gainloss/processGainLoss';
import { calculateGainLossSummary } from '@/utils/gainloss/calculateSummary';
import { getDefaultRateUsedDates, clearDefaultRateTracking, DEFAULT_RATE } from '@/data/exchangeRates';

export default function GainLossPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressState>(createInitialProgress());
  const [summary, setSummary] = useState<GainLossSummaryType | null>(null);
  const [defaultRateDates, setDefaultRateDates] = useState<string[]>([]);

  const handleUpload = async (data: RawGainLossData[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // デフォルト値追跡をクリア
      clearDefaultRateTracking();

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

      // デフォルト値を使用した日付を取得
      const usedDates = getDefaultRateUsedDates();
      setDefaultRateDates(usedDates);
    } catch (e) {
      setError(e instanceof Error ? e.message : '損益データの処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p className="font-bold">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {defaultRateDates.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded" role="alert">
          <p className="text-sm">
            ⚠️ デフォルト為替レート({DEFAULT_RATE}円)使用: {defaultRateDates.map(d => {
              const date = new Date(d);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }).join(', ')}
          </p>
        </div>
      )}

      <GainLossFileUploader
        onUpload={handleUpload}
        onError={setError}
      />

      {isLoading && (
        <ProgressIndicator progress={progress} />
      )}

      {!isLoading && summary && (
        <GainLossSummary summary={summary} />
      )}
      <InfoSection />
    </div>
  );
}
