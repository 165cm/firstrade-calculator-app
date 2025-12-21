// src/data/exchangeRates.ts
import { parse, format, isValid, isSunday, isSaturday } from 'date-fns';
import type { QuarterData } from '@/types/exchange';


// 基本為替レート（フォールバック用）
export const DEFAULT_RATE = 150.0;

// キャッシュ
let ratesCache: { [key: string]: number } = {};

// デフォルト値を使用した日付を追跡
let defaultRateUsedDates: Set<string> = new Set();

/**
 * デフォルト値を使用した日付のリストを取得
 */
export function getDefaultRateUsedDates(): string[] {
  return Array.from(defaultRateUsedDates).sort();
}

/**
 * デフォルト値使用の追跡をクリア
 */
export function clearDefaultRateTracking(): void {
  defaultRateUsedDates = new Set();
}

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

  // ファイルパスの候補（current -> historical の順で試行）
  const pathCandidates = [
    `/data/current/${year}Q${quarter}.json`,
    `/data/historical/${year}/Q${quarter}.json`
  ];

  for (const filePath of pathCandidates) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        continue; // 次のパスを試行
      }

      const data = await response.json() as QuarterData;
      return data;
    } catch {
      continue; // 次のパスを試行
    }
  }

  // デバッグ用（通常運用では表示しない）
  // console.debug(`Quarter data not found for ${year}Q${quarter}, will try adjacent quarters`);
  return null;
}

/**
 * 隣接する四半期からレートを取得
 */
async function getRateFromAdjacentQuarter(normalizedDate: string, searchPrev: boolean): Promise<number | null> {
  const date = new Date(normalizedDate);
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3) + 1;

  // 探索する四半期を決定
  let targetQuarter: number;
  let targetYear: number;

  if (searchPrev) {
    // 前の四半期
    targetQuarter = quarter === 1 ? 4 : quarter - 1;
    targetYear = quarter === 1 ? year - 1 : year;
  } else {
    // 次の四半期
    targetQuarter = quarter === 4 ? 1 : quarter + 1;
    targetYear = quarter === 4 ? year + 1 : year;
  }

  // 前の四半期のデータを取得（current -> historical の順で試行）
  const paths = [
    `/data/current/${targetYear}Q${targetQuarter}.json`,
    `/data/historical/${targetYear}/Q${targetQuarter}.json`
  ];

  for (const filePath of paths) {
    try {
      const response = await fetch(filePath);
      if (response.ok) {
        const quarterData = await response.json() as QuarterData;
        const dates = Object.keys(quarterData.rates).sort();

        if (dates.length > 0) {
          // 前の四半期なら最後の日、次の四半期なら最初の日を使用
          const targetDate = searchPrev ? dates[dates.length - 1] : dates[0];
          const rate = quarterData.rates[targetDate]?.rate?.JPY;
          if (rate) {
            return rate;
          }
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * 指定された日付の為替レートを取得
 */
export async function getExchangeRate(dateStr: string): Promise<number> {
  const normalizedDate = normalizeDate(dateStr);
  if (!normalizedDate) {
    defaultRateUsedDates.add(dateStr);
    console.warn(`⚠️ デフォルト為替レート(${DEFAULT_RATE})を使用: ${dateStr} (無効な日付形式)`);
    return DEFAULT_RATE;
  }

  // キャッシュをチェック
  if (ratesCache[normalizedDate]) {
    return ratesCache[normalizedDate];
  }

  try {
    const quarterData = await getQuarterData(normalizedDate);
    if (!quarterData) {
      // 四半期データがない場合、複数の隣接する四半期を探す
      // まず前の四半期を試す（最大4四半期分）
      for (let i = 1; i <= 4; i++) {
        const date = new Date(normalizedDate);
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3) + 1;

        let targetQuarter = quarter - i;
        let targetYear = year;

        while (targetQuarter <= 0) {
          targetQuarter += 4;
          targetYear -= 1;
        }

        const paths = [
          `/data/current/${targetYear}Q${targetQuarter}.json`,
          `/data/historical/${targetYear}/Q${targetQuarter}.json`
        ];

        for (const filePath of paths) {
          try {
            const response = await fetch(filePath);
            if (response.ok) {
              const prevQuarterData = await response.json() as QuarterData;
              const prevDates = Object.keys(prevQuarterData.rates).sort().reverse();

              if (prevDates.length > 0) {
                const lastDate = prevDates[0];
                const rate = prevQuarterData.rates[lastDate]?.rate?.JPY;
                if (rate) {
                  console.log(`直近の為替レート(${targetYear}Q${targetQuarter} ${lastDate}: ${rate}円)を使用: ${normalizedDate}`);
                  ratesCache[normalizedDate] = rate;
                  return rate;
                }
              }
            }
          } catch {
            continue;
          }
        }
      }

      defaultRateUsedDates.add(normalizedDate);
      console.warn(`⚠️ デフォルト為替レート(${DEFAULT_RATE})を使用: ${normalizedDate} (四半期データなし)`);
      return DEFAULT_RATE;
    }

    // 指定日のレートを確認
    if (quarterData.rates[normalizedDate]?.rate?.JPY) {
      const rate = quarterData.rates[normalizedDate].rate.JPY;
      ratesCache[normalizedDate] = rate;
      return rate;
    }

    // 直前の営業日のレートを使用（休日に限らず）
    const prevBusinessDay = getPreviousBusinessDay(normalizedDate);
    if (quarterData.rates[prevBusinessDay]?.rate?.JPY) {
      const rate = quarterData.rates[prevBusinessDay].rate.JPY;
      ratesCache[normalizedDate] = rate;
      return rate;
    }

    // 同じ四半期内で直近の営業日のレートを探す（過去）
    const dates = Object.keys(quarterData.rates).sort();
    const reversedDates = [...dates].reverse();

    const prevDate = reversedDates.find(date => date < normalizedDate);
    if (prevDate && quarterData.rates[prevDate]?.rate?.JPY) {
      const rate = quarterData.rates[prevDate].rate.JPY;
      ratesCache[normalizedDate] = rate;
      return rate;
    }

    // 同じ四半期内で直近の営業日のレートを探す（未来）
    const nextDate = dates.find(date => date > normalizedDate);
    if (nextDate && quarterData.rates[nextDate]?.rate?.JPY) {
      const rate = quarterData.rates[nextDate].rate.JPY;
      ratesCache[normalizedDate] = rate;
      return rate;
    }

    // 同じ四半期にデータがない場合、前の四半期を探す
    const date = new Date(normalizedDate);
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;

    if (quarter > 1 || year > 2020) {
      const prevQuarter = quarter === 1 ? 4 : quarter - 1;
      const prevYear = quarter === 1 ? year - 1 : year;

      // 前の四半期のデータを取得（current -> historical の順で試行）
      const prevPaths = [
        `/data/current/${prevYear}Q${prevQuarter}.json`,
        `/data/historical/${prevYear}/Q${prevQuarter}.json`
      ];

      for (const prevQuarterPath of prevPaths) {
        try {
          const prevResponse = await fetch(prevQuarterPath);
          if (prevResponse.ok) {
            const prevQuarterData = await prevResponse.json() as QuarterData;
            const prevDates = Object.keys(prevQuarterData.rates).sort().reverse();

            if (prevDates.length > 0) {
              const lastDate = prevDates[0];
              const rate = prevQuarterData.rates[lastDate]?.rate?.JPY;
              if (rate) {
                ratesCache[normalizedDate] = rate;
                return rate;
              }
            }
          }
        } catch {
          continue; // 次のパスを試行
        }
      }
    }

    defaultRateUsedDates.add(normalizedDate);
    console.warn(`⚠️ デフォルト為替レート(${DEFAULT_RATE})を使用: ${normalizedDate} (レートデータなし)`);
    return DEFAULT_RATE;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    defaultRateUsedDates.add(normalizedDate);
    console.warn(`⚠️ デフォルト為替レート(${DEFAULT_RATE})を使用: ${normalizedDate} (エラー発生)`);
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