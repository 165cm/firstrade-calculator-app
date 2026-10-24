// src/utils/gainloss/calculateSummary.ts
import { getExchangeRate } from '@/data/exchangeRates';
import type { GainLossRecord, GainLossSummary, MonthlyGainLoss, TradeDetail } from '@/types/gainloss';

export async function calculateGainLossSummary(records: GainLossRecord[]): Promise<GainLossSummary> {
  // 各取引の為替レートを取得して円換算
  const tradeDetails: TradeDetail[] = await Promise.all(records.map(async trade => {
    const purchaseRate = await getExchangeRate(trade.purchaseDate);
    const saleRate = await getExchangeRate(trade.saleDate);
    const costJPY = trade.cost * purchaseRate;
    const proceedsJPY = trade.proceeds * saleRate;

    return {
      symbol: trade.symbol,
      purchaseDate: trade.purchaseDate,
      saleDate: trade.saleDate,
      quantity: trade.quantity,
      proceeds: trade.proceeds,
      cost: trade.cost,
      washSale: trade.washSale,
      gainLoss: trade.gainLoss,
      purchaseRate,
      saleRate,
      costJPY,
      proceedsJPY,
      gainLossJPY: proceedsJPY - costJPY,
      exchangeRate: saleRate
    };
  }));

  return summarizeTrades(tradeDetails);
}

/**
 * 円換算済みの取引明細からサマリーを集計する（為替レートの再取得は不要）
 * 保存済みデータの復元時にも使い、集計方法の変更を既存データへ反映する
 */
export function summarizeTrades(trades: TradeDetail[]): GainLossSummary {
  const groupedBySymbol = new Map<string, TradeDetail[]>();
  for (const trade of trades) {
    const group = groupedBySymbol.get(trade.symbol);
    if (group) {
      group.push(trade);
    } else {
      groupedBySymbol.set(trade.symbol, [trade]);
    }
  }

  // 銘柄ごとの合計を計算
  // 画面の損益は日本方式（売却額 − 取得額、Wash Sale 調整なし）で円・ドルを揃える
  // ※ trade.gainLoss は米国方式（Wash Sale 調整込み）のまま保持し、米国方式CSVで使用する
  const symbolSummary = Array.from(groupedBySymbol.entries()).map(([symbol, symbolTrades]) => ({
    symbol,
    gainLossUSD: symbolTrades.reduce((sum, trade) => sum + (trade.proceeds - trade.cost), 0),
    gainLossJPY: symbolTrades.reduce((sum, trade) => sum + (trade.proceedsJPY - trade.costJPY), 0),
    trades: symbolTrades
  }));

  // 総損益の計算
  const totalGainLossUSD = symbolSummary.reduce((sum, item) => sum + item.gainLossUSD, 0);
  const totalGainLossJPY = symbolSummary.reduce((sum, item) => sum + item.gainLossJPY, 0);

  // 月次データの集計（銘柄別と同じ取引ごとの円換算値から集計する）
  const monthlyGainLoss = calculateMonthlyGainLoss(trades);

  return {
    totalGainLossUSD,
    totalGainLossJPY,
    symbolSummary,
    monthlyGainLoss
  };
}

function calculateMonthlyGainLoss(trades: TradeDetail[]): MonthlyGainLoss[] {
  const monthlyData = new Map<string, { usd: number; jpy: number }>();

  for (const trade of trades) {
    const month = trade.saleDate.substring(0, 7); // YYYY-MM
    const current = monthlyData.get(month) || { usd: 0, jpy: 0 };
    monthlyData.set(month, {
      usd: current.usd + (trade.proceeds - trade.cost),
      jpy: current.jpy + (trade.proceedsJPY - trade.costJPY)
    });
  }

  return Array.from(monthlyData.entries())
    .map(([month, values]) => ({
      month,
      gainLossUSD: values.usd,
      gainLossJPY: values.jpy
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
