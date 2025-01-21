// scripts/updateExchangeRates.ts
import { FrankfurterAPI } from '../src/services/exchangeService/api/frankfurter.js';
import { ExchangeStorageService } from '../src/services/exchangeService/storage.js';
import { ExchangeRateUpdater } from '../src/services/exchangeService/updater.js';

async function main() {
  const api = new FrankfurterAPI();
  const storage = new ExchangeStorageService();
  const updater = new ExchangeRateUpdater(api, storage);
  
  try {
    console.log('為替レート更新を開始します...');
    await updater.updateDaily();
    console.log('為替レート更新が完了しました');
  } catch (error) {
    console.error('為替レート更新に失敗しました:', error);
    process.exit(1);
  }
}

// 引数で強制更新フラグを受け取れるように
if (process.argv.includes('--force')) {
  console.log('強制更新モードで実行します');
}

main();