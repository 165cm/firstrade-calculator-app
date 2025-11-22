// src/utils/portfolio/parsePosition.ts
import type {
  Holding,
  Portfolio,
  SectorType,
  AssetClass
} from '@/types/portfolio';
import { logger } from '@/utils/common/logger';

/**
 * ポジション画面のコピペテキストをパースして保有状況を取得
 */
export function parsePositionText(text: string): Holding[] {
  const holdingsMap = new Map<string, Holding>();
  const lines = text.trim().split('\n');

  logger.log(`ポジションテキスト解析開始: ${lines.length}行`);

  for (const line of lines) {
    try {
      // タブまたは複数スペースで分割
      let parts = line.split(/\t+|\s{2,}/).map(p => p.trim()).filter(p => p);

      if (parts.length < 8) continue;

      // ヘッダー行をスキップ
      if (parts[0] === 'Symbol' || parts[0].includes('Stocks') || parts[0].includes('Market Value')) continue;
      // actions を除去
      parts = parts.filter(p => p !== 'actions');

      const symbol = parts[0].trim();

      // シンボルが空または数字のみの場合スキップ
      if (!symbol || /^\d+$/.test(symbol)) continue;
      // 特殊シンボル（H097852など）で価値0のものはスキップ
      if (symbol.startsWith('H0') && parts[3] === '0.00') continue;
      // 既に登録済みの場合スキップ
      if (holdingsMap.has(symbol)) continue;

      const quantity = parseNumber(parts[1]);
      const currentPrice = parseNumber(parts[2]);
      const marketValue = parseNumber(parts[5]);
      const unitCost = parseNumber(parts[6]);
      const totalCost = parseNumber(parts[7]);
      const gainLoss = parseNumber(parts[8]);
      const gainLossPercent = parseNumber(parts[9]);

      if (isNaN(quantity) || quantity <= 0) continue;

      holdingsMap.set(symbol, {
        symbol,
        quantity,
        averageCost: unitCost,
        totalCost,
        currentPrice,
        currentValue: marketValue,
        gainLoss,
        gainLossPercent,
        sector: guessSector(symbol),
        assetClass: guessAssetClass(symbol)
      });

      logger.debug(`解析成功: ${symbol}`, { quantity, marketValue, totalCost });
    } catch (error) {
      logger.debug('行の解析スキップ:', { line, error });
    }
  }

  const holdings = Array.from(holdingsMap.values());
  logger.log(`ポジション解析完了: ${holdings.length}銘柄`);
  return holdings.sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));
}

/**
 * 数値文字列をパース（カンマ、$、+、-を処理）
 */
function parseNumber(str: string): number {
  if (!str) return 0;
  // $, カンマ, +記号を除去
  const cleaned = str.replace(/[$,+]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

/**
 * ポートフォリオ全体を構築（現在価格あり）
 */
export function buildPortfolioFromPositions(holdings: Holding[]): Portfolio {
  const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalGainLoss = holdings.reduce((sum, h) => sum + (h.gainLoss || 0), 0);

  return {
    holdings,
    totalValue,
    totalCost,
    totalGainLoss,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * シンボルから資産クラスを推測
 */
function guessAssetClass(symbol: string): AssetClass {
  const bondEtfs = ['BND', 'AGG', 'TLT', 'IEF', 'SHY', 'VCIT', 'LQD', 'HYG', 'JNK', 'BNDX', 'EMLC'];
  const reitSymbols = ['VNQ', 'SCHH', 'IYR', 'O', 'AMT', 'PLD', 'CCI', 'EQIX'];
  const goldEtfs = ['GLD', 'GLDM', 'IAU', 'SGOL'];
  const etfPatterns = ['VOO', 'VTI', 'SPY', 'QQQ', 'IWM', 'VEU', 'VWO', 'VYM', 'SCHD', 'VIG', 'EPI', 'NERD', 'BKCH', 'IDRV'];

  if (bondEtfs.includes(symbol)) return 'Bond';
  if (reitSymbols.includes(symbol)) return 'REIT';
  if (goldEtfs.includes(symbol)) return 'Other'; // Gold as Other
  if (etfPatterns.includes(symbol)) return 'ETF';

  return 'Stock';
}

/**
 * シンボルからセクターを推測
 */
function guessSector(symbol: string): SectorType {
  // ETF
  const etfSymbols = ['VOO', 'VTI', 'SPY', 'QQQ', 'IWM', 'VEU', 'VWO', 'VYM', 'SCHD', 'VIG', 'EPI'];
  if (etfSymbols.includes(symbol)) return 'ETF';

  // 債券ETF
  const bondSymbols = ['BND', 'AGG', 'TLT', 'IEF', 'BNDX', 'EMLC'];
  if (bondSymbols.includes(symbol)) return 'Bond';

  // テーマETF
  if (['NERD', 'BKCH', 'IDRV', 'ICLN'].includes(symbol)) return 'ETF';

  // テクノロジー
  const techSymbols = ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'RBLX', 'SONY'];
  if (techSymbols.includes(symbol)) return 'Technology';

  // ゴールド
  if (['GLD', 'GLDM', 'IAU'].includes(symbol)) return 'Materials';

  return 'Other';
}
