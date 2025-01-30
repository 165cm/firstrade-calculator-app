// src/utils/cache/sessionCache.ts
import type { CSVData, DividendData, GainLossData } from './types';

export class SessionCache {
  private static PREFIX = 'session-data-v1';
  
  static async cacheCSVData(
    type: 'dividend' | 'gainloss',
    data: DividendData | GainLossData
  ): Promise<void> {
    sessionStorage.setItem(`${this.PREFIX}-${type}`, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  }
  
  static async getCSVData(
    type: 'dividend' | 'gainloss'
  ): Promise<DividendData | GainLossData | null> {
    const cached = sessionStorage.getItem(`${this.PREFIX}-${type}`);
    if (!cached) return null;
    
    const parsedData = JSON.parse(cached) as CSVData;
    return parsedData.data;
  }
  
  static clearAll(): void {
    Object.keys(sessionStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => sessionStorage.removeItem(key));
  }
}