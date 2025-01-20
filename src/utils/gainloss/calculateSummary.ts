// src/utils/gainloss/calculateSummary.ts
import { getExchangeRate } from '@/data/exchangeRates';
import type { GainLossRecord, GainLossSummary, MonthlyGainLoss, SymbolSummary, TradeDetail } from '@/types/gainloss';
import { groupBy } from 'lodash';

export function calculateGainLossSummary(records: GainLossRecord[]): GainLossSummary {
  // 取引記録を銘柄ごとにグループ化
  const groupedBySymbol = groupBy(records, 'symbol');

  // 銘柄別サマリーの作成
  const symbolSummary: SymbolSummary[] = Object.entries(groupedBySymbol).map(([symbol, trades]) => {
    // 各銘柄の取引詳細を作成
    const tradeDetails: TradeDetail[] = trades.map(trade => {
      const purchaseRate = getExchangeRate(trade.purchaseDate);
      const saleRate = getExchangeRate(trade.saleDate);
      const costJPY = trade.cost * purchaseRate;
      const proceedsJPY = trade.proceeds * saleRate;
      const gainLossJPY = proceedsJPY - costJPY;
  
      return {
        purchaseDate: trade.purchaseDate,
        saleDate: trade.saleDate,
        quantity: trade.quantity,
        proceeds: trade.proceeds,
        cost: trade.cost,
        gainLoss: trade.gainLoss,
        purchaseRate,
        saleRate,
        costJPY,
        proceedsJPY,
        gainLossJPY,
        exchangeRate: saleRate // 後方互換性のため
      };
    });  

    // 銘柄ごとの合計を計算
    const gainLossUSD = tradeDetails.reduce((sum, trade) => sum + trade.gainLoss, 0);
    const gainLossJPY = tradeDetails.reduce((sum, trade) => sum + trade.gainLossJPY, 0);

    return {
      symbol,
      gainLossUSD,
      gainLossJPY,
      trades: tradeDetails
    };
  });

  // 総損益の計算
  const totalGainLossUSD = symbolSummary.reduce((sum, item) => sum + item.gainLossUSD, 0);
  const totalGainLossJPY = symbolSummary.reduce((sum, item) => sum + item.gainLossJPY, 0);

  // 月次データの集計を追加
  const monthlyGainLoss = calculateMonthlyGainLoss(records);

  return {
    totalGainLossUSD,
    totalGainLossJPY,
    symbolSummary,
    monthlyGainLoss
  };
}

function calculateMonthlyGainLoss(records: GainLossRecord[]): MonthlyGainLoss[] {
  const monthlyData = new Map<string, { usd: number; jpy: number }>();

  records.forEach(record => {
    const month = record.saleDate.substring(0, 7); // YYYY-MM
    const gainLossUSD = record.gainLoss;
    const gainLossJPY = record.gainLoss * getExchangeRate(record.saleDate);

    const current = monthlyData.get(month) || { usd: 0, jpy: 0 };
    monthlyData.set(month, {
      usd: current.usd + gainLossUSD,
      jpy: current.jpy + gainLossJPY
    });
  });

  return Array.from(monthlyData.entries())
    .map(([month, values]) => ({
      month,
      gainLossUSD: values.usd,
      gainLossJPY: values.jpy
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// エラーハンドリング用のユーティリティ関数
export function handleCalculationError(error: unknown): string {
  if (error instanceof Error) {
    // 為替レートが見つからない場合
    if (error.message.includes('exchange rate not found')) {
      return '一部の取引日の為替レートが見つかりませんでした。サポートへお問い合わせください。';
    }
    return error.message;
  }
  return '計算処理中にエラーが発生しました。';
}