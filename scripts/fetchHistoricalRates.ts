// scripts/fetchHistoricalRates.ts
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs/promises';
import { format, eachMonthOfInterval } from 'date-fns';
import { FrankfurterAPI } from '../src/services/exchangeService/api/frankfurter.js';
import { ExchangeStorageService } from '../src/services/exchangeService/storage.js';

// __dirname の代替実装
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

async function ensureDirectories(): Promise<void> {
  const dirPath = path.join(currentDirPath, '../src/data');
  const dirs = [
    'current',
    'historical',
    'meta'
  ];
  
  for (const dir of dirs) {
    const fullPath = path.join(dirPath, dir);
    try {
      await fs.access(fullPath);
    } catch {
      await fs.mkdir(fullPath, { recursive: true });
    }
  }
}

async function main() {
  await ensureDirectories();
  
  const api = new FrankfurterAPI();
  const storage = new ExchangeStorageService();
  
  const startDate = new Date(2019, 0, 1);
  const endDate = new Date(2024, 11, 31);
  
  const months = eachMonthOfInterval({
    start: startDate,
    end: endDate
  });

  console.log('開始：過去の為替データ取得');
  
  for (let i = 0; i < months.length - 1; i++) {
    const currentMonth = months[i];
    const nextMonth = months[i + 1];
    
    const formattedStart = format(currentMonth, 'yyyy-MM-dd');
    const formattedEnd = format(nextMonth, 'yyyy-MM-dd');
    
    try {
      console.log(`取得中: ${formattedStart} ～ ${formattedEnd}`);
      
      const rates = await api.fetchRateRange(formattedStart, formattedEnd);
      
      for (const [date, rateValue] of Object.entries(rates)) {
        await storage.saveRate({
          date,
          rate: { JPY: rateValue },
          source: api.getSource(),
          timestamp: Date.now()
        });
      }
      
      // APIレート制限対策
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`エラー発生 (${formattedStart}): ${errorMessage}`);
    }
  }
  
  console.log('完了：過去の為替データ取得');
}

main().catch(error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('スクリプト実行エラー:', errorMessage);
  process.exit(1);
});