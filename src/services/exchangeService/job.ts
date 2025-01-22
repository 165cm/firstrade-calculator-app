// src/services/exchangeService/job.ts を修正
import { FrankfurterAPI } from './api/frankfurter';
import { ExchangeStorageService } from './storage';
import { ExchangeRateUpdater } from './updater';
import { NotificationService } from './notification';

export async function executeJob(fromDate?: string): Promise<void> {
  const notificationService = new NotificationService();
  console.log('為替レート更新ジョブを開始します', {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    fromDate: fromDate || '最新のデータから'
  });

  try {
    const api = new FrankfurterAPI();
    const storage = new ExchangeStorageService();
    const updater = new ExchangeRateUpdater(api, storage);

    // fromDateを直接updateDailyに渡す
    console.log('データ取得開始:', { fromDate });
    await updater.updateDaily(fromDate);

    console.log('為替レート更新が完了しました', {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof Error) {
      await notificationService.notifyError(error);
      throw error;
    }
    throw new Error('不明なエラーが発生しました');
  }
}

// ESMでのエントリーポイント
if (process.argv[1] === import.meta.url.substring(7)) {
  // コマンドライン引数から日付を取得
  const fromDate = process.argv[2];
  console.log('コマンドライン引数:', { fromDate });
  
  executeJob(fromDate)
    .then(() => {
      console.log('ジョブが正常に完了しました');
      process.exit(0);
    })
    .catch(error => {
      console.error('ジョブが失敗しました:', error);
      process.exit(1);
    });
}