// src/scripts/updateExchangeRates.ts
import { FrankfurterAPI } from '@/services/exchangeService/api/frankfurter';
import { ExchangeStorageService } from '@/services/exchangeService/storage';
import { ExchangeRateUpdater } from '@/services/exchangeService/updater';

async function main() {
  const api = new FrankfurterAPI();
  const storage = new ExchangeStorageService();
  const updater = new ExchangeRateUpdater(api, storage);
  
  try {
    await updater.updateDaily();
    console.log('Exchange rates updated successfully');
  } catch (error) {
    console.error('Failed to update exchange rates:', error);
  }
}

main();