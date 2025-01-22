// src/app/api/exchange-rates/update/route.ts
import { NextResponse } from 'next/server';
// .jsを削除
import { FrankfurterAPI } from '@/services/exchangeService/api/frankfurter';
import { ExchangeStorageService } from '@/services/exchangeService/storage';
import { ExchangeRateUpdater } from '@/services/exchangeService/updater';

export async function GET() {
  return NextResponse.json({ message: 'Exchange rates API endpoint' });
}

export async function POST() {
  try {
    console.log('為替レート更新: 開始', {
      timestamp: new Date().toISOString()
    });

    const api = new FrankfurterAPI();
    const storage = new ExchangeStorageService();
    const updater = new ExchangeRateUpdater(api, storage);

    await updater.updateDaily();

    console.log('為替レート更新: 完了', {
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: '為替レート更新が完了しました',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('為替レート更新: エラー', {
      error: error instanceof Error ? error.message : '不明なエラー',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '為替レート更新に失敗しました',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}