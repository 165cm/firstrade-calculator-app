// src/app/api/exchange-rates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FrankfurterAPI } from '@/services/exchangeService/api/frankfurter';
import { ExchangeStorageService } from '@/services/exchangeService/storage';
import { ExchangeRateUpdater } from '@/services/exchangeService/updater';

// テスト用のGETエンドポイント
export async function GET() {
  return NextResponse.json({
    message: 'Exchange rates endpoint is working',
    timestamp: new Date().toISOString()
  });
}

// 更新用のPOSTエンドポイント
export async function POST(request: NextRequest) {
  try {
    // ログ出力
    console.log('Exchange rate update started', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent')
    });

    const api = new FrankfurterAPI();
    const storage = new ExchangeStorageService();
    const updater = new ExchangeRateUpdater(api, storage);

    await updater.updateDaily();

    console.log('Exchange rate update completed', {
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Exchange rate update completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Exchange rate update failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Exchange rate update failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}