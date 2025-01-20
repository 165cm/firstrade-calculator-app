// src/utils/dividend/processDividend.ts
import type { RawDividendData, ConvertedDividendRecord } from '@/types/dividend';
import { getExchangeRate } from '@/data/exchangeRates';

export async function processDividendData(data: RawDividendData[]): Promise<ConvertedDividendRecord[]> {
  const convertedRecords: ConvertedDividendRecord[] = [];

  for (const record of data) {
    try {
      const amount = typeof record.Amount === 'string' ? parseFloat(record.Amount) : record.Amount;
      if (isNaN(amount)) {
        console.warn('Invalid amount:', record);
        continue;
      }

      const exchangeRate = getExchangeRate(record.TradeDate);
      convertedRecords.push({
        Symbol: record.Symbol,
        TradeDate: record.TradeDate,
        Amount: amount,
        Action: record.Action,
        Description: record.Description,
        RecordType: record.RecordType,
        exchangeRate,
        amountJPY: amount * exchangeRate
      });
    } catch (error) {
      console.error('Record processing error:', { record, error });
    }
  }

  return convertedRecords;
}