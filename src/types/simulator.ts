// src/types/simulator.ts

/**
 * 個別の損益エントリ（シミュレーター用）
 */
export interface SimulatorEntry {
    symbol: string;
    description: string;
    qty: number;
    daysHeld: number;
    dateAcquired: string; // YYYY-MM-DD format
    dateSold: string; // YYYY-MM-DD format
    salesProceeds: number; // USD
    adjustedCost: number; // USD
    wsLossDisallowed: number; // Wash Sale Loss Disallowed
    netGainLoss: number; // USD
    isWashSale: boolean;
    termType: 'short' | 'long';

    // 円換算用
    exchangeRateAcquired?: number;
    exchangeRateSold?: number;
    salesProceedsJpy?: number;
    adjustedCostJpy?: number;
    netGainLossJpy?: number;
}

/**
 * 期間別サマリー
 */
export interface TermSummary {
    salesProceeds: number;
    adjustedCost: number;
    wsLossDisallowed: number;
    netGainLoss: number;
    gainPercent: number;
    // 円換算
    salesProceedsJpy?: number;
    adjustedCostJpy?: number;
    netGainLossJpy?: number;
}

/**
 * 全体サマリー（シミュレーター用）
 */
export interface SimulatorSummary {
    shortTerm: TermSummary;
    longTerm: TermSummary;
    total: TermSummary;
    entries: SimulatorEntry[];
    processedAt: string;
}

// 後方互換性のためのエイリアス（段階的に削除予定）
export type GainLossEntry = SimulatorEntry;
export type GainLossSummary = SimulatorSummary;
