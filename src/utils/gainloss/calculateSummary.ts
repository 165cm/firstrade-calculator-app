// src/utils/gainloss/calculateSummary.ts
import { getExchangeRate } from '@/data/exchangeRates';
import type { GainLossRecord, GainLossSummary, MonthlyGainLoss, TradeDetail } from '@/types/gainloss';

export async function calculateGainLossSummary(records: GainLossRecord[]): Promise<GainLossSummary> {
  // 取引記録を銘柄ごとにグループ化
  const groupedBySymbol = records.reduce<Record<string, GainLossRecord[]>>((groups, record) => {
    (groups[record.symbol] ||= []).push(record);
    return groups;
  }, {});

  // 銘柄別サマリーの作成
  const symbolSummaryPromises = Object.entries(groupedBySymbol).map(async ([symbol, trades]) => {
    // 各銘柄の取引詳細を作成
    const tradeDetailsPromises = trades.map(async trade => {
      const purchaseRate = await getExchangeRate(trade.purchaseDate);
      const saleRate = await getExchangeRate(trade.saleDate);
      const costJPY = trade.cost * purchaseRate;
      const proceedsJPY = trade.proceeds * saleRate;
      const gainLossJPY = proceedsJPY - costJPY;

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
        gainLossJPY,
        exchangeRate: saleRate
      };
    });

    const tradeDetails = await Promise.all(tradeDetailsPromises);

    // 銘柄ごとの合計を計算
    // 画面の損益は日本方式（売却額 − 取得額、Wash Sale 調整なし）で円・ドルを揃える
    // ※ trade.gainLoss は米国方式（Wash Sale 調整込み）のまま保持し、米国方式CSVで使用する
    const gainLossUSD = tradeDetails.reduce((sum, trade) => sum + (trade.proceeds - trade.cost), 0);
    const gainLossJPY = tradeDetails.reduce((sum, trade) => sum + trade.gainLossJPY, 0);

    return {
      symbol,
      gainLossUSD,
      gainLossJPY,
      trades: tradeDetails
    };
  });

  const symbolSummary = await Promise.all(symbolSummaryPromises);

  // 総損益の計算
  const totalGainLossUSD = symbolSummary.reduce((sum, item) => sum + item.gainLossUSD, 0);
  const totalGainLossJPY = symbolSummary.reduce((sum, item) => sum + item.gainLossJPY, 0);

  // 月次データの集計（銘柄別と同じ取引ごとの円換算値から集計する）
  const monthlyGainLoss = calculateMonthlyGainLoss(symbolSummary.flatMap(item => item.trades));

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
      jpy: current.jpy + trade.gainLossJPY
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