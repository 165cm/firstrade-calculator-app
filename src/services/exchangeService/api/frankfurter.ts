// src/services/exchangeService/api/frankfurter.ts
import type { ExchangeRateAPI } from '@/types/exchange';

export class FrankfurterAPI implements ExchangeRateAPI {
  private readonly BASE_URL = 'https://api.frankfurter.app';

  async fetchRate(date: string): Promise<number> {
    const response = await fetch(
      `${this.BASE_URL}/${date}?from=USD&to=JPY`
    );
    const data = await response.json();
    return data.rates.JPY;
  }

  async fetchRateRange(startDate: string, endDate: string): Promise<Record<string, number>> {
    const response = await fetch(
      `${this.BASE_URL}/${startDate}..${endDate}?from=USD&to=JPY`
    );
    const data = await response.json();
    return data.rates;
  }

  getSource(): string {
    return 'Frankfurter';
  }
}