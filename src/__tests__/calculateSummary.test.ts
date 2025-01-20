// src/__tests__/calculateSummary.test.ts
import { calculateGainLossSummary } from '@/utils/gainloss/calculateSummary';
import type { GainLossRecord } from '@/types/gainloss';

describe('calculateGainLossSummary', () => {
  const mockRecords: GainLossRecord[] = [
    {
      symbol: 'AAPL',
      purchaseDate: '2024-01-04',
      saleDate: '2024-01-10',
      quantity: 10,
      proceeds: 2000,
      cost: 1800,
      gainLoss: 200,
      purchaseRate: 144.30,
      saleRate: 145.20,
      costJPY: 259740,
      proceedsJPY: 290400,
      gainLossJPY: 30660
    },
    {
      symbol: 'GOOGL',
      purchaseDate: '2024-01-05',
      saleDate: '2024-01-15',
      quantity: 5,
      proceeds: 3000,
      cost: 2800,
      gainLoss: 200,
      purchaseRate: 144.60,
      saleRate: 145.30,
      costJPY: 404880,
      proceedsJPY: 435900,
      gainLossJPY: 31020
    }
  ];

  test('正しく損益サマリーを計算できる', () => {
    const summary = calculateGainLossSummary(mockRecords);

    // 総損益の確認
    expect(summary.totalGainLossUSD).toBe(400);  // 200 + 200
    expect(summary.totalGainLossJPY).toBe(61680);  // 30660 + 31020

    // 銘柄サマリーの確認
    expect(summary.symbolSummary).toHaveLength(2);
    
    // 銘柄別の損益確認
    const aaplSummary = summary.symbolSummary.find(s => s.symbol === 'AAPL');
    expect(aaplSummary?.gainLossUSD).toBe(200);
    expect(aaplSummary?.gainLossJPY).toBe(30660);

    const googlSummary = summary.symbolSummary.find(s => s.symbol === 'GOOGL');
    expect(googlSummary?.gainLossUSD).toBe(200);
    expect(googlSummary?.gainLossJPY).toBe(31020);
  });

  test('空の配列でも正しく処理できる', () => {
    const summary = calculateGainLossSummary([]);

    expect(summary.totalGainLossUSD).toBe(0);
    expect(summary.totalGainLossJPY).toBe(0);
    expect(summary.symbolSummary).toHaveLength(0);
    expect(summary.monthlyGainLoss).toHaveLength(0);
  });

  test('損益の降順でソートされている', () => {
    const summary = calculateGainLossSummary(mockRecords);
    const sortedGainLossUSD = summary.symbolSummary.map(s => s.gainLossUSD);
    const isSorted = sortedGainLossUSD.every((val, i) => 
      i === 0 || val <= sortedGainLossUSD[i - 1]
    );
    expect(isSorted).toBe(true);
  });
});