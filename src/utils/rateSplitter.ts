// src/utils/rateSplitter.ts
import { parse, isWithinInterval, format } from 'date-fns';
import { createHash } from 'crypto';
import type { QuarterData, ExchangeRate } from '../services/exchangeService/types.js';

interface SplitResult {
  year: string;
  quarter: string;
  data: QuarterData;
}

export class RateSplitter {
  private static readonly QUARTER_MONTHS = {
    Q1: [0, 1, 2],    // 1-3月
    Q2: [3, 4, 5],    // 4-6月
    Q3: [6, 7, 8],    // 7-9月
    Q4: [9, 10, 11]   // 10-12月
  };

  /**
   * データを年と四半期に分割
   */
// src/utils/rateSplitter.ts の splitByQuarter メソッドを修正
static splitByQuarter(sourceData: QuarterData): SplitResult[] {
  const results: SplitResult[] = [];
  const rateEntries = Object.entries(sourceData.rates);

  // オブジェクトを使用してグループ化
  const groupedByYear: Record<string, Record<string, [string, ExchangeRate][]>> = {};

  for (const entry of rateEntries) {
    const [dateStr] = entry;
    const date = new Date(dateStr);
    const year = date.getFullYear().toString();
    const quarter = this.getQuarter(date.getMonth());

    if (!groupedByYear[year]) {
      groupedByYear[year] = {};
    }
    if (!groupedByYear[year][quarter]) {
      groupedByYear[year][quarter] = [];
    }
    groupedByYear[year][quarter].push(entry);
  }

  // オブジェクトの反復処理
  Object.entries(groupedByYear).forEach(([year, quarters]) => {
    Object.entries(quarters).forEach(([quarter, rates]) => {
      const { startDate, endDate } = this.getQuarterDates(year, quarter);

      const quarterData: QuarterData = {
        startDate,
        endDate,
        rates: Object.fromEntries(rates),
        hash: ''
      };

      quarterData.hash = this.calculateHash(quarterData);

      results.push({
        year,
        quarter,
        data: quarterData
      });
    });
  });

  return results.sort((a, b) => {
    const yearDiff = a.year.localeCompare(b.year);
    return yearDiff !== 0 ? yearDiff : a.quarter.localeCompare(b.quarter);
  });
}

  /**
   * 月から四半期を判定
   */
  private static getQuarter(month: number): string {
    for (const [quarter, months] of Object.entries(this.QUARTER_MONTHS)) {
      if (months.includes(month)) {
        return quarter;
      }
    }
    throw new Error(`Invalid month: ${month}`);
  }

  /**
   * 四半期の開始日と終了日を取得
   */
  private static getQuarterDates(year: string, quarter: string): { startDate: string, endDate: string } {
    const yearNum = parseInt(year);
    const quarterNum = parseInt(quarter.replace('Q', ''));
    const startMonth = (quarterNum - 1) * 3;
    
    const startDate = format(new Date(yearNum, startMonth, 1), 'yyyy-MM-dd');
    const endDate = format(new Date(yearNum, startMonth + 2, new Date(yearNum, startMonth + 3, 0).getDate()), 'yyyy-MM-dd');
    
    return { startDate, endDate };
  }

  /**
   * データのハッシュ値を計算
   */
  private static calculateHash(data: QuarterData): string {
    const dataForHash = {
      startDate: data.startDate,
      endDate: data.endDate,
      rates: data.rates
    };
    return createHash('sha256')
      .update(JSON.stringify(dataForHash))
      .digest('hex');
  }

  /**
   * 指定された期間のデータが完全かチェック
   */
  static validateQuarterData(data: QuarterData): boolean {
    const startDate = parse(data.startDate, 'yyyy-MM-dd', new Date());
    const endDate = parse(data.endDate, 'yyyy-MM-dd', new Date());

    // すべての日付のレートが存在するか確認
    for (const [dateStr, rate] of Object.entries(data.rates)) {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      
      // 日付が期間内にあるかチェック
      if (!isWithinInterval(date, { start: startDate, end: endDate })) {
        console.warn(`Date ${dateStr} is outside the quarter range`);
        return false;
      }

      // レートデータの整合性チェック
      if (!rate.rate.JPY || typeof rate.rate.JPY !== 'number') {
        console.warn(`Invalid rate value for ${dateStr}`);
        return false;
      }
    }

    return true;
  }
}