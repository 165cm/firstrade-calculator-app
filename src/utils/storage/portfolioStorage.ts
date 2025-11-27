// src/utils/storage/portfolioStorage.ts
/**
 * ポートフォリオデータと配当データを統合的に管理するLocalStorageシステム
 * ポートフォリオページで入力したデータを配当ページで自動利用
 */

import type { Holding } from '@/types/portfolio';

const STORAGE_KEY = 'firstrade_portfolio_holdings';

/**
 * 保存用の軽量なHoldingデータ（必要最小限の情報のみ）
 */
export interface StoredHolding {
  symbol: string;
  currentPrice?: number;
  quantity?: number;
  lastUpdated: string;
}

/**
 * ポートフォリオデータをLocalStorageに保存
 */
export function savePortfolioHoldings(holdings: Holding[]): void {
  if (typeof window === 'undefined') return;

  try {
    const storedData: StoredHolding[] = holdings.map(h => ({
      symbol: h.symbol,
      currentPrice: h.currentPrice,
      quantity: h.quantity,
      lastUpdated: new Date().toISOString()
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    console.log(`✓ ポートフォリオデータを保存しました (${holdings.length}銘柄)`);
  } catch (error) {
    console.error('ポートフォリオデータの保存に失敗:', error);
  }
}

/**
 * LocalStorageからポートフォリオデータを取得
 */
export function getStoredPortfolioHoldings(): StoredHolding[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const holdings: StoredHolding[] = JSON.parse(stored);
    return holdings;
  } catch (error) {
    console.error('ポートフォリオデータの取得に失敗:', error);
    return [];
  }
}

/**
 * 特定銘柄の株価を取得
 */
export function getStockPrice(symbol: string): number | undefined {
  const holdings = getStoredPortfolioHoldings();
  const holding = holdings.find(h => h.symbol === symbol);
  return holding?.currentPrice;
}

/**
 * 複数銘柄の株価を一括取得
 */
export function getStockPrices(symbols: string[]): Record<string, number> {
  const holdings = getStoredPortfolioHoldings();
  const prices: Record<string, number> = {};

  symbols.forEach(symbol => {
    const holding = holdings.find(h => h.symbol === symbol);
    if (holding?.currentPrice) {
      prices[symbol] = holding.currentPrice;
    }
  });

  return prices;
}

/**
 * ポートフォリオデータが存在するか確認
 */
export function hasPortfolioData(): boolean {
  const holdings = getStoredPortfolioHoldings();
  return holdings.length > 0;
}

/**
 * ポートフォリオデータをクリア
 */
export function clearPortfolioData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✓ ポートフォリオデータをクリアしました');
  } catch (error) {
    console.error('ポートフォリオデータのクリアに失敗:', error);
  }
}

/**
 * 最終更新日時を取得
 */
export function getLastUpdatedTime(): string | null {
  const holdings = getStoredPortfolioHoldings();
  if (holdings.length === 0) return null;

  // 最も新しい更新日時を返す
  const latest = holdings.reduce((latest, h) => {
    return new Date(h.lastUpdated) > new Date(latest) ? h.lastUpdated : latest;
  }, holdings[0].lastUpdated);

  return latest;
}
