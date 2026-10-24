// src/lib/gumroad.ts
import { getGumroadProducts, isExpired, isInvalidExpiry, type GumroadProduct } from '@/lib/licenseEditions';

export interface GumroadLicenseResponse {
  success: boolean;
  uses: number;
  purchase: {
    seller_id: string;
    product_id: string;
    product_name: string;
    permalink: string;
    product_permalink: string;
    email: string;
    price: number;
    currency: string;
    quantity: number;
    order_number: number;
    sale_id: string;
    sale_timestamp: string;
    refunded: boolean;
    disputed: boolean;
    dispute_won: boolean;
    test: boolean;
  };
  message?: string;
}

export interface VerifyLicenseResult {
  success: boolean;
  email?: string;
  message?: string;
  expiryDate?: string;
  isExpired?: boolean;
  /** 表示用の版名（例: 2026年版） */
  edition?: string;
}

type ProductCheck =
  | { status: 'valid'; result: VerifyLicenseResult }
  | { status: 'expired'; result: VerifyLicenseResult }
  | { status: 'invalid'; message: string }
  | { status: 'not_found' }
  | { status: 'error' };

/**
 * 1つの商品に対してライセンスキーを確認
 */
async function checkProduct(product: GumroadProduct, licenseKey: string): Promise<ProductCheck> {
  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        product_id: product.productId,
        license_key: licenseKey,
      }),
    });

    const data: GumroadLicenseResponse = await response.json();

    if (!data.success) {
      // 別の年度版のキーの場合もここに来るため、警告ログは呼び出し側でまとめて出す
      return response.status === 404 ? { status: 'not_found' } : { status: 'error' };
    }

    // 返金済みまたは紛争中の場合は無効
    if (data.purchase.refunded || data.purchase.disputed) {
      return { status: 'invalid', message: 'このライセンスは無効です' };
    }

    // 有効期限の設定ミスは「無期限」扱いにせず、認証を拒否する
    if (isInvalidExpiry(product.expiry)) {
      console.error('Gumroad product has an invalid expiry setting:', { edition: product.edition });
      return { status: 'error' };
    }

    const editionLabel = product.edition || 'このライセンス';

    if (isExpired(product.expiry)) {
      return {
        status: 'expired',
        result: {
          success: false,
          message: `${editionLabel}の有効期限が切れています（${product.expiry}まで有効）。新しい年度版のライセンスキーを入力してください`,
          expiryDate: product.expiry || undefined,
          isExpired: true,
          edition: product.edition || undefined,
        },
      };
    }

    return {
      status: 'valid',
      result: {
        success: true,
        email: data.purchase.email,
        expiryDate: product.expiry || undefined,
        isExpired: false,
        edition: product.edition || undefined,
      },
    };
  } catch (error) {
    console.error('Gumroad API error:', error instanceof Error ? error.message : error);
    return { status: 'error' };
  }
}

/**
 * Gumroad APIでライセンスキーを検証
 * 設定された年度版の商品を順に確認し、有効なものが見つかればそれを採用する
 * サーバーサイドでのみ使用
 */
export async function verifyGumroadLicense(
  licenseKey: string
): Promise<VerifyLicenseResult> {
  const products = getGumroadProducts();

  if (products.length === 0) {
    console.error('GUMROAD_PRODUCTS / GUMROAD_PRODUCT_ID is not configured');
    return {
      success: false,
      message: 'サーバー設定エラー',
    };
  }

  const trimmedKey = licenseKey.trim();
  const checks = await Promise.all(products.map(product => checkProduct(product, trimmedKey)));

  const valid = checks.find(check => check.status === 'valid');
  if (valid && valid.status === 'valid') {
    return valid.result;
  }

  const invalid = checks.find(check => check.status === 'invalid');
  if (invalid && invalid.status === 'invalid') {
    return { success: false, message: invalid.message };
  }

  const expired = checks.find(check => check.status === 'expired');
  if (expired && expired.status === 'expired') {
    return expired.result;
  }

  if (checks.some(check => check.status === 'error')) {
    // ライセンスキーや購入者情報はログに残さない
    console.warn('Gumroad verification failed with errors:', checks.map(check => check.status));
    return {
      success: false,
      message: '検証中にエラーが発生しました。時間をおいて再度お試しください',
    };
  }

  return {
    success: false,
    message: 'ライセンスキーが正しくありません',
  };
}
