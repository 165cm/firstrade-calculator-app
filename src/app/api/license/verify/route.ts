// src/app/api/license/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyGumroadLicense } from '@/lib/gumroad';
import { issueLicenseToken, isTokenSecretConfigured } from '@/lib/licenseToken';
import { createRateLimiter, getClientIP } from '@/lib/rateLimit';

// 総当たり対策（1分あたり10回まで）
const checkRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 10 });

/**
 * 招待コード一覧を環境変数から取得
 * LICENSE_COUPON_CODES にカンマ区切りで設定（例: CODE_A,CODE_B）
 */
function getCouponCodes(): string[] {
  return (process.env.LICENSE_COUPON_CODES || '')
    .split(',')
    .map(code => code.trim())
    .filter(code => code.length > 0);
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getClientIP(request));
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: '試行回数が多すぎます。しばらくしてから再度お試しください' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)) } }
      );
    }

    const body = await request.json();
    const { licenseKey } = body;

    if (!licenseKey || typeof licenseKey !== 'string' || licenseKey.length > 256) {
      return NextResponse.json(
        { success: false, message: 'ライセンスキーを入力してください' },
        { status: 400 }
      );
    }

    if (!isTokenSecretConfigured()) {
      return NextResponse.json(
        { success: false, message: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    const trimmedKey = licenseKey.trim();

    // クーポンコード（招待コード）の検証
    if (getCouponCodes().includes(trimmedKey)) {
      return NextResponse.json({
        success: true,
        email: 'coupon-user@example.com',
        expiryDate: undefined, // 無期限
        isExpired: false,
        message: '招待コードが適用されました',
        token: issueLicenseToken(trimmedKey, 'coupon'),
      });
    }

    const result = await verifyGumroadLicense(trimmedKey);

    return NextResponse.json({
      ...result,
      expiryDate: result.expiryDate,
      isExpired: result.isExpired,
      ...(result.success ? { token: issueLicenseToken(trimmedKey, 'gumroad', result.expiryDate) } : {}),
    });
  } catch (error) {
    console.error('License verification error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, message: '検証中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
