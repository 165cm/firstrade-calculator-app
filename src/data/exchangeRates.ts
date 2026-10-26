// src/data/exchangeRates.ts
import { parse, format, isValid } from 'date-fns';
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
 * 直前の営業日（土日を除く）を取得
 * タイムゾーンの影響を受けないよう UTC で計算する
 */
function getPreviousBusinessDay(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  do {
    date.setUTCDate(date.getUTCDate() - 1);
  } while (date.getUTCDay() === 0 || date.getUTCDay() === 6);
  return date.toISOString().slice(0, 10);
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

// 四半期ファイルのキャッシュ（同じ四半期のJSONを何度も取得しないようにする）
const quarterCache = new Map<string, Promise<QuarterData | null>>();

/**
 * YYYY-MM-DD から年と四半期を取得（タイムゾーンの影響を受けないよう文字列から算出）
 */
function getQuarterOf(dateStr: string): { year: number; quarter: number } {
  const [year, month] = dateStr.split('-').map(Number);
  return { year, quarter: Math.floor((month - 1) / 3) + 1 };
}

/**
 * 四半期を delta だけずらす（例: 2026Q1 の -1 は 2025Q4）
 */
function shiftQuarter(year: number, quarter: number, delta: number): { year: number; quarter: number } {
  const index = year * 4 + (quarter - 1) + delta;
  return { year: Math.floor(index / 4), quarter: (index % 4) + 1 };
}

async function fetchQuarterData(year: number, quarter: number): Promise<QuarterData | null> {
  // ファイルパスの候補（historical -> current の順で試行）
  // 更新スクリプトは両方に書き込むが、過去の四半期は historical にしかないことがあるため先に試す
  // （存在しないパスへのアクセスはブラウザのコンソールに 404 として表示される）
  const pathCandidates = [
    `/data/historical/${year}/Q${quarter}.json`,
    `/data/current/${year}Q${quarter}.json`
  ];

  let transientError = false;
  for (const filePath of pathCandidates) {
    try {
      const response = await fetch(filePath);
      if (response.ok) {
        return await response.json() as QuarterData;
      }
      // 404 以外（503 など）は一時的なエラーの可能性がある
      if (response.status !== 404) {
        transientError = true;
      }
    } catch {
      transientError = true;
    }
  }

  // 「ファイルがない」と確定した場合（すべて 404）のみ null をキャッシュする
  if (transientError) {
    // 一時的な通信エラーの可能性があるため、結果をキャッシュしない
    throw new Error(`Failed to load exchange rates for ${year}Q${quarter}`);
  }
  return null;
}

/**
 * 四半期データを取得（キャッシュ付き）
 */
function loadQuarterData(year: number, quarter: number): Promise<QuarterData | null> {
  const key = `${year}Q${quarter}`;
  let cached = quarterCache.get(key);
  if (!cached) {
    // 一時的なエラーは再試行できるようキャッシュから外し、呼び出し元にエラーを伝える
    cached = fetchQuarterData(year, quarter).catch((error: unknown) => {
      quarterCache.delete(key);
      throw error;
    });
    quarterCache.set(key, cached);
  }
  return cached;
}

function getRateOn(quarterData: QuarterData, date: string | undefined): number | null {
  if (!date) return null;
  return quarterData.rates[date]?.rate?.JPY || null;
}

function fallbackToDefaultRate(date: string, reason: string): number {
  defaultRateUsedDates.add(date);
  console.warn(`⚠️ デフォルト為替レート(${DEFAULT_RATE})を使用: ${date} (${reason})`);
  return DEFAULT_RATE;
}

/**
 * 指定された日付の為替レートを取得
 * 優先順位: 当日 → 直前の営業日 → 同じ四半期内の直近の過去日 → 過去の四半期（最大4四半期）の最終日
 *          → 同じ四半期内の直近の未来日 → デフォルト値
 */
export async function getExchangeRate(dateStr: string): Promise<number> {
  const normalizedDate = normalizeDate(dateStr);
  if (!normalizedDate) {
    return fallbackToDefaultRate(dateStr, '無効な日付形式');
  }

  // キャッシュをチェック
  if (ratesCache[normalizedDate]) {
    return ratesCache[normalizedDate];
  }

  const remember = (rate: number): number => {
    ratesCache[normalizedDate] = rate;
    return rate;
  };

  try {
    const { year, quarter } = getQuarterOf(normalizedDate);
    const quarterData = await loadQuarterData(year, quarter);

    if (quarterData) {
      // 指定日のレート → 直前の営業日のレート
      const exactRate = getRateOn(quarterData, normalizedDate)
        ?? getRateOn(quarterData, getPreviousBusinessDay(normalizedDate));
      if (exactRate) return remember(exactRate);

      // 同じ四半期内で直近の過去日のレート
      const prevDate = Object.keys(quarterData.rates).sort().reverse().find(date => date < normalizedDate);
      const prevRate = getRateOn(quarterData, prevDate);
      if (prevRate) return remember(prevRate);
    }

    // 過去の四半期の最終日のレート（四半期の初日や、四半期データがない場合）
    for (let i = 1; i <= 4; i++) {
      const target = shiftQuarter(year, quarter, -i);
      const previousQuarterData = await loadQuarterData(target.year, target.quarter);
      if (!previousQuarterData) continue;

      const lastDate = Object.keys(previousQuarterData.rates).sort().pop();
      const lastRate = getRateOn(previousQuarterData, lastDate);
      if (lastRate) return remember(lastRate);
    }

    // 過去にデータがない場合のみ、同じ四半期内の直近の未来日のレート
    if (quarterData) {
      const nextDate = Object.keys(quarterData.rates).sort().find(date => date > normalizedDate);
      const nextRate = getRateOn(quarterData, nextDate);
      if (nextRate) return remember(nextRate);
    }

    return fallbackToDefaultRate(normalizedDate, 'レートデータなし');
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return fallbackToDefaultRate(normalizedDate, 'エラー発生');
  }
}

// キャッシュをクリア
export function clearRatesCache(): void {
  ratesCache = {};
  quarterCache.clear();
}
