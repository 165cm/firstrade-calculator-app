// src/utils/dividend/processDividend.ts
import type { RawDividendData, ConvertedDividendRecord, ProcessedDividendData } from '@/types/dividend';
import { getExchangeRate } from '@/data/exchangeRates';

/**
 * 文字列からカンマや通貨記号を取り除き、数値に変換する関数
 */
function cleanNumber(value: string | number): number {
  // すでに数値の場合はそのまま返す
  if (typeof value === 'number') return value;
  
  // 空の値は0として扱う
  if (!value || value === '') return 0;
  
  // カンマ、スペース、通貨記号を削除
  const cleaned = value.toString().replace(/[,\s$¥]/g, '');
  const num = Number(cleaned);
  
  // NaNチェック
  if (isNaN(num)) {
    console.warn(`数値変換失敗: "${value}" -> NaN`);
    return 0;
  }
  
  return num;
}

/**
 * Descriptionから源泉徴収額を抽出する関数
 * @param description 説明文
 * @return 源泉徴収額（正の値）または0
 */
function extractWithholdingAmount(description: string): number {
  try {
    if (!description) return 0;
    
    // "WITHHELD"を含む文字列から数値を抽出
    // より柔軟な正規表現で、桁区切りコンマを含むケースにも対応
    const match = description.match(/WITHHELD\s+\$?(\d+,?\d*\.?\d*)/i);
    
    if (!match) return 0;
    
    // 抽出された文字列をクリーニングして数値に変換
    const amountStr = match[1];
    const amount = cleanNumber(amountStr);
    
    // デバッグログ
    console.log('源泉徴収額抽出:', {
      説明: description,
      抽出文字列: amountStr,
      変換後金額: amount
    });
    
    return amount;
  } catch (error) {
    console.error('源泉徴収額抽出エラー:', error);
    return 0;
  }
}

export async function processDividendData(data: RawDividendData[]): Promise<ProcessedDividendData> {
  const processedRecords: ConvertedDividendRecord[] = [];
  
  console.log(`配当データ処理開始: ${data.length}件`);
  
  for (const record of data) {
    try {
      // 桁区切りコンマを考慮した数値変換
      const amount = cleanNumber(record.Amount);
      
      if (isNaN(amount)) {
        console.warn('無効な金額:', record);
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
      console.error('レコード処理エラー:', { record, error });
    }
  }
  
  const records = processedRecords;
  
  // withholdingレコードを抽出
  const withholdingRecords = records.filter(r => 
    r.Description.includes('WITHHELD') && extractWithholdingAmount(r.Description) > 0
  );
  
  console.log(`配当データ処理完了: ${records.length}件（うち源泉徴収: ${withholdingRecords.length}件）`);
  
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