// src/services/exchangeService/updater.ts
import { format, differenceInDays, endOfQuarter } from 'date-fns';
import type { ExchangeRateAPI } from './types';
import { ExchangeStorageService } from './storage';


export class ExchangeRateUpdater {
    private storage: ExchangeStorageService;
    private api: ExchangeRateAPI;
  
    constructor(api: ExchangeRateAPI, storage: ExchangeStorageService) {
      this.api = api;
      this.storage = storage;
    }
  
    private isQuarterEnd(date: Date): boolean {
      return endOfQuarter(date).getTime() === date.getTime();
    }
  
    private getCurrentQuarter(date: Date): string {
      return String(Math.floor(date.getMonth() / 3) + 1);
    }
  
    private async notifyError(error: unknown): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Exchange rate update failed:', errorMessage);
        // TODO: 実際のエラー通知実装
      }
  
    async updateDaily(): Promise<void> {
      try {
        const lastUpdate = await this.storage.getLastUpdateDate();
        const today = new Date();
        
        if (this.shouldUpdate(lastUpdate, today)) {
          const rate = await this.api.fetchRate(format(today, 'yyyy-MM-dd'));
          await this.storage.saveRate({
            date: format(today, 'yyyy-MM-dd'),
            rate,
            source: this.api.getSource(),
            timestamp: Date.now()
          });
  
          // 四半期末チェック
          if (this.isQuarterEnd(today)) {
            await this.storage.finalizeQuarter(
              this.getCurrentQuarter(today),
              format(today, 'yyyy')
            );
          }
        }
      } catch (error) {
        await this.notifyError(error);
      }
    }
  
    private shouldUpdate(lastUpdate: Date, today: Date): boolean {
      // 更新判定ロジック
      return differenceInDays(today, lastUpdate) >= 1;
    }
  }