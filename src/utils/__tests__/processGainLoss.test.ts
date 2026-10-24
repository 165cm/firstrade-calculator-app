import { processGainLossData } from '@/utils/gainloss/processGainLoss';
import type { RawGainLossData } from '@/types/gainloss';

const row = (overrides: Partial<RawGainLossData>): RawGainLossData => ({
  Symbol: 'AAA', TradeDate: '03/15/2024', PurchaseDate: '01/10/2024',
  Quantity: 1, Proceeds: 1200, Cost: 1000, Amount: 200, WashSale: '', Term: 'Short',
  ...overrides,
});

describe('processGainLossData', () => {
  it.each([
    ['03/05/2024', '2024-03-05'],
    ['2024/03/05', '2024-03-05'],
    ['3-5-2024', '2024-03-05'],
    ['Mar 5, 2024', '2024-03-05'],
  ])('normalizes sale date %p to %p without shifting the day', async (input, expected) => {
    const [record] = await processGainLossData([row({ TradeDate: input })]);
    expect(record.saleDate).toBe(expected);
  });

  it('computes the US-method gain including the wash sale adjustment', async () => {
    const [record] = await processGainLossData([row({ Proceeds: 900, Cost: 1000, WashSale: '100.00' })]);
    expect(record.gainLoss).toBe(0);
  });
});
