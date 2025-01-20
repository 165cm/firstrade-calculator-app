// src/hooks/useConversion.ts
import { useState } from 'react';
import type { RawDividendData, ConvertedDividendRecord } from '@/types/dividend';
import { processDividendData } from '@/utils/dividend/processDividend';

export function useConversion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (data: RawDividendData[]): Promise<ConvertedDividendRecord[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const processed = await processDividendData(data);
      return processed;
    } catch (e) {
      setError(e instanceof Error ? e.message : '変換中にエラーが発生しました');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    setError,
    processFile
  };
}