// src/utils/dividend/processRecord.ts
import type { DividendRecord, ConvertedDividendRecord } from '@/types/dividend';
import { getExchangeRate } from '@/data/exchangeRates';

export async function processRecord(data: DividendRecord[]): Promise<ConvertedDividendRecord[]> {
  const processed: ConvertedDividendRecord[] = [];

  for (const record of data) {
    const exchangeRate = await getExchangeRate(record.TradeDate);
    processed.push({
      ...record,
      exchangeRate,
      amountJPY: record.Amount * exchangeRate
    });
  }

  return processed;
}