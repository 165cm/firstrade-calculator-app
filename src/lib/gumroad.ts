// src/lib/gumroad.ts

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
}

/**
 * ライセンスの有効期限を取得
 * 環境変数 GUMROAD_LICENSE_EXPIRY で設定（例: 2026-12-31）
 */
function getLicenseExpiryDate(): string | null {
  return process.env.GUMROAD_LICENSE_EXPIRY || null;
}

/**
 * ライセンスが期限切れかどうかをチェック
 */
function isLicenseExpired(expiryDate: string | null): boolean {
  if (!expiryDate) return false; // 期限設定がなければ永久ライセンス

  const now = new Date();
  const expiry = new Date(expiryDate);
  return now > expiry;
}

/**
 * Gumroad APIでライセンスキーを検証
 * サーバーサイドでのみ使用（APIキーを秘匿するため）
 */
export async function verifyGumroadLicense(
  licenseKey: string
): Promise<VerifyLicenseResult> {
  const productId = process.env.GUMROAD_PRODUCT_ID;

  if (!productId) {
    console.error('GUMROAD_PRODUCT_ID is not configured');
    return {
      success: false,
      message: 'サーバー設定エラー',
    };
  }

  try {
    const trimmedKey = licenseKey.trim();

    // Debug logging for request
    console.log('=== Gumroad License Verification Request ===');
    console.log('Product ID:', productId);
    console.log('License Key:', trimmedKey);
    console.log('License Key Length:', trimmedKey.length);

    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        product_id: productId,
        license_key: trimmedKey,
      }),
    });

    const data: GumroadLicenseResponse = await response.json();

    // Debug logging for response
    console.log('=== Gumroad License Verification Response ===');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      // 返金済みまたは紛争中の場合は無効
      if (data.purchase.refunded || data.purchase.disputed) {
        return {
          success: false,
          message: 'このライセンスは無効です',
        };
      }

      // 有効期限チェック
      const expiryDate = getLicenseExpiryDate();
      const expired = isLicenseExpired(expiryDate);

      if (expired) {
        return {
          success: false,
          message: `ライセンスの有効期限が切れています（${expiryDate}まで有効）`,
          expiryDate: expiryDate || undefined,
          isExpired: true,
        };
      }

      return {
        success: true,
        email: data.purchase.email,
        expiryDate: expiryDate || undefined,
        isExpired: false,
      };
    } else {
      console.error('Gumroad Verification Failed:', JSON.stringify(data, null, 2));
      return {
        success: false,
        message: data.message || 'ライセンスキーが正しくありません',
      };
    }
  } catch (error) {
    console.error('Gumroad API error:', error);
    return {
      success: false,
      message: '検証中にエラーが発生しました',
    };
  }
}
