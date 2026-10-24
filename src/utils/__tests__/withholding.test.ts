import { parseWithholdingFromDescription, calculateTotalWithholding } from '@/utils/withholding';
import type { ConvertedDividendRecord } from '@/types/dividend';

describe('parseWithholdingFromDescription', () => {
  it.each([
    ['NIKE INC CASH DIV NON-RES TAX WITHHELD  $0.53', 0.53],
    ['SUBST PAY IN LIEU OF DIVIDEND NON-RES TAX WITHHELD  $22.91', 22.91],
    ['BIG CO CASH DIV NON-RES TAX WITHHELD $1,234.56', 1234.56],
    ['SMALL CO CASH DIV NON-RES TAX WITHHELD $5', 5],
    ['lower case tax withheld $3.10', 3.1],
    ['WITHHELD 7.25', 7.25],
  ])('%p -> %p', (description, expected) => {
    expect(parseWithholdingFromDescription(description)).toBeCloseTo(expected);
  });

  it.each([
    ['INTEREST ON CREDIT BALANCE'],
    ['NON-QUALIFIED DIVIDEND AMOUNT INCLUDED ON 2024-1099'],
    ['NON-RES TAX WITHHELD $0.00'],
    [''],
  ])('%p -> null', description => {
    expect(parseWithholdingFromDescription(description)).toBeNull();
  });
});

describe('calculateTotalWithholding', () => {
  it('sums USD and converts each record with its own rate', () => {
    const records = [
      { Description: 'TAX WITHHELD $1,000.00', exchangeRate: 150 },
      { Description: 'TAX WITHHELD $10', exchangeRate: 140 },
      { Description: 'NO TAX', exchangeRate: 145 },
    ] as ConvertedDividendRecord[];
    expect(calculateTotalWithholding(records)).toEqual({ usd: 1010, jpy: 151400 });
  });
});
