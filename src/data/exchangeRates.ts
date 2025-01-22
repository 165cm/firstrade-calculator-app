// src/data/exchangeRates.ts
import { parse, format, isValid, isSunday, isSaturday } from 'date-fns';
import type { QuarterData } from '@/types/exchange';


// 基本為替レート（フォールバック用）
export const DEFAULT_RATE = 150.0;

// キャッシュ
let ratesCache: { [key: string]: number } = {};

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
 * 四半期データを取得
 */
async function getQuarterData(dateStr: string): Promise<QuarterData | null> {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;

  // ファイルパスを構築
  const filePath = year === currentYear && quarter === currentQuarter
    ? `/data/current/${year}Q${quarter}.json`
    : `/data/historical/${year}/Q${quarter}.json`;

  console.log('Attempting to load exchange rate data from:', filePath);

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as QuarterData;
    console.log('Loaded quarter data:', {
      startDate: data.startDate,
      endDate: data.endDate,
      ratesCount: Object.keys(data.rates).length
    });

    return data;
  } catch (error) {
    console.error(`Failed to load quarter data for ${year}Q${quarter}:`, error);
    return null;
  }
}

/**
 * 指定された日付の為替レートを取得
 */
export async function getExchangeRate(dateStr: string): Promise<number> {
  const normalizedDate = normalizeDate(dateStr);
  if (!normalizedDate) {
    return DEFAULT_RATE;
  }

  // キャッシュをチェック
  if (ratesCache[normalizedDate]) {
    return ratesCache[normalizedDate];
  }

  try {
    const quarterData = await getQuarterData(normalizedDate);
    if (!quarterData) {
      return DEFAULT_RATE;
    }

    // 指定日のレートを確認
    if (quarterData.rates[normalizedDate]?.rate?.JPY) {
      const rate = quarterData.rates[normalizedDate].rate.JPY;
      ratesCache[normalizedDate] = rate;
      return rate;
    }

    // 休日の場合は直前の営業日のレートを使用
    if (isHoliday(normalizedDate)) {
      const prevBusinessDay = getPreviousBusinessDay(normalizedDate);
      if (quarterData.rates[prevBusinessDay]?.rate?.JPY) {
        const rate = quarterData.rates[prevBusinessDay].rate.JPY;
        ratesCache[normalizedDate] = rate;
        return rate;
      }
    }

    // それでも見つからない場合は直近の営業日のレートを探す
    const dates = Object.keys(quarterData.rates)
      .sort()
      .reverse();
    
    const prevDate = dates.find(date => date < normalizedDate);
    if (prevDate && quarterData.rates[prevDate]?.rate?.JPY) {
      const rate = quarterData.rates[prevDate].rate.JPY;
      ratesCache[normalizedDate] = rate;
      return rate;
    }

    return DEFAULT_RATE;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return DEFAULT_RATE;
  }
}

// キャッシュをクリア
export function clearRatesCache(): void {
  ratesCache = {};
}

// 開発用のバリデーション関数
export async function validateExchangeRates(startDate: string, endDate: string): Promise<void> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const rate = await getExchangeRate(dateStr);
    
    if (rate <= 0 || rate > 1000) {
      console.error(`Invalid rate for ${dateStr}: ${rate}`);
    }
    
    current.setDate(current.getDate() + 1);
  }
}