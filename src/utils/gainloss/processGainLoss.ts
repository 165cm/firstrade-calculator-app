// src/utils/gainloss/processGainLoss.ts
import type { RawGainLossData, GainLossRecord } from '@/types/gainloss';
import { cleanNumber } from '@/utils/common/numberUtils';
import { logger } from '@/utils/common/logger';

/**
 * RawGainLossDataオブジェクトから処理済みのGainLossRecordを生成する
 */
export async function processGainLossData(data: RawGainLossData[]): Promise<GainLossRecord[]> {
  const processedRecords: GainLossRecord[] = [];

  logger.log('処理開始:', {
    件数: data.length,
    サンプル: data.length > 0 ? data[0] : 'データなし'
  });

  for (const record of data) {
    try {
      // 日付のフォーマット統一
      const purchaseDate = formatDate(String(record.PurchaseDate));
      const saleDate = formatDate(String(record.TradeDate));

      if (!purchaseDate || !saleDate) {
        logger.warn('無効な日付形式:', { record });
        continue;
      }

      // 数値データの正しい変換
      const quantity = typeof record.Quantity === 'number' ? record.Quantity : cleanNumber(String(record.Quantity));
      const proceeds = typeof record.Proceeds === 'number' ? record.Proceeds : cleanNumber(String(record.Proceeds));
      const cost = typeof record.Cost === 'number' ? record.Cost : cleanNumber(String(record.Cost));

      // 数値変換の結果をログ出力（デバッグ用）
      logger.debug('数値変換結果:', {
        元の数量: record.Quantity,
        変換後数量: quantity,
        元の売却額: record.Proceeds,
        変換後売却額: proceeds,
        元のコスト: record.Cost,
        変換後コスト: cost
      });

      // 基本データの計算
      const gainLoss = proceeds - cost;

      // GainLossRecordの基本情報のみを設定（為替関連はオプショナル）
      const processedRecord: GainLossRecord = {
        symbol: String(record.Symbol),
        purchaseDate,
        saleDate,
        quantity,
        proceeds,
        cost,
        gainLoss
      };
      processedRecords.push(processedRecord);

    } catch (error) {
      logger.error('レコード処理エラー:', { record, error });
    }
  }

  logger.log(`処理完了: ${processedRecords.length}件のレコードを生成`);
  return processedRecords;
}

/**
 * 日付フォーマットの統一（YYYY-MM-DD）
 * 複数の入力形式に対応
 */
function formatDate(dateStr: string): string {
  try {
    if (!dateStr) return '';
    
    // 空白を削除
    dateStr = dateStr.trim();
    
    // 日付区切り文字対応（'/'や'-'など）
    const parts = dateStr.split(/[\/\-\.]/);
    
    // パターン判定
    if (parts.length === 3) {
      // MM/DD/YYYY形式チェック - 最後の部分が4桁の年
      if (parts[2].length === 4) {
        const [month, day, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      // YYYY/MM/DD形式チェック - 最初の部分が4桁の年
      else if (parts[0].length === 4) {
        const [year, month, day] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // 上記の判定に失敗した場合、Dateオブジェクトを使用して変換を試みる
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    logger.warn(`無効な日付形式: "${dateStr}"`);
    return '';
  } catch (error) {
    logger.error(`日付フォーマットエラー: "${dateStr}"`, error);
    return '';
  }
}

/**
 * バリデーション関数を更新
 * より詳細なバリデーションチェックを追加
 */
export function validateGainLossRecord(record: GainLossRecord): boolean {
  try {
    // 基本的なデータの存在チェック
    if (!record.symbol || !record.purchaseDate || !record.saleDate) {
      logger.warn('必須項目が不足:', { record });
      return false;
    }

    // 数値の妥当性チェック
    if (
      isNaN(record.quantity) ||
      isNaN(record.proceeds) ||
      isNaN(record.cost) ||
      isNaN(record.gainLoss)
    ) {
      logger.warn('無効な数値:', {
        quantity: record.quantity,
        proceeds: record.proceeds,
        cost: record.cost,
        gainLoss: record.gainLoss
      });
      return false;
    }

    // 数値が0より大きいことを確認（数量はマイナスの場合もあるため除外）
    if (record.proceeds < 0 || record.cost < 0) {
      logger.warn('無効な負の値:', { proceeds: record.proceeds, cost: record.cost });
      return false;
    }

    // 日付の順序チェック
    const purchase = new Date(record.purchaseDate);
    const sale = new Date(record.saleDate);
    if (purchase >= sale) {
      logger.warn('無効な日付順序:', { purchaseDate: record.purchaseDate, saleDate: record.saleDate });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('バリデーションエラー:', error);
    return false;
  }
}