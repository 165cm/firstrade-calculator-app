// src/lib/licenseEditions.ts
// 年度版ごとのライセンス設定（サーバーサイド専用）

export interface GumroadProduct {
  /** 表示用の版名（例: 2026年版） */
  edition: string;
  productId: string;
  /** 有効期限（YYYY-MM-DD、日本時間のその日の終わりまで有効）。null は無期限 */
  expiry: string | null;
}

/** 有効期限の設定値が不正な場合に入る値（認証を拒否するために「無期限」と区別する） */
export const INVALID_EXPIRY = 'INVALID' as const;

export interface CouponCode {
  code: string;
  expiry: string | null;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 有効期限（YYYY-MM-DD）を、日本時間のその日の終わりの時刻に変換
 */
export function expiryToTime(expiry: string): number {
  return new Date(`${expiry}T23:59:59.999+09:00`).getTime();
}

/**
 * 実在する日付の YYYY-MM-DD か（2026-13-31 や 2026-02-31 は不正）
 */
export function isValidExpiry(expiry: string): boolean {
  if (!DATE_PATTERN.test(expiry)) return false;
  const [year, month, day] = expiry.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * 有効期限の設定値が不正か（設定ミス。認証は拒否すべき）
 */
export function isInvalidExpiry(expiry: string | null): boolean {
  return expiry !== null && !isValidExpiry(expiry);
}

/**
 * 期限切れか。null（無期限）は期限切れにならない
 * 不正な設定値は安全側に倒して期限切れとして扱う
 */
export function isExpired(expiry: string | null, now: number = Date.now()): boolean {
  if (!expiry) return false;
  if (!isValidExpiry(expiry)) return true;
  return now > expiryToTime(expiry);
}

function parseExpiry(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!isValidExpiry(trimmed)) {
    console.error(`Invalid license expiry date: "${trimmed}" (YYYY-MM-DD 形式の実在する日付で指定してください)`);
    return INVALID_EXPIRY;
  }
  return trimmed;
}

/**
 * Gumroad商品の一覧を取得
 *
 * GUMROAD_PRODUCTS に「版名:商品ID:有効期限」をカンマ区切りで設定する
 *   例: 2026年版:xxxxxxxx:2027-12-31,2025年版:yyyyyyyy:2026-12-31
 * 未設定の場合は従来の GUMROAD_PRODUCT_ID / GUMROAD_LICENSE_EXPIRY を使う
 */
export function getGumroadProducts(): GumroadProduct[] {
  const products = (process.env.GUMROAD_PRODUCTS || '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => {
      const [edition, productId, expiry] = entry.split(':').map(part => part.trim());
      return { edition: edition || '', productId: productId || '', expiry: parseExpiry(expiry) };
    })
    .filter(product => product.productId.length > 0);

  if (products.length > 0) {
    return products;
  }

  const legacyProductId = process.env.GUMROAD_PRODUCT_ID?.trim();
  if (!legacyProductId) {
    return [];
  }
  return [{
    edition: process.env.GUMROAD_LICENSE_EDITION?.trim() || '',
    productId: legacyProductId,
    expiry: parseExpiry(process.env.GUMROAD_LICENSE_EXPIRY),
  }];
}

/**
 * 招待コードの一覧を取得
 *
 * LICENSE_COUPON_CODES に「コード」または「コード:有効期限」をカンマ区切りで設定する
 *   例: NOTE2026:2027-12-31,FRIEND
 */
export function getCouponCodes(): CouponCode[] {
  return (process.env.LICENSE_COUPON_CODES || '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => {
      const [code, expiry] = entry.split(':').map(part => part.trim());
      return { code, expiry: parseExpiry(expiry) };
    })
    .filter(coupon => coupon.code.length > 0);
}

/**
 * 入力された招待コードに一致するものを探す（前後の空白・大文字小文字は区別しない）
 */
export function findCouponCode(input: string): CouponCode | null {
  const normalized = input.trim().toUpperCase();
  if (!normalized) return null;
  return getCouponCodes().find(coupon => coupon.code.toUpperCase() === normalized) ?? null;
}
