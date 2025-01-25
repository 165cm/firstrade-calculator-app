// src/app/gainloss/page.tsx
'use client';
import { useState } from 'react';
import { GainLossFileUploader } from '@/components/gainloss/GainLossFileUploader';
import GainLossSummary from '@/components/gainloss/GainLossSummary';
import InfoSection from '@/components/InfoSection';
import type { GainLossSummary as GainLossSummaryType, RawGainLossData } from '@/types/gainloss';
import { processGainLossData } from '@/utils/gainloss/processGainLoss';
import { calculateGainLossSummary } from '@/utils/gainloss/calculateSummary';

export default function GainLossPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<GainLossSummaryType | null>(null);

  const handleUpload = async (data: RawGainLossData[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const processedData = await processGainLossData(data);
      const calculatedSummary = await calculateGainLossSummary(processedData);
      setSummary(calculatedSummary);
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

      <GainLossFileUploader
        onUpload={handleUpload}
        onError={setError}
      />

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">データを処理中...</span>
        </div>
      )}

      {!isLoading && summary && (
        <GainLossSummary summary={summary} />
      )}
      <InfoSection />
    </div>
  );
}