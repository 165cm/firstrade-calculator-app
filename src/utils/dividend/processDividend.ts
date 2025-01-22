// src/utils/dividend/processDividend.ts
import type { RawDividendData, ConvertedDividendRecord, ProcessedDividendData } from '@/types/dividend';
import { getExchangeRate } from '@/data/exchangeRates';

export async function processDividendData(data: RawDividendData[]): Promise<ProcessedDividendData> {
  const processedRecords: ConvertedDividendRecord[] = [];

  for (const record of data) {
    try {
      const amount = typeof record.Amount === 'string' ? parseFloat(record.Amount) : record.Amount;
      if (isNaN(amount)) {
        console.warn('Invalid amount:', record);
        continue;
      }

      const exchangeRate = await getExchangeRate(record.TradeDate);
      processedRecords.push({
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

  const records = processedRecords;
  return {
    dividends: records.filter(r => r.Action.toUpperCase() === 'DIVIDEND'),
    interest: records.filter(r => r.Action.toUpperCase() === 'INTEREST'),
    other: records.filter(r => {
      const action = r.Action.toUpperCase();
      return action !== 'DIVIDEND' && 
             action !== 'INTEREST' &&
             action !== 'BUY' &&
             action !== 'SELL';
    })
  };
}