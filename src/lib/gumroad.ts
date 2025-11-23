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
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        product_id: productId,
        license_key: licenseKey.trim(),
      }),
    });

    const data: GumroadLicenseResponse = await response.json();

    if (data.success) {
      // 返金済みまたは紛争中の場合は無効
      if (data.purchase.refunded || data.purchase.disputed) {
        return {
          success: false,
          message: 'このライセンスは無効です',
        };
      }

      return {
        success: true,
        email: data.purchase.email,
      };
    } else {
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
