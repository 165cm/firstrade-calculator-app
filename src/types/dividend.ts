// src/types/dividend.ts
export type ActionType = 'DIVIDEND' | 'INTEREST' | 'OTHER' | 'BUY' | 'SELL';

// 基本的な配当データの型
interface BaseDividendRecord {
  Symbol: string;
  TradeDate: string;
  Amount: number;
  Action: string;
  Description: string;
  RecordType: string;
}

// 為替換算済みの配当データの型
export interface ConvertedDividendRecord extends BaseDividendRecord {
  exchangeRate: number;
  amountJPY: number;
}

export type DividendRecord = ConvertedDividendRecord;

// 処理済みの配当データの型
export interface ProcessedDividendData {
  dividends: ConvertedDividendRecord[];
  interest: ConvertedDividendRecord[];
  other: ConvertedDividendRecord[];
}

// CSVから取得した生データの型
export interface RawDividendData {
  Symbol: string;
  TradeDate: string;
  Amount: string | number;
  Description: string;
  Action: ActionType;
  RecordType: string;
}