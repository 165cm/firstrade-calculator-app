// src/app/api/license/session/route.ts
// 保存済みライセンストークンの有効性を確認する
import { NextRequest, NextResponse } from 'next/server';
import { verifyLicenseToken } from '@/lib/licenseToken';
import { createRateLimiter, getClientIP } from '@/lib/rateLimit';

const checkRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 60 });

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(getClientIP(request));
  if (!rateLimit.allowed) {
    return NextResponse.json({ valid: false }, { status: 429 });
  }

  try {
    const { token } = await request.json();
    const payload = verifyLicenseToken(token);

    if (!payload) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      expiryDate: payload.licenseExpiry ?? null,
      edition: payload.edition ?? null,
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
