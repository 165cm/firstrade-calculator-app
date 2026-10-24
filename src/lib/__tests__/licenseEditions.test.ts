import { expiryToTime, isExpired, getGumroadProducts, findCouponCode } from '@/lib/licenseEditions';

describe('license expiry', () => {
  it('treats the expiry date as the end of the day in JST', () => {
    expect(new Date(expiryToTime('2026-12-31')).toISOString()).toBe('2026-12-31T14:59:59.999Z');
    expect(isExpired('2026-12-31', Date.parse('2026-12-31T14:59:00Z'))).toBe(false);
    expect(isExpired('2026-12-31', Date.parse('2026-12-31T15:00:00Z'))).toBe(true);
    expect(isExpired(null)).toBe(false);
  });
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
});
