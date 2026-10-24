import { expiryToTime, isExpired, isInvalidExpiry, getGumroadProducts, findCouponCode, INVALID_EXPIRY } from '@/lib/licenseEditions';

describe('license expiry', () => {
  it('treats the expiry date as the end of the day in JST', () => {
    expect(new Date(expiryToTime('2026-12-31')).toISOString()).toBe('2026-12-31T14:59:59.999Z');
    expect(isExpired('2026-12-31', Date.parse('2026-12-31T14:59:00Z'))).toBe(false);
    expect(isExpired('2026-12-31', Date.parse('2026-12-31T15:00:00Z'))).toBe(true);
    expect(isExpired(null)).toBe(false);
  });

  it.each(['2026-13-31', '2026-02-31', '2026/12/31', 'tomorrow'])(
    'treats an invalid setting %p as a misconfiguration, not as unlimited',
    expiry => {
      expect(isInvalidExpiry(expiry)).toBe(true);
      expect(isExpired(expiry, Date.parse('2030-01-01T00:00:00Z'))).toBe(true);
    }
  );
});

describe('license configuration', () => {
  const env = process.env;
  beforeEach(() => { process.env = { ...env }; });
  afterAll(() => { process.env = env; });

  it('parses GUMROAD_PRODUCTS', () => {
    process.env.GUMROAD_PRODUCTS = '2026年版:NEW==:2027-12-31, 2025年版:OLD:2026-12-31';
    expect(getGumroadProducts()).toEqual([
      { edition: '2026年版', productId: 'NEW==', expiry: '2027-12-31' },
      { edition: '2025年版', productId: 'OLD', expiry: '2026-12-31' },
    ]);
  });

  it('falls back to the legacy single-product settings', () => {
    delete process.env.GUMROAD_PRODUCTS;
    process.env.GUMROAD_PRODUCT_ID = 'LEGACY';
    process.env.GUMROAD_LICENSE_EXPIRY = '2026-12-31';
    expect(getGumroadProducts()).toEqual([{ edition: '', productId: 'LEGACY', expiry: '2026-12-31' }]);
  });

  it('matches coupon codes case-insensitively', () => {
    process.env.LICENSE_COUPON_CODES = 'Note2026:2027-12-31,FREE';
    expect(findCouponCode(' note2026 ')).toEqual({ code: 'Note2026', expiry: '2027-12-31' });
    expect(findCouponCode('free')).toEqual({ code: 'FREE', expiry: null });
    expect(findCouponCode('other')).toBeNull();
  });

  it('keeps an invalid coupon expiry distinguishable from no expiry', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.LICENSE_COUPON_CODES = 'BAD:2026-13-31';
    expect(findCouponCode('BAD')).toEqual({ code: 'BAD', expiry: INVALID_EXPIRY });
    error.mockRestore();
  });
});
