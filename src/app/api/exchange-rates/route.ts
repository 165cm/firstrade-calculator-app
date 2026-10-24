// src/app/api/exchange-rates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeJob } from '@/services/exchangeService/job';
import { NotificationService } from '@/services/exchangeService/notification';
import { requireCronAuth } from '@/lib/cronAuth';

export async function GET() {
  return NextResponse.json({
    message: '為替レート更新APIが正常に動作しています',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  // 実行元の検証（User-Agent は偽装可能なため共有シークレットで認証）
  const authError = requireCronAuth(request);
  if (authError) return authError;

  const notificationService = new NotificationService();

  try {
    await executeJob();

    return NextResponse.json({
      success: true,
      message: '為替レート更新が正常に完了しました',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof Error) {
      await notificationService.notifyError(error);
    }

    console.error('為替レート更新エラー:', error instanceof Error ? error.message : error);

    return NextResponse.json({
      success: false,
      error: '更新処理に失敗しました',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}