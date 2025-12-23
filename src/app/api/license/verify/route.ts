// src/app/api/license/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyGumroadLicense } from '@/lib/gumroad';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licenseKey } = body;

    if (!licenseKey || typeof licenseKey !== 'string') {
      return NextResponse.json(
        { success: false, message: 'ライセンスキーを入力してください' },
        { status: 400 }
      );
    }

    // クーポンコード（招待コード）の検証
    // 環境変数に設定するか、ハードコードで対応
    const COUPON_CODES = ['LHU7PO4', 'MEMBER_FOR_NOTE'];

    if (COUPON_CODES.includes(licenseKey)) {
      return NextResponse.json({
        success: true,
        email: 'coupon-user@example.com',
        expiryDate: undefined, // 無期限
        isExpired: false,
        message: '招待コードが適用されました',
      });
    }

    const result = await verifyGumroadLicense(licenseKey);

    return NextResponse.json({
      ...result,
      expiryDate: result.expiryDate,
      isExpired: result.isExpired,
    });
  } catch (error) {
    console.error('License verification error:', error);
    return NextResponse.json(
      { success: false, message: '検証中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
