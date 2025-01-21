// src/services/exchangeService/updater.ts
import { format, differenceInDays, endOfQuarter, eachDayOfInterval } from 'date-fns';
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
    
    private async getLatestStoredDate(): Promise<Date | null> {
      const currentData = await this.storage.readCurrentQuarter();
      if (!currentData || Object.keys(currentData.rates).length === 0) {
        return null;
      }
  
      const dates = Object.keys(currentData.rates).sort();
      return new Date(dates[dates.length - 1]);
    }
  
    async updateDaily(): Promise<void> {
      try {
        const latestStoredDate = await this.getLatestStoredDate();
        const today = new Date();
        
        if (!latestStoredDate) {
          console.log('保存済みデータがありません。初期データを取得します。');
          // 初期データ取得用のメソッドを呼び出し
          await this.fetchInitialData();
          return;
        }
  
        // 未取得期間のデータを取得
        const startDate = new Date(latestStoredDate);
        startDate.setDate(startDate.getDate() + 1); // 最終保存日の翌日から
  
        if (startDate <= today) {
          console.log(`${format(startDate, 'yyyy-MM-dd')}から${format(today, 'yyyy-MM-dd')}までのデータを取得します`);
          
          // 日付範囲でのデータ取得
          const dates = eachDayOfInterval({ start: startDate, end: today });
          for (const date of dates) {
            const rateValue = await this.api.fetchRate(format(date, 'yyyy-MM-dd'));
            await this.storage.saveRate({
              date: format(date, 'yyyy-MM-dd'),
              rate: { JPY: rateValue },
              source: this.api.getSource(),
              timestamp: Date.now()
            });
  
            // APIレート制限対策
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
  
        // 四半期末チェック
        if (this.isQuarterEnd(today)) {
          await this.storage.finalizeQuarter(
            this.getCurrentQuarter(today),
            format(today, 'yyyy')
          );
        }
      } catch (error) {
        await this.notifyError(error);
      }
    }

    private async fetchInitialData(): Promise<void> {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1); // 1ヶ月前からのデータを取得
  
      console.log('初期データを取得します:', {
        開始日: format(startDate, 'yyyy-MM-dd'),
        終了日: format(today, 'yyyy-MM-dd')
      });
  
      const dates = eachDayOfInterval({ start: startDate, end: today });
      for (const date of dates) {
        const rateValue = await this.api.fetchRate(format(date, 'yyyy-MM-dd'));
        await this.storage.saveRate({
          date: format(date, 'yyyy-MM-dd'),
          rate: { JPY: rateValue },
          source: this.api.getSource(),
          timestamp: Date.now()
        });
  
        // APIレート制限対策
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  
    private shouldUpdate(lastUpdate: Date, today: Date): boolean {
      // より詳細なデバッグ情報を出力
      console.log('Detailed update check:', {
        lastUpdate: lastUpdate.toISOString(),
        today: today.toISOString(),
        differenceInDays: differenceInDays(today, lastUpdate),
        lastUpdateTime: lastUpdate.getTime(),
        todayTime: today.getTime(),
        // 日付の比較（年月日のみ）
        lastUpdateDate: format(lastUpdate, 'yyyy-MM-dd'),
        todayDate: format(today, 'yyyy-MM-dd')
      });
  
      // 時刻を無視して日付のみで比較
      const lastUpdateDate = format(lastUpdate, 'yyyy-MM-dd');
      const todayDate = format(today, 'yyyy-MM-dd');
      
      return lastUpdateDate !== todayDate;
    }
  }