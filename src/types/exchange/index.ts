// src/types/exchange/index.ts

// Exchange Service API関連の型
export interface ExchangeRateAPI {
    fetchRate(date: string): Promise<number>;
    fetchRateRange(startDate: string, endDate: string): Promise<Record<string, number>>;
    getSource(): string;
  }
  
  export interface ExchangeRate {
    date: string;
    rate: {
      JPY: number;
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
  
  // 更新処理関連の型
  export interface UpdateOptions {
    forceUpdate?: boolean;
    delayMs?: number;
    startYear?: number;
    endYear?: number;
    validateData?: boolean;
  }
  
  export interface UpdateResult {
    success: boolean;
    processedFiles: string[];
    errors: Error[];
    updatedRates: number;
    skippedRates: number;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    info: {
      totalRates: number;
      dateRange: {
        start: string;
        end: string;
      };
    };
  }
  
  export interface ProcessingOptions {
    validate?: boolean;
    backup?: boolean;
    force?: boolean;
  }
  
  export interface ProcessingResult {
    success: boolean;
    processedQuarters: number;
    totalRates: number;
    errors: Error[];
    backupPath?: string;
  }
  
  export type StorageData = {
    rates: Record<string, ExchangeRate>;
    metadata: {
      lastUpdate: string;
      version: string;
    };
  };
  
  // エラー通知関連の型
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
  
  // JSON値の型（ユーティリティ）
  export type JSONValue = 
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };