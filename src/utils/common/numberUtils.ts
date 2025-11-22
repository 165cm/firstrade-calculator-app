// src/utils/common/numberUtils.ts

/**
 * 文字列からカンマや通貨記号を取り除き、数値に変換する関数
 * @param value - 変換する値（文字列または数値）
 * @returns 変換された数値（変換失敗時は0）
 */
export function cleanNumber(value: string | number): number {
  // すでに数値の場合はそのまま返す
  if (typeof value === 'number') return value;

  // 空の値は0として扱う
  if (!value || value === '') return 0;

  // カンマ、スペース、通貨記号を削除
  const cleaned = value.toString().replace(/[,\s$¥]/g, '');
  const num = Number(cleaned);

  // NaNチェック
  if (isNaN(num)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`数値変換失敗: "${value}" -> NaN`);
    }
    return 0;
  }

  return num;
}
