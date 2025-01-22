// src/services/exchangeService/updater.ts
import { format, differenceInDays, endOfQuarter, eachDayOfInterval } from 'date-fns';
import type { ExchangeRateAPI } from './types';
import { FrankfurterAPI } from './api/frankfurter';
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
  
    public async updateDaily(fromDate?: string): Promise<void> {
      try {
        const today = new Date();
        console.log('処理開始時の状態:', {
          現在時刻: today.toISOString(),
          指定日付: fromDate
        });
    
        let startDate: Date;
        if (fromDate) {
          console.log(`${fromDate}以降のデータを再取得します`);
          // 明示的な削除処理の実行
          await this.storage.deleteDataAfter(fromDate);
          console.log('データ削除完了');
        
          // 指定日（含む）から取得開始
          startDate = new Date(fromDate + 'T00:00:00.000Z');
          console.log('開始日設定:', {
            fromDate,
            startDate: format(startDate, 'yyyy-MM-dd')
          });
        } else {
          const latestStoredDate = await this.getLatestStoredDate();
          if (!latestStoredDate) {
            console.log('保存済みデータがありません。初期データを取得します。');
            await this.fetchInitialData();
            return;
          }
          startDate = new Date(latestStoredDate);
          startDate.setDate(startDate.getDate() + 1);
        }

        // 日付の比較を修正
        if (startDate.getTime() <= today.getTime()) {
          // 日付範囲の取得前にログ出力
          console.log('日付範囲の設定:', {
            開始日: format(startDate, 'yyyy-MM-dd'),
            終了日: format(today, 'yyyy-MM-dd'),
            開始タイムスタンプ: startDate.getTime(),
            終了タイムスタンプ: today.getTime()
          });

          const dates = eachDayOfInterval({ 
            start: startDate,
            end: today 
          });

          console.log('取得対象の日付一覧:', 
            dates.map(d => format(d, 'yyyy-MM-dd'))
          );

          for (const date of dates) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            console.log(`${formattedDate}の為替レートを取得中...`);
            
            try {
              const rateValue = await this.api.fetchRate(formattedDate);
              await this.storage.saveRate({
                date: formattedDate,
                rate: { JPY: rateValue },
                source: this.api.getSource(),
                timestamp: Date.now()
              });
              console.log(`${formattedDate}: 取得成功`, { rate: rateValue });
            } catch (error) {
              console.error(`${formattedDate}: 取得失敗`, error);
              throw error;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          console.log('取得対象の日付範囲がありません', {
            開始日: format(startDate, 'yyyy-MM-dd'),
            今日: format(today, 'yyyy-MM-dd')
          });
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
        throw error;
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

  // 単独で実行可能な関数を追加
  export async function runExchangeRateUpdate(): Promise<void> {
  const api = new FrankfurterAPI();
  const storage = new ExchangeStorageService();
  const updater = new ExchangeRateUpdater(api, storage);
  await updater.updateDaily();
  }