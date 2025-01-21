// scripts/checkStoredRates.ts
import { ExchangeStorageService } from '../src/services/exchangeService/storage.js';

async function checkStoredRates() {
  const storage = new ExchangeStorageService();
  
  // 最終更新日時の確認
  const lastUpdate = await storage.getLastUpdateDate();
  console.log('最終更新日時:', lastUpdate);
  
  // 現在の四半期データの確認
  const currentData = await storage.readCurrentQuarter();
  console.log('現在の四半期データ:', JSON.stringify(currentData, null, 2));
}

checkStoredRates().catch(console.error);