// src/utils/common/numberUtils.ts

/**
 * 文字列を数値に変換する（変換できない場合は NaN）
 * - カンマ、空白、通貨記号（$ ¥）を除去
 * - 会計表記の負数に対応: "(1,234.56)" / "1,234.56-" / "−1,234.56"（全角・Unicodeマイナス）
 * - 空の値は 0
 */
export function parseNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return 0;

  let cleaned = String(value).replace(/[,\s$¥￥]/g, '').replace(/[−－]/g, '-');
  if (cleaned === '') return 0;

  let negative = false;
  if (/^\(.*\)$/.test(cleaned)) {
    negative = true;
    cleaned = cleaned.slice(1, -1);
  } else if (/^[^-].*-$/.test(cleaned)) {
    negative = true;
    cleaned = cleaned.slice(0, -1);
  }

  if (cleaned === '') return NaN;
  const num = Number(cleaned);
  if (isNaN(num)) return NaN;
  return negative ? -num : num;
}

/**
 * 文字列からカンマや通貨記号を取り除き、数値に変換する関数
 * @param value - 変換する値（文字列または数値）
 * @returns 変換された数値（変換失敗時は0）
 */
export function cleanNumber(value: string | number): number {
  const num = parseNumber(value);

  if (isNaN(num)) {
    console.warn(`数値変換失敗: "${value}" -> 0 として扱います`);
    return 0;
  }

  return num;
}
