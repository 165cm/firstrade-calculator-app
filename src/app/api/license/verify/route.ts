// src/app/api/license/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyGumroadLicense } from '@/lib/gumroad';
import { issueLicenseToken, isTokenSecretConfigured } from '@/lib/licenseToken';
import { createRateLimiter, getClientIP } from '@/lib/rateLimit';
import { findCouponCode, isExpired, isInvalidExpiry } from '@/lib/licenseEditions';

// 総当たり対策（1分あたり10回まで）
const checkRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 10 });

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
    // 招待コード欄から送られた場合は Gumroad には問い合わせない
    const coupon = findCouponCode(trimmedKey);
    if (coupon) {
      // 有効期限の設定ミスは「無期限」扱いにせず、認証を拒否する
      if (isInvalidExpiry(coupon.expiry)) {
        console.error('Coupon code has an invalid expiry setting');
        return NextResponse.json(
          { success: false, message: 'サーバー設定エラー' },
          { status: 500 }
        );
      }
      if (isExpired(coupon.expiry)) {
        return NextResponse.json({
          success: false,
          message: `この招待コードの有効期限が切れています（${coupon.expiry}まで有効）`,
          expiryDate: coupon.expiry,
          isExpired: true,
        });
      }
      return NextResponse.json({
        success: true,
        email: 'coupon-user@example.com',
        expiryDate: coupon.expiry ?? undefined,
        isExpired: false,
        message: '招待コードが適用されました',
        token: issueLicenseToken(coupon.code, 'coupon', coupon.expiry ?? undefined),
      });
    }

    if (body.type === 'coupon') {
      return NextResponse.json({
        success: false,
        message: '招待コードが正しくありません',
      });
    }

    const result = await verifyGumroadLicense(trimmedKey);

    return NextResponse.json({
      ...result,
      ...(result.success
        ? { token: issueLicenseToken(trimmedKey, 'gumroad', result.expiryDate, result.edition) }
        : {}),
    });
  } catch (error) {
    console.error('License verification error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, message: '検証中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
