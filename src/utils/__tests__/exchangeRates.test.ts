import { getExchangeRate, clearRatesCache, clearDefaultRateTracking, getDefaultRateUsedDates, DEFAULT_RATE } from '@/data/exchangeRates';

const quarter = (rates: Record<string, number>) => ({
  startDate: '', endDate: '',
  rates: Object.fromEntries(Object.entries(rates).map(([date, JPY]) => [date, { date, rate: { JPY }, source: 'test', timestamp: 0 }])),
});

const FILES: Record<string, unknown> = {
  '/data/historical/2026/Q3.json': quarter({ '2026-09-29': 148, '2026-09-30': 149 }),
  '/data/current/2026Q4.json': quarter({ '2026-10-02': 151, '2026-10-05': 152 }),
  '/data/historical/2025/Q4.json': quarter({ '2025-12-30': 156 }),
};

const fetchMock = jest.fn(async (path: string) => {
  const body = FILES[path];
  return { ok: body !== undefined, json: async () => body } as Response;
});

beforeAll(() => { global.fetch = fetchMock as unknown as typeof fetch; });
beforeEach(() => {
  clearRatesCache();
  clearDefaultRateTracking();
  fetchMock.mockClear();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('getExchangeRate', () => {
  it('returns the rate for the exact date', async () => {
    expect(await getExchangeRate('2026-10-05')).toBe(152);
  });

  it('uses the latest earlier date in the same quarter (weekend)', async () => {
    expect(await getExchangeRate('2026-10-04')).toBe(151);
  });

  it('uses the last rate of the previous quarter instead of a future date on the first day of a quarter', async () => {
    expect(await getExchangeRate('2026-10-01')).toBe(149);
  });

  it('looks back to earlier quarters when the quarter file is missing', async () => {
    // 2026Q1 のファイルはないため、2025Q4 の最終日を使う
    expect(await getExchangeRate('2026-02-10')).toBe(156);
  });

  it('falls back to the default rate and records the date when no data exists', async () => {
    expect(await getExchangeRate('2019-01-15')).toBe(DEFAULT_RATE);
    expect(getDefaultRateUsedDates()).toEqual(['2019-01-15']);
  });

  it('fetches each quarter file only once across many dates', async () => {
    await Promise.all(['2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'].map(getExchangeRate));
    const q4Requests = fetchMock.mock.calls.filter(([path]) => path === '/data/current/2026Q4.json');
    expect(q4Requests).toHaveLength(1);
  });
});
