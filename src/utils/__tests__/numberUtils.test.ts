import { cleanNumber, parseNumber } from '@/utils/common/numberUtils';

describe('parseNumber', () => {
  it.each([
    ['1,234.56', 1234.56],
    ['$1,234.56', 1234.56],
    ['  42 ', 42],
    ['-5.5', -5.5],
    ['(1,234.56)', -1234.56],
    ['($12.00)', -12],
    ['1,234.56-', -1234.56],
    ['−3.2', -3.2],
    ['', 0],
    [7, 7],
  ])('%p -> %p', (input, expected) => {
    expect(parseNumber(input as string | number)).toBeCloseTo(expected as number);
  });

  it('returns NaN for unparsable text', () => {
    expect(parseNumber('N/A')).toBeNaN();
    expect(parseNumber('()')).toBeNaN();
  });
});

describe('cleanNumber', () => {
  it('falls back to 0 for unparsable text', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(cleanNumber('N/A')).toBe(0);
    warn.mockRestore();
  });

  it('handles accounting negatives', () => {
    expect(cleanNumber('(100.25)')).toBeCloseTo(-100.25);
  });
});
