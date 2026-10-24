// src/utils/dividend/processDividend.ts
import type { RawDividendData, ConvertedDividendRecord, ProcessedDividendData } from '@/types/dividend';
import { getExchangeRate } from '@/data/exchangeRates';
import { parseNumber } from '@/utils/common/numberUtils';
import { logger } from '@/utils/common/logger';
import { parseWithholdingFromDescription } from '@/utils/withholding';

export async function processDividendData(data: RawDividendData[]): Promise<ProcessedDividendData> {
  const processedRecords: ConvertedDividendRecord[] = [];

  logger.log(`配当データ処理開始: ${data.length}件`);

  for (const record of data) {
    try {
      // 桁区切りコンマ・括弧表記の負数を考慮した数値変換（変換できない場合は NaN）
      const amount = parseNumber(record.Amount);

      if (isNaN(amount)) {
        logger.warn('無効な金額:', record);
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
      logger.error('レコード処理エラー:', { record, error });
    }
  }

  const records = processedRecords;

  // withholdingレコードを抽出
  const withholdingRecords = records.filter(r => parseWithholdingFromDescription(r.Description) !== null);

  logger.log(`配当データ処理完了: ${records.length}件（うち源泉徴収: ${withholdingRecords.length}件）`);
  
  return {
    dividends: records.filter(r => r.Action.toUpperCase() === 'DIVIDEND'),
    interest: records.filter(r => r.Action.toUpperCase() === 'INTEREST'),
    other: records.filter(r => {
      const action = r.Action.toUpperCase();
      return action !== 'DIVIDEND' && 
             action !== 'INTEREST' &&
             action !== 'BUY' &&
             action !== 'SELL';
    }),
    withholding: withholdingRecords  // 型エラー修正: withholdingプロパティを追加
  };
}