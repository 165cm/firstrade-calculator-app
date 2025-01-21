// scripts/fetchHistoricalRates.ts
import { format, eachDayOfInterval } from 'date-fns';
import { FrankfurterAPI } from '../src/services/exchangeService/api/frankfurter.js';
import { ExchangeStorageService } from '../src/services/exchangeService/storage.js';
import type { QuarterData, ExchangeRate } from '../src/services/exchangeService/types.js';

interface FetchOptions {
  forceUpdate?: boolean;
  delayMs?: number;
}

async function fetchHistoricalRates(
  startDate: Date,
  endDate: Date,
  options: FetchOptions = {}
) {
  const {
    forceUpdate = false,
    delayMs = 1000
  } = options;

  const api = new FrankfurterAPI();
  const storage = new ExchangeStorageService();

  console.log('為替データ取得開始:', {
    '開始日': format(startDate, 'yyyy-MM-dd'),
    '終了日': format(endDate, 'yyyy-MM-dd'),
    '待機時間': `${delayMs}ms`,
    '強制更新': forceUpdate
  });

  // 現在のデータを読み込み
  const currentData: QuarterData = await storage.readCurrentQuarter() || {
    startDate: format(startDate, 'yyyy-MM-01'),
    endDate: format(endDate, 'yyyy-MM-dd'),
    rates: {} as { [key: string]: ExchangeRate },
    hash: ''
  };

  // 日付の配列を生成
  const dates = eachDayOfInterval({ start: startDate, end: endDate });

  for (const date of dates) {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // 既存データのチェック
    if (!forceUpdate && currentData.rates[formattedDate]) {
      console.log(`スキップ: ${formattedDate} (既存データ)`);
      continue;
    }

    try {
      const rate = await api.fetchRate(formattedDate);
      const rateData: ExchangeRate = {
        date: formattedDate,
        rate: { JPY: rate },
        source: api.getSource(),
        timestamp: Date.now()
      };

      // データを保存
      currentData.rates[formattedDate] = rateData;
      await storage.saveRate(rateData);
      console.log(`取得成功: ${formattedDate}`);
      
      // APIレート制限対策
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error(`エラー (${formattedDate}):`, error);
    }
  }

  console.log('為替データ取得完了');
}

// メイン処理
async function main() {
  const startDate = new Date(2025, 0, 1); // 2025-01-01
  const endDate = new Date();  // 現在日付

  await fetchHistoricalRates(startDate, endDate, {
    forceUpdate: true,  // 強制更新を有効化
    delayMs: 1000      // API制限対策の待機時間
  });
}

main().catch(error => {
  console.error('スクリプト実行エラー:', error);
  process.exit(1);
});