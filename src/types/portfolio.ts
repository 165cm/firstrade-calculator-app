// src/types/portfolio.ts

// セクター分類
export type SectorType =
  | 'Technology'
  | 'Healthcare'
  | 'Finance'
  | 'Consumer'
  | 'Energy'
  | 'Industrial'
  | 'Utilities'
  | 'RealEstate'
  | 'Communication'
  | 'Materials'
  | 'ETF'
  | 'Bond'
  | 'Other';

// 資産クラス
export type AssetClass = 'Stock' | 'ETF' | 'Bond' | 'REIT' | 'Cash' | 'Other';

// 保有銘柄
export interface Holding {
  symbol: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  sector?: SectorType;
  assetClass?: AssetClass;
}

// ポートフォリオ全体
export interface Portfolio {
  holdings: Holding[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  lastUpdated: string;
}

// 目標配分
export interface TargetAllocation {
  id: string;
  name: string;
  targetPercent: number;
  type: 'sector' | 'assetClass' | 'symbol';
}

// 配分状況
export interface AllocationStatus {
  name: string;
  targetPercent: number;
  currentPercent: number;
  deviationPercent: number;
  currentValue: number;
  type: 'sector' | 'assetClass' | 'symbol';
  status: 'overweight' | 'underweight' | 'balanced';
}

// リバランス提案
export interface RebalanceSuggestion {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  reason: string;
  currentPercent: number;
  targetPercent?: number;
  suggestedAmount?: number;
}

// ポートフォリオサマリー
export interface PortfolioSummary {
  portfolio: Portfolio;
  allocationStatus: AllocationStatus[];
  suggestions: RebalanceSuggestion[];
  riskIndicators: RiskIndicators;
}

// リスク指標
export interface RiskIndicators {
  concentrationRisk: number; // 最大銘柄の割合
  sectorConcentration: number; // 最大セクターの割合
  diversificationScore: number; // 分散スコア (0-100)
}

// CSV取引データ（BUY/SELL）
export interface TradeTransaction {
  symbol: string;
  date: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  amount: number;
}

// デフォルト目標配分のプリセット
export const DEFAULT_TARGET_ALLOCATIONS: TargetAllocation[] = [
  { id: 'stock', name: '株式', targetPercent: 70, type: 'assetClass' },
  { id: 'bond', name: '債券', targetPercent: 20, type: 'assetClass' },
  { id: 'cash', name: '現金', targetPercent: 10, type: 'assetClass' },
];

// セクター別デフォルト上限
export const SECTOR_LIMITS: Record<SectorType, number> = {
  Technology: 25,
  Healthcare: 20,
  Finance: 20,
  Consumer: 15,
  Energy: 15,
  Industrial: 15,
  Utilities: 10,
  RealEstate: 15,
  Communication: 15,
  Materials: 10,
  ETF: 50,
  Bond: 30,
  Other: 10,
};

// 単一銘柄の上限（デフォルト）
export const SINGLE_SYMBOL_LIMIT = 10;
