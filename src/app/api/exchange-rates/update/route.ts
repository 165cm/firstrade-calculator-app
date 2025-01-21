// src/app/api/exchange-rates/update/route.ts
import { NextResponse } from 'next/server';
import { FrankfurterAPI } from '@/services/exchangeService/api/frankfurter';
import { ExchangeStorageService } from '@/services/exchangeService/storage';
import { ExchangeRateUpdater } from '@/services/exchangeService/updater';

export async function POST(request: Request) {
  // Cloud Schedulerからのリクエストであることを確認
  const userAgent = request.headers.get('user-agent') || '';
  if (!userAgent.includes('Google-Cloud-Scheduler')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const api = new FrankfurterAPI();
    const storage = new ExchangeStorageService();
    const updater = new ExchangeRateUpdater(api, storage);

    console.log('為替レート更新を開始します...');
    await updater.updateDaily();
    console.log('為替レート更新が完了しました');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('為替レート更新に失敗しました:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '更新処理に失敗しました' 
    }, { status: 500 });
  }
}