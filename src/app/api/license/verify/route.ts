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

    const result = await verifyGumroadLicense(licenseKey);

    return NextResponse.json(result);
  } catch (error) {
    console.error('License verification error:', error);
    return NextResponse.json(
      { success: false, message: '検証中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
