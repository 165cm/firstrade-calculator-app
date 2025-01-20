// src/utils/gainloss/processGainLoss.ts
import type { RawGainLossData, GainLossRecord } from '@/types/gainloss';

export async function processGainLossData(data: RawGainLossData[]): Promise<GainLossRecord[]> {
  const processedRecords: GainLossRecord[] = [];

  for (const record of data) {
    try {
      // 日付のフォーマット統一
      const purchaseDate = formatDate(record.PurchaseDate);
      const saleDate = formatDate(record.TradeDate);
      
      if (!purchaseDate || !saleDate) {
        console.warn('Invalid date format:', { record });
        continue;
      }

      // 基本データの計算
      const gainLoss = record.Proceeds - record.Cost;

      // GainLossRecordの基本情報のみを設定
      processedRecords.push({
        symbol: record.Symbol,
        purchaseDate,
        saleDate,
        quantity: record.Quantity,
        proceeds: record.Proceeds,
        cost: record.Cost,
        gainLoss
      } as GainLossRecord);  // 型アサーションを使用（為替関連の計算はcalculateSummaryで行う）

    } catch (error) {
      console.error('Record processing error:', { record, error });
    }
  }

  return processedRecords;
}

// 日付フォーマットの統一（YYYY-MM-DD）
function formatDate(dateStr: string): string {
  try {
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch {
    return '';
  }
}

// バリデーション関数を更新
export function validateGainLossRecord(record: GainLossRecord): boolean {
  // 基本的なデータの存在チェック
  if (!record.symbol || !record.purchaseDate || !record.saleDate) {
    return false;
  }

  // 数値の妥当性チェック
  if (
    isNaN(record.quantity) || 
    isNaN(record.proceeds) || 
    isNaN(record.cost) ||
    isNaN(record.gainLoss)
  ) {
    return false;
  }

  // 日付の順序チェック
  const purchase = new Date(record.purchaseDate);
  const sale = new Date(record.saleDate);
  if (purchase >= sale) {
    return false;
  }

  return true;
}