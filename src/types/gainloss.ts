// src/types/gainloss.ts
// 基本的な取引記録の型
export interface BaseGainLossRecord {
  symbol: string;
  purchaseDate: string;
  saleDate: string;
  quantity: number;
  proceeds: number;
  cost: number;
  gainLoss: number;
}

// 為替計算済みの取引記録の型
export interface GainLossRecord extends BaseGainLossRecord {
  purchaseRate?: number;
  saleRate?: number;
  costJPY?: number;
  proceedsJPY?: number;
  gainLossJPY?: number;
}

export interface RawGainLossData {
  Symbol: string;
  TradeDate: string;
  PurchaseDate: string;
  Quantity: number;
  Proceeds: number;
  Cost: number;
  Amount: number;
  WashSale: string;
  Term: string;
}

export interface GainLossSummary {
  totalGainLossUSD: number;
  totalGainLossJPY: number;
  symbolSummary: SymbolSummary[];
  monthlyGainLoss: MonthlyGainLoss[];
}

export interface MonthlyGainLoss {
  month: string;
  gainLossUSD: number;
  gainLossJPY: number;
}

export interface SymbolSummary {
  symbol: string;
  gainLossUSD: number;
  gainLossJPY: number;
  trades: TradeDetail[];
}

// 追加: 取引詳細の型
export interface TradeDetail {
  purchaseDate: string;
  saleDate: string;
  quantity: number;
  proceeds: number;
  cost: number;
  gainLoss: number;
  purchaseRate: number;
  saleRate: number;
  costJPY: number;
  proceedsJPY: number;
  gainLossJPY: number;
  exchangeRate: number; // 後方互換性のため
}


export type HeaderKey =
  | 'Symbol'
  | 'TradeDate'
  | 'PurchaseDate'
  | 'Quantity'
  | 'Proceeds'
  | 'Cost'
  | 'Amount';

export type StandardizedHeaders = {
  [K in HeaderKey]: string;
};

export const HEADER_MAPPINGS: Record<HeaderKey, readonly string[]> = {
  'Symbol': ['Symbol'],
  'TradeDate': ['Date Sold'],
  'PurchaseDate': ['Date Acquired'],
  'Quantity': ['Quantity'],
  'Proceeds': ['Sales Proceeds'],
  'Cost': ['Adjust Cost'],
  'Amount': ['Net Gain/Loss']
} as const;

// ヘッダーの正規化用ユーティリティ関数
export function normalizeHeader(header: string): string {
  return header.replace(/['"]/g, '').trim().toLowerCase();
}