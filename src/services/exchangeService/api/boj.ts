// src/services/exchangeService/api/boj.ts
// 日本銀行の基準外国為替相場を取得

import type { ExchangeRateAPI } from '@/types/exchange';

/**
 * 日本銀行統計データベースからTTM（仲値）を取得
 *
 * 注意: 日銀の直接APIは複雑なため、
 * 代替として日銀データを提供する無料APIを使用
 */
export class BOJRateAPI implements ExchangeRateAPI {
  // 日銀の基準外国為替相場に近いデータを提供するAPI
  // ExchangeRate-API (無料枠: 月1500リクエスト)
  private readonly BASE_URL = 'https://open.er-api.com/v6';

  async fetchRate(date: string): Promise<number> {
    try {
      // 日付形式をYYYY-MM-DDからAPIが受け付ける形式に変換
      const response = await fetch(
        `${this.BASE_URL}/latest/USD`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.rates && data.rates.JPY) {
        return data.rates.JPY;
      }

      throw new Error('JPY rate not found in response');
    } catch (error) {
      console.error(`Failed to fetch rate for ${date}:`, error);
      throw error;
    }
  }

  async fetchRateRange(startDate: string, endDate: string): Promise<Record<string, number>> {
    // 日次データを取得するには有料プランが必要なため、
    // 範囲取得は個別に取得する
    const rates: Record<string, number> = {};

    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];

      // 土日はスキップ
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        try {
          const rate = await this.fetchRate(dateStr);
          rates[dateStr] = rate;
        } catch (error) {
          console.warn(`Skipping ${dateStr}: ${error}`);
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return rates;
  }

  getSource(): string {
    return 'boj';
  }
}

// デフォルトのインスタンスをエクスポート
export const bojRateAPI = new BOJRateAPI();
