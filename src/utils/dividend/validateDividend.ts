// src/utils/dividend/validateDividend.ts
import type { RawDividendData } from '@/types/dividend';

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function validateDividendData(data: unknown[]): ValidationResult {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      isValid: false,
      message: 'データが空です'
    };
  }

  // 行数制限チェック
  if (data.length > 500) {
    return {
      isValid: false,
      message: 'データ件数が多すぎます（最大500件）'
    };
  }

  // 必須フィールドの定義
  const requiredFields = ['Symbol', 'TradeDate', 'Amount', 'Action'] as const;

  // 必須フィールドチェック
  const firstRow = data[0] as Record<string, unknown>;
  const missingFields = requiredFields.filter(field => !(field in firstRow));

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `必須フィールドが不足しています: ${missingFields.join(', ')}`
    };
  }

  // Actionフィールドの値チェック
  const validActions = ['DIVIDEND', 'INTEREST', 'OTHER', 'BUY', 'SELL'];
  const hasInvalidAction = data.some((row) => {
    const record = row as RawDividendData;
    return !record.Action || !validActions.includes(record.Action.toUpperCase());
  });

  if (hasInvalidAction) {
    return {
      isValid: false,
      message: '不正なAction値が含まれています'
    };
  }

  return {
    isValid: true,
    message: 'OK'
  };
}