// src/hooks/useConversion.ts
import { useState } from 'react';
import type { RawDividendData, ProcessedDividendData } from '@/types/dividend';
import { processDividendData } from '@/utils/dividend/processDividend';

export function useConversion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (data: RawDividendData[]): Promise<ProcessedDividendData> => {
    setIsLoading(true);
    setError(null);

    try {
      const processed = await processDividendData(data);
      return processed;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '変換中にエラーが発生しました';
      setError(errorMessage);
      return {
        dividends: [],
        interest: [],
        other: [],
        withholding: []
      };
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