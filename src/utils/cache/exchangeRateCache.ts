// src/utils/cache/exchangeRateCache.ts
export class ExchangeRateCache {
    private static CACHE_KEY = 'exchange-rates-v1';
    
    static async get(date: string): Promise<number | null> {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      // 24時間以上経過したデータは無効化
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }
      
      return data.rates[date] || null;
    }
    
    static async set(rates: Record<string, number>): Promise<void> {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        rates
      }));
    }
  }