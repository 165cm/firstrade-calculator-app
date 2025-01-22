// src/services/exchangeService/types.ts
export interface ExchangeRateAPI {
    fetchRate(date: string): Promise<number>;
    fetchRateRange(startDate: string, endDate: string): Promise<Record<string, number>>;
    getSource(): string;
  }
  
  export interface ExchangeRate {
    date: string;
    rate: {
      JPY: number;  // rate を number から { JPY: number } に変更
    };
    source: string;
    timestamp: number;
  }
  
  export interface QuarterData {
    startDate: string;
    endDate: string;
    rates: { [key: string]: ExchangeRate };
    hash: string;
    [key: string]: string | { [key: string]: ExchangeRate };
  }
  
  export type JSONValue = 
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export type StorageData = {
  rates: Record<string, ExchangeRate>;
  metadata: {
    lastUpdate: string;
    version: string;
  };
};

// 通知サービス用の型定義を追加
export interface ErrorInfo {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  stack?: string;
  timestamp: string;
  service: string;
  environment?: string;
  errorType: string;
  errorCode: string;
}