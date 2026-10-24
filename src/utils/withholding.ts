// src/utils/withholding.ts
import type { ConvertedDividendRecord } from '@/types/dividend';

// "WITHHELD" の後に続く金額を抽出する
// 例: "NON-RES TAX WITHHELD  $0.53" / "WITHHELD $1,234.56" / "WITHHELD $5"
const WITHHOLDING_PATTERN = /WITHHELD\s*\$?\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)/i;

/**
 * Description文字列から源泉徴収額（正の値）を抽出する
 * @returns 金額。記載がない場合は null
 */
export function parseWithholdingFromDescription(description: string | undefined | null): number | null {
  if (!description) return null;
  const match = description.match(WITHHOLDING_PATTERN);
  if (!match) return null;

  const amount = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

// Descriptionから源泉徴収額を抽出
export function extractWithholdingAmount(record: Pick<ConvertedDividendRecord, 'Description'>): number | null {
  return parseWithholdingFromDescription(record.Description);
}

// 源泉徴収の合計を計算
export function calculateTotalWithholding(records: ConvertedDividendRecord[]): {
  usd: number;
  jpy: number;
} {
  let totalUSD = 0;
  let totalJPY = 0;

  records.forEach(record => {
    const withholdingAmount = extractWithholdingAmount(record);
    if (withholdingAmount) {
      totalUSD += withholdingAmount;
      totalJPY += withholdingAmount * record.exchangeRate;
    }
  });

  return {
    usd: totalUSD,
    jpy: totalJPY
  };
}

// CSVエクスポート用の源泉徴収情報取得
export function getWithholdingAmount(record: ConvertedDividendRecord): {
  usdAmount?: number;
  jpyAmount?: number;
} {
  const withholdingAmount = extractWithholdingAmount(record);
  if (withholdingAmount) {
    return {
      usdAmount: withholdingAmount,
      jpyAmount: withholdingAmount * record.exchangeRate
    };
  }
  return {};
}
