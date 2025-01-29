// src/utils/withholding.ts
import type { ConvertedDividendRecord } from '@/types/dividend';

// Descriptionから源泉徴収額を抽出 - 複数フォーマットに対応
export function extractWithholdingAmount(record: ConvertedDividendRecord): number | null {
  // "WITHHELD" の後に任意の文字列、そして "$数字.数字" というパターンを検索
  const match = record.Description.match(/WITHHELD.*\$(\d+\.\d+)/);
  if (match && match[1]) {
    const amount = parseFloat(match[1]);
    
    // デバッグログ
    console.log('源泉徴収額抽出:', {
      Description: record.Description,
      検出金額: amount,
      マッチ部分: match[0]
    });
    
    return amount;
  }
  return null;
}

// デバッグ用ログ出力を追加
function logWithholdingExtraction(record: ConvertedDividendRecord, amount: number | null) {
  console.log('源泉徴収額抽出:', {
    日付: record.TradeDate,
    銘柄: record.Symbol,
    種別: record.Action,
    Description: record.Description,
    抽出額: amount,
    マッチ: amount !== null ? '成功' : '失敗'
  });
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
    logWithholdingExtraction(record, withholdingAmount);

    if (withholdingAmount) {
      totalUSD += withholdingAmount;
      totalJPY += withholdingAmount * record.exchangeRate;

      console.log('源泉徴収集計:', {
        日付: record.TradeDate,
        種別: record.Action,
        源泉徴収額: withholdingAmount,
        為替レート: record.exchangeRate,
        円換算額: withholdingAmount * record.exchangeRate
      });
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