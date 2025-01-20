// src/app/dividend/page.tsx
'use client';
import { useState } from 'react';
import { DividendFileUploader } from '@/components/dividend/DividendFileUploader';
import { DividendSummary } from '@/utils/dividend/DividendSummary';
import { useConversion } from '@/hooks/useConversion';
import type { 
  ProcessedDividendData, 
  RawDividendData
} from '@/types/dividend';

export default function DividendPage() {
  const { isLoading, error, processFile, setError } = useConversion();
  const [dividendData, setDividendData] = useState<ProcessedDividendData>({
    dividends: [],
    interest: [],
    other: []
  });

  const handleDividendData = async (rawData: RawDividendData[]) => {
    try {
      // まずrawDataを処理してDividendRecordに変換
      const processed = await processFile(
        rawData.map(data => ({
          ...data,
          Amount: typeof data.Amount === 'string' ? parseFloat(data.Amount) : data.Amount
        }))
      );
      
      setDividendData({
        dividends: processed.filter(r => r.Action.toUpperCase() === 'DIVIDEND'),
        interest: processed.filter(r => r.Action.toUpperCase() === 'INTEREST'),
        other: processed.filter(r => {
          const action = r.Action.toUpperCase();
          return action !== 'DIVIDEND' && 
                 action !== 'INTEREST' &&
                 action !== 'BUY' &&
                 action !== 'SELL';
        })
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '配当データの処理中にエラーが発生しました');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6"> {/* コンテナスタイルを統一 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {error}
        </div>
      )}

      <DividendFileUploader
        onUpload={handleDividendData}
        onError={setError}
      />

      {!isLoading && (dividendData.dividends.length > 0 || dividendData.interest.length > 0) && (
        <div className="space-y-6"> {/* 内部のスペーシングも統一 */}
          <DividendSummary data={dividendData} />
        </div>
      )}
    </div>
  );
}