// src/data/exchangeRates.ts
import { parse, format, isValid, isSunday, isSaturday } from 'date-fns';
import { rates2024_01 } from './rates/2024-01';
import { rates2024_02 } from './rates/2024-02';
import { rates2024_03 } from './rates/2024-03';
import { rates2024_04 } from './rates/2024-04';
import { rates2024_05 } from './rates/2024-05';
import { rates2024_06 } from './rates/2024-06';
import { rates2024_07 } from './rates/2024-07';
import { rates2024_08 } from './rates/2024-08';
import { rates2024_09 } from './rates/2024-09';
import { rates2024_10 } from './rates/2024-10';
import { rates2024_11 } from './rates/2024-11';
import { rates2024_12 } from './rates/2024-12';

// 基本為替レート（フォールバック用）
export const DEFAULT_RATE = 110.0;

// 月別データをまとめたマップ
export const monthlyRates: { [key: string]: { [key: string]: number } } = {
  '2024-01': rates2024_01,
  '2024-02': rates2024_02,
  '2024-03': rates2024_03,
  '2024-04': rates2024_04,
  '2024-05': rates2024_05,
  '2024-06': rates2024_06,
  '2024-07': rates2024_07,
  '2024-08': rates2024_08,
  '2024-09': rates2024_09,
  '2024-10': rates2024_10,
  '2024-11': rates2024_11,
  '2024-12': rates2024_12
};

/**
 * 日付が休日（土日）かどうかを判定
 */
function isHoliday(dateStr: string): boolean {
  const date = new Date(dateStr);
  return isSaturday(date) || isSunday(date);
}

/**
 * 直前の営業日を取得
 */
function getPreviousBusinessDay(dateStr: string): string {
  const date = new Date(dateStr);
  let prevDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  
  while (isHoliday(format(prevDate, 'yyyy-MM-dd'))) {
    prevDate = new Date(prevDate.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return format(prevDate, 'yyyy-MM-dd');
}

/**
 * 日付文字列をYYYY-MM-DD形式に正規化
 */
export function normalizeDate(dateStr: string): string {
  try {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (!isValid(date)) {
      throw new Error('Invalid date');
    }
    return format(date, 'yyyy-MM-dd');
  } catch {
    console.warn(`Invalid date format: ${dateStr}`);
    return '';
  }
}

/**
 * 指定された日付の為替レートを取得
 */
export function getExchangeRate(dateStr: string): number {
  const normalizedDate = normalizeDate(dateStr);
  if (!normalizedDate) {
    return DEFAULT_RATE;
  }

  // 月を特定（YYYY-MM）
  const monthKey = normalizedDate.substring(0, 7);
  const monthData = monthlyRates[monthKey];
  
  if (!monthData) {
    console.warn(`No exchange rate data for month: ${monthKey}`);
    return DEFAULT_RATE;
  }

  // 指定日のレートを確認
  if (monthData[normalizedDate]) {
    return monthData[normalizedDate];
  }

  // 休日の場合は直前の営業日のレートを使用
  if (isHoliday(normalizedDate)) {
    const prevBusinessDay = getPreviousBusinessDay(normalizedDate);
    if (monthData[prevBusinessDay]) {
      return monthData[prevBusinessDay];
    }
  }

  // それでも見つからない場合は直近の営業日のレートを探す
  const dates = Object.keys(monthData).sort().reverse();
  const prevDate = dates.find(date => date < normalizedDate);
  
  if (prevDate) {
    return monthData[prevDate];
  }

  return DEFAULT_RATE;
}

// 開発用のバリデーション関数
export function validateExchangeRates(): void {
  Object.entries(monthlyRates).forEach(([month, rates]) => {
    Object.entries(rates).forEach(([date, rate]) => {
      if (rate <= 0 || rate > 1000) {
        console.error(`Invalid rate for ${month}/${date}: ${rate}`);
      }
    });
  });
}