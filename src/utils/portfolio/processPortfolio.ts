// src/utils/portfolio/processPortfolio.ts
import type {
  Holding,
  Portfolio,
  TradeTransaction,
  AllocationStatus,
  TargetAllocation,
  RebalanceSuggestion,
  RiskIndicators,
  SectorBreakdown,
  AssetClass,
  SectorType
} from '@/types/portfolio';
import { cleanNumber } from '@/utils/common/numberUtils';
import { logger } from '@/utils/common/logger';
import { SINGLE_SYMBOL_LIMIT } from '@/types/portfolio';

// CSVデータの型
interface RawTradeData {
  Symbol: string;
  TradeDate: string;
  Action: string;
  Quantity: string | number;
  Price: string | number;
  Amount: string | number;
}

/**
 * CSVデータから取引履歴を抽出
 */
export function extractTransactions(data: RawTradeData[]): TradeTransaction[] {
  const transactions: TradeTransaction[] = [];

  for (const record of data) {
    try {
      const action = record.Action?.toUpperCase();
      const quantity = cleanNumber(record.Quantity);
      const price = cleanNumber(record.Price);
      const amount = cleanNumber(record.Amount);
      const symbol = record.Symbol?.trim();
      const description = (record as RawTradeData & { Description?: string }).Description || '';

      // シンボルがない場合はスキップ
      if (!symbol) {
        continue;
      }

      // 数量がない場合はスキップ
      if (isNaN(quantity) || quantity === 0) {
        continue;
      }

      // BUY/SELL判定
      if (action === 'BUY' || action === 'SELL') {
        transactions.push({
          symbol,
          date: record.TradeDate,
          action: action as 'BUY' | 'SELL',
          quantity: Math.abs(quantity),
          price: Math.abs(price),
          amount: Math.abs(amount)
        });
      }
      // Other アクションの中から REIN（配当再投資）を抽出
      // Quantity > 0 かつ Amount < 0 は購入
      else if (action === 'OTHER' && quantity > 0 && amount < 0) {
        // REIN（再投資）は購入として扱う
        if (description.includes('REIN') || description.includes('REVERSE SPLIT')) {
          const calcPrice = Math.abs(amount) / quantity;
          transactions.push({
            symbol,
            date: record.TradeDate,
            action: 'BUY',
            quantity: quantity,
            price: calcPrice,
            amount: Math.abs(amount)
          });
        }
      }
      // Quantity > 0 かつ Amount > 0 は売却（清算など）
      else if (action === 'OTHER' && quantity > 0 && amount > 0) {
        const calcPrice = amount / quantity;
        transactions.push({
          symbol,
          date: record.TradeDate,
          action: 'SELL',
          quantity: quantity,
          price: calcPrice,
          amount: amount
        });
      }
    } catch (error) {
      logger.error('取引レコード処理エラー:', { record, error });
    }
  }

  logger.log(`取引履歴抽出: ${transactions.length}件`);
  return transactions;
}

/**
 * 取引履歴から現在の保有状況を計算
 */
export function calculateHoldings(transactions: TradeTransaction[]): Holding[] {
  const holdingsMap = new Map<string, {
    quantity: number;
    totalCost: number;
  }>();

  // 日付順にソート
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const tx of sortedTransactions) {
    const current = holdingsMap.get(tx.symbol) || { quantity: 0, totalCost: 0 };

    if (tx.action === 'BUY') {
      current.quantity += tx.quantity;
      current.totalCost += tx.amount;
    } else if (tx.action === 'SELL') {
      // 売却時は平均取得単価で按分
      if (current.quantity > 0) {
        const avgCost = current.totalCost / current.quantity;
        const soldCost = avgCost * tx.quantity;
        current.quantity -= tx.quantity;
        current.totalCost -= soldCost;
      }
    }

    // 端数処理
    if (current.quantity < 0.0001) {
      holdingsMap.delete(tx.symbol);
    } else {
      holdingsMap.set(tx.symbol, current);
    }
  }

  // Holding配列に変換
  const holdings: Holding[] = [];
  holdingsMap.forEach((value, symbol) => {
    if (value.quantity > 0) {
      holdings.push({
        symbol,
        quantity: value.quantity,
        averageCost: value.totalCost / value.quantity,
        totalCost: value.totalCost,
        assetClass: guessAssetClass(symbol),
        sector: guessSector(symbol)
      });
    }
  });

  logger.log(`保有銘柄計算完了: ${holdings.length}銘柄`);
  return holdings.sort((a, b) => b.totalCost - a.totalCost);
}

/**
 * シンボルから資産クラスを推測
 */
function guessAssetClass(symbol: string): AssetClass {
  const etfSymbols = ['SPY', 'QQQ', 'VTI', 'VOO', 'IWM', 'VEA', 'VWO', 'BND', 'AGG', 'VNQ', 'SCHD', 'VYM', 'VIG'];
  const bondEtfs = ['BND', 'AGG', 'TLT', 'IEF', 'SHY', 'VCIT', 'LQD', 'HYG', 'JNK'];
  const reitSymbols = ['VNQ', 'SCHH', 'IYR', 'O', 'AMT', 'PLD', 'CCI', 'EQIX'];

  if (bondEtfs.includes(symbol)) return 'Bond';
  if (reitSymbols.includes(symbol)) return 'REIT';
  if (etfSymbols.includes(symbol) || symbol.length <= 4) {
    // 簡易判定：一般的なETFシンボル
    if (symbol.startsWith('V') || symbol.startsWith('I') || symbol.startsWith('S')) {
      return 'ETF';
    }
  }
  return 'Stock';
}

/**
 * シンボルからセクターを推測（簡易版）
 */
function guessSector(symbol: string): SectorType {
  // 一般的なETF
  const etfSymbols = ['SPY', 'QQQ', 'VTI', 'VOO', 'IWM', 'VEA', 'VWO', 'SCHD', 'VYM', 'VIG'];
  if (etfSymbols.includes(symbol)) return 'ETF';

  // テクノロジー
  const techSymbols = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'META', 'NVDA', 'AMD', 'INTC', 'CRM', 'ADBE', 'ORCL', 'CSCO', 'IBM', 'QCOM', 'AVGO'];
  if (techSymbols.includes(symbol)) return 'Technology';

  // ヘルスケア
  const healthSymbols = ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'LLY', 'TMO', 'ABT', 'DHR', 'BMY', 'AMGN', 'MDT', 'CVS', 'GILD', 'ISRG'];
  if (healthSymbols.includes(symbol)) return 'Healthcare';

  // 金融
  const financeSymbols = ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'V', 'MA', 'PYPL', 'BRK.A', 'BRK.B'];
  if (financeSymbols.includes(symbol)) return 'Finance';

  // 消費財
  const consumerSymbols = ['AMZN', 'TSLA', 'HD', 'NKE', 'MCD', 'SBUX', 'TGT', 'LOW', 'COST', 'WMT', 'DIS', 'NFLX', 'PG', 'KO', 'PEP'];
  if (consumerSymbols.includes(symbol)) return 'Consumer';

  // エネルギー
  const energySymbols = ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'PSX', 'VLO', 'OXY'];
  if (energySymbols.includes(symbol)) return 'Energy';

  return 'Other';
}

/**
 * ポートフォリオ全体を構築
 */
export function buildPortfolio(holdings: Holding[]): Portfolio {
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);

  return {
    holdings,
    totalValue: totalCost, // MVP: 現在価格がないので取得価格を使用
    totalCost,
    totalGainLoss: 0, // MVP: 現在価格がないので0
    lastUpdated: new Date().toISOString()
  };
}

/**
 * 配分状況を計算
 */
export function calculateAllocationStatus(
  portfolio: Portfolio,
  targetAllocations: TargetAllocation[]
): AllocationStatus[] {
  const statuses: AllocationStatus[] = [];

  for (const target of targetAllocations) {
    let currentValue = 0;

    if (target.type === 'assetClass') {
      currentValue = portfolio.holdings
        .filter(h => {
          if (target.name === '株式') return h.assetClass === 'Stock';
          if (target.name === '債券') return h.assetClass === 'Bond';
          if (target.name === 'ETF') return h.assetClass === 'ETF';
          if (target.name === 'REIT') return h.assetClass === 'REIT';
          return false;
        })
        .reduce((sum, h) => sum + h.totalCost, 0);
    } else if (target.type === 'sector') {
      currentValue = portfolio.holdings
        .filter(h => h.sector === target.name)
        .reduce((sum, h) => sum + h.totalCost, 0);
    } else if (target.type === 'symbol') {
      currentValue = portfolio.holdings
        .filter(h => h.symbol === target.name)
        .reduce((sum, h) => sum + h.totalCost, 0);
    }

    const currentPercent = portfolio.totalValue > 0
      ? (currentValue / portfolio.totalValue) * 100
      : 0;
    const deviationPercent = currentPercent - target.targetPercent;

    let status: 'overweight' | 'underweight' | 'balanced';
    if (deviationPercent > 5) {
      status = 'overweight';
    } else if (deviationPercent < -5) {
      status = 'underweight';
    } else {
      status = 'balanced';
    }

    statuses.push({
      name: target.name,
      targetPercent: target.targetPercent,
      currentPercent,
      deviationPercent,
      currentValue,
      type: target.type,
      status
    });
  }

  return statuses;
}

/**
 * リバランス提案を生成
 */
export function generateSuggestions(
  portfolio: Portfolio,
  allocationStatus: AllocationStatus[]
): RebalanceSuggestion[] {
  const suggestions: RebalanceSuggestion[] = [];

  // 個別銘柄の集中リスクチェック
  for (const holding of portfolio.holdings) {
    const percent = portfolio.totalValue > 0
      ? (holding.totalCost / portfolio.totalValue) * 100
      : 0;

    if (percent > SINGLE_SYMBOL_LIMIT) {
      suggestions.push({
        symbol: holding.symbol,
        action: 'sell',
        reason: `単一銘柄上限(${SINGLE_SYMBOL_LIMIT}%)を超過`,
        currentPercent: percent,
        targetPercent: SINGLE_SYMBOL_LIMIT
      });
    }
  }

  // オーバーウェイト/アンダーウェイトの提案
  for (const status of allocationStatus) {
    if (status.status === 'overweight' && status.deviationPercent > 10) {
      suggestions.push({
        symbol: status.name,
        action: 'sell',
        reason: `目標配分より${status.deviationPercent.toFixed(1)}%超過`,
        currentPercent: status.currentPercent,
        targetPercent: status.targetPercent
      });
    } else if (status.status === 'underweight' && status.deviationPercent < -10) {
      suggestions.push({
        symbol: status.name,
        action: 'buy',
        reason: `目標配分より${Math.abs(status.deviationPercent).toFixed(1)}%不足`,
        currentPercent: status.currentPercent,
        targetPercent: status.targetPercent
      });
    }
  }

  return suggestions;
}

/**
 * リスク指標を計算
 */
export function calculateRiskIndicators(portfolio: Portfolio): RiskIndicators {
  if (portfolio.holdings.length === 0) {
    return {
      concentrationRisk: 0,
      sectorConcentration: 0,
      diversificationScore: 0
    };
  }

  // 最大銘柄の割合
  const maxHolding = Math.max(...portfolio.holdings.map(h => h.totalCost));
  const concentrationRisk = portfolio.totalValue > 0
    ? (maxHolding / portfolio.totalValue) * 100
    : 0;

  // セクター別集計
  const sectorTotals = new Map<string, number>();
  for (const holding of portfolio.holdings) {
    const sector = holding.sector || 'Other';
    sectorTotals.set(sector, (sectorTotals.get(sector) || 0) + holding.totalCost);
  }
  const maxSector = Math.max(...sectorTotals.values());
  const sectorConcentration = portfolio.totalValue > 0
    ? (maxSector / portfolio.totalValue) * 100
    : 0;

  // 分散スコア（銘柄数とセクター数に基づく簡易計算）
  const numHoldings = portfolio.holdings.length;
  const numSectors = sectorTotals.size;
  const diversificationScore = Math.min(100, (numHoldings * 5) + (numSectors * 10));

  return {
    concentrationRisk,
    sectorConcentration,
    diversificationScore
  };
}

/**
 * セクター内訳を計算
 */
export function calculateSectorBreakdown(portfolio: Portfolio): SectorBreakdown[] {
  const sectorMap = new Map<string, { value: number; holdings: string[] }>();

  for (const holding of portfolio.holdings) {
    const sector = holding.sector || 'Other';
    const current = sectorMap.get(sector) || { value: 0, holdings: [] };
    current.value += holding.currentValue || holding.totalCost;
    current.holdings.push(holding.symbol);
    sectorMap.set(sector, current);
  }

  const breakdown: SectorBreakdown[] = [];
  sectorMap.forEach((data, sector) => {
    breakdown.push({
      sector,
      value: data.value,
      percent: portfolio.totalValue > 0 ? (data.value / portfolio.totalValue) * 100 : 0,
      holdings: data.holdings
    });
  });

  return breakdown.sort((a, b) => b.value - a.value);
}

/**
 * ポートフォリオ分析のメイン処理
 */
export function analyzePortfolio(
  data: RawTradeData[],
  targetAllocations: TargetAllocation[]
): PortfolioSummary {
  logger.log('ポートフォリオ分析開始');

  const transactions = extractTransactions(data);
  const holdings = calculateHoldings(transactions);
  const portfolio = buildPortfolio(holdings);
  const allocationStatus = calculateAllocationStatus(portfolio, targetAllocations);
  const suggestions = generateSuggestions(portfolio, allocationStatus);
  const riskIndicators = calculateRiskIndicators(portfolio);

  logger.log('ポートフォリオ分析完了');

  return {
    portfolio,
    allocationStatus,
    suggestions,
    riskIndicators
  };
}
