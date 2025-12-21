// src/types/gainlossBeta.ts

/**
 * 個別の損益エントリ
 */
export interface GainLossEntry {
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
 * 全体サマリー
 */
export interface GainLossSummary {
    shortTerm: TermSummary;
    longTerm: TermSummary;
    total: TermSummary;
    entries: GainLossEntry[];
    processedAt: string;
}
