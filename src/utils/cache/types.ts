// src/utils/cache/types.ts
export interface CSVData {
    timestamp: number;
    data: DividendData | GainLossData;
  }
  
  export interface DividendData {
    dividends: Array<{
      date: string;
      amount: number;
      symbol: string;
    }>;
    interest: Array<{
      date: string;
      amount: number;
      source: string;
    }>;
  }
  
  export interface GainLossData {
    transactions: Array<{
      date: string;
      symbol: string;
      amount: number;
      gainLoss: number;
    }>;
  }