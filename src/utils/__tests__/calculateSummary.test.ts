import { calculateGainLossSummary } from '@/utils/gainloss/calculateSummary';
import type { GainLossRecord } from '@/types/gainloss';

const RATES: Record<string, number> = {
  '2024-01-10': 145,
  '2024-03-01': 150,
  '2024-06-01': 155,
  '2024-07-15': 160,
};

jest.mock('@/data/exchangeRates', () => ({
  getExchangeRate: jest.fn(async (date: string) => RATES[date]),
}));

const trade = (overrides: Partial<GainLossRecord>): GainLossRecord => ({
  symbol: 'AAA',
  purchaseDate: '2024-01-10',
  saleDate: '2024-03-01',
  quantity: 1,
  proceeds: 0,
  cost: 0,
  washSale: 0,
  gainLoss: 0,
  ...overrides,
});

describe('calculateGainLossSummary', () => {
  const records: GainLossRecord[] = [
    // 利益: 売却 1,200 × 150 − 取得 1,000 × 145 = 35,000円
    trade({ symbol: 'AAA', proceeds: 1200, cost: 1000, gainLoss: 200 }),
    // Wash Sale: 米国方式 gainLoss = 900 − 1,000 + 100 = 0 / 日本方式 = −100
    trade({ symbol: 'BBB', saleDate: '2024-03-01', proceeds: 900, cost: 1000, washSale: 100, gainLoss: 0 }),
    // 別月: 売却 500 × 160 − 取得 400 × 155 = 18,000円
    trade({ symbol: 'AAA', purchaseDate: '2024-06-01', saleDate: '2024-07-15', proceeds: 500, cost: 400, gainLoss: 100 }),
  ];

  it('computes JPY gain per trade with purchase-date and sale-date rates', async () => {
    const summary = await calculateGainLossSummary(records);
    const bbb = summary.symbolSummary.find(s => s.symbol === 'BBB')!;
    expect(bbb.trades[0].gainLossJPY).toBe(900 * 150 - 1000 * 145);
    expect(summary.totalGainLossJPY).toBe(35000 + (900 * 150 - 1000 * 145) + 18000);
  });

  it('uses the Japanese method (no wash sale adjustment) for USD totals', async () => {
    const summary = await calculateGainLossSummary(records);
    expect(summary.totalGainLossUSD).toBe(200 - 100 + 100);
    // 米国方式の値は取引明細に保持される（米国方式CSV用）
    const bbb = summary.symbolSummary.find(s => s.symbol === 'BBB')!;
    expect(bbb.trades[0].gainLoss).toBe(0);
  });

  it('monthly totals add up to the symbol totals', async () => {
    const summary = await calculateGainLossSummary(records);
    const monthlyJPY = summary.monthlyGainLoss.reduce((sum, m) => sum + m.gainLossJPY, 0);
    const monthlyUSD = summary.monthlyGainLoss.reduce((sum, m) => sum + m.gainLossUSD, 0);
    expect(monthlyJPY).toBe(summary.totalGainLossJPY);
    expect(monthlyUSD).toBe(summary.totalGainLossUSD);
    expect(summary.monthlyGainLoss.map(m => m.month)).toEqual(['2024-03', '2024-07']);
  });
});
