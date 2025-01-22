// src/services/exchangeService/api/update-exchange-rates.ts
import { FrankfurterAPI } from './frankfurter.js';
import { ExchangeStorageService } from '../storage.js';
import { ExchangeRateUpdater } from '../updater.js';

export async function handleScheduledUpdate(req: Request): Promise<Response> {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Cloud Schedulerからのリクエストであることを確認
  const userAgent = req.headers.get('user-agent') || '';
  if (!userAgent.includes('Google-Cloud-Scheduler')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const api = new FrankfurterAPI();
    const storage = new ExchangeStorageService();
    const updater = new ExchangeRateUpdater(api, storage);

    console.log('為替レート更新を開始します...');
    await updater.updateDaily();
    console.log('為替レート更新が完了しました');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('為替レート更新に失敗しました:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : '更新処理に失敗しました' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}