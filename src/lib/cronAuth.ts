// src/lib/cronAuth.ts
// 定期実行用エンドポイントの認証（Authorization: Bearer <CRON_SECRET>）
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 認証に失敗した場合はエラーレスポンスを返し、成功した場合は null を返す
 * CRON_SECRET が未設定の場合はエンドポイント自体を無効化する
 */
export function requireCronAuth(request: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ success: false, error: 'Not Found' }, { status: 404 });
  }

  const header = request.headers.get('authorization') || '';
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);

  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
