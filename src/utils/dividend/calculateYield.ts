// src/utils/dividend/calculateYield.ts
import type { ConvertedDividendRecord } from '@/types/dividend';

/**
 * 銘柄別の配当金情報
 */
export interface StockDividendInfo {
  symbol: string;
  annualDividendUSD: number;
  annualDividendJPY: number;
  recordCount: number;
  averageExchangeRate: number;
  stockPrice?: number; // ユーザー入力の株価
  dividendYield?: number; // 配当利回り（%）
}

/**
 * 配当金レコードから銘柄別の配当金情報を集計する
 */
export function aggregateDividendsBySymbol(
  dividends: ConvertedDividendRecord[]
): StockDividendInfo[] {
  const symbolMap = new Map<string, {
    totalUSD: number;
    totalJPY: number;
    count: number;
    totalExchangeRate: number;
  }>();

  // 銘柄ごとに集計
  dividends.forEach(record => {
    const current = symbolMap.get(record.Symbol) || {
      totalUSD: 0,
      totalJPY: 0,
      count: 0,
      totalExchangeRate: 0
    };

    symbolMap.set(record.Symbol, {
      totalUSD: current.totalUSD + record.Amount,
      totalJPY: current.totalJPY + record.amountJPY,
      count: current.count + 1,
      totalExchangeRate: current.totalExchangeRate + record.exchangeRate
    });
  });

  // 配列に変換して返す
  return Array.from(symbolMap.entries())
    .map(([symbol, data]) => ({
      symbol,
      annualDividendUSD: data.totalUSD,
      annualDividendJPY: data.totalJPY,
      recordCount: data.count,
      averageExchangeRate: data.totalExchangeRate / data.count
    }))
    .sort((a, b) => b.annualDividendUSD - a.annualDividendUSD); // 配当金額の多い順
}

/**
 * 配当利回りを計算する
 * @param annualDividend 年間配当金（USD）
 * @param stockPrice 株価（USD）
 * @returns 配当利回り（%）
 */
export function calculateDividendYield(
  annualDividend: number,
  stockPrice: number
): number {
  if (stockPrice <= 0) return 0;
  return (annualDividend / stockPrice) * 100;
}

/**
 * 配当利回りに基づいて評価レベルを返す
 */
export function getDividendYieldLevel(yield_: number): {
  level: 'low' | 'medium' | 'high' | 'very-high';
  color: string;
  label: string;
} {
  if (yield_ >= 5) {
    return {
      level: 'very-high',
      color: 'text-purple-600',
      label: '超高配当'
    };
  } else if (yield_ >= 3) {
    return {
      level: 'high',
      color: 'text-green-600',
      label: '高配当'
    };
  } else if (yield_ >= 1.5) {
    return {
      level: 'medium',
      color: 'text-blue-600',
      label: '中配当'
    };
  } else {
    return {
      level: 'low',
      color: 'text-gray-600',
      label: '低配当'
    };
  }
}

/**
 * LocalStorageから株価データを取得
 */
export function getStoredStockPrices(): Record<string, number> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem('stockPrices');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * LocalStorageに株価データを保存
 */
export function saveStockPrice(symbol: string, price: number): void {
  if (typeof window === 'undefined') return;

  try {
    const prices = getStoredStockPrices();
    prices[symbol] = price;
    localStorage.setItem('stockPrices', JSON.stringify(prices));
  } catch (error) {
    console.error('株価の保存に失敗:', error);
  }
}

/**
 * LocalStorageから株価データを削除
 */
export function removeStockPrice(symbol: string): void {
  if (typeof window === 'undefined') return;

  try {
    const prices = getStoredStockPrices();
    delete prices[symbol];
    localStorage.setItem('stockPrices', JSON.stringify(prices));
  } catch (error) {
    console.error('株価の削除に失敗:', error);
  }
}
