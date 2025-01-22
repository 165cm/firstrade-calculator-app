// src/app/api/exchange-rates/route.ts の修正
import { NextRequest, NextResponse } from 'next/server';
import { executeJob } from '@/services/exchangeService/job';
import { NotificationService } from '@/services/exchangeService/notification';

export async function GET() {
  return NextResponse.json({
    message: '為替レート更新APIが正常に動作しています',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  const notificationService = new NotificationService();

  try {
    // 実行元の検証
    const userAgent = request.headers.get('user-agent') || '';
    if (!userAgent.includes('Google-Cloud-Scheduler')) {
      throw new Error('不正なアクセスです');
    }

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

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新処理に失敗しました',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}