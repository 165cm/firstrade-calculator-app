// src/app/dividend/page.tsx
'use client';
import { useState } from 'react';
import { DividendFileUploader } from '@/components/dividend/DividendFileUploader';
import InfoSection from '@/components/InfoSection';
import { DividendSummary, processDividendData } from '@/utils/dividend/DividendSummary';
import { useConversion } from '@/hooks/useConversion';
import type { 
  ProcessedDividendData, 
  RawDividendData
} from '@/types/dividend';
import { getExchangeRate } from '@/data/exchangeRates';

export default function DividendPage() {
  const { isLoading, error, setError } = useConversion();
  const [dividendData, setDividendData] = useState<ProcessedDividendData>({
    dividends: [],
    interest: [],
    other: [],
    withholding: []
  });

  const handleDividendData = async (rawData: RawDividendData[]) => {
    try {
      // まずrawDataを処理
      const processedData = await processDividendData(
        await Promise.all(rawData.map(async data => {
          const exchangeRate = await getExchangeRate(data.TradeDate);
          const amount = typeof data.Amount === 'string' ? parseFloat(data.Amount) : data.Amount;
          return {
            ...data,
            Amount: amount,
            exchangeRate,
            amountJPY: amount * exchangeRate
          };
        }))
      );
      
      setDividendData(processedData);
    } catch (e) {
      setError(e instanceof Error ? e.message : '配当データの処理中にエラーが発生しました');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {error}
        </div>
      )}

      <DividendFileUploader
        onUpload={handleDividendData}
        onError={setError}
      />

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">データを処理中...</span>
        </div>
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