// src/services/exchangeService/storage.ts
import { createHash } from 'crypto';
import { format, endOfQuarter } from 'date-fns';
import fs from 'fs/promises';
import { join } from 'path';
import type { QuarterData, ExchangeRate } from './types';

// JSONデータの基本型定義
type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

interface LastUpdateData extends JsonObject {
  lastUpdate: string;
}

export class ExchangeStorageService {
  private readonly BASE_PATH: string;
  private readonly CURRENT_PATH: string;
  private readonly HISTORICAL_PATH: string;

  constructor() {
    this.BASE_PATH = 'src/data';
    this.CURRENT_PATH = join(this.BASE_PATH, 'current');
    this.HISTORICAL_PATH = join(this.BASE_PATH, 'historical');
  }

  // ディレクトリ作成メソッド
  private async ensureDirectories(): Promise<void> {
    try {
      for (const dir of [this.BASE_PATH, this.CURRENT_PATH, this.HISTORICAL_PATH]) {
        await fs.mkdir(dir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create directories:', error);
      throw new Error(`Failed to create directories: ${error}`);
    }
  }

  // JSON読み書きのヘルパーメソッド
  private async writeJSON<T extends JsonObject>(filePath: string, data: T): Promise<void> {
    await this.ensureDirectories();  // ensureDirectory から ensureDirectories に変更
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private async readJSON<T extends JsonObject>(filePath: string): Promise<T | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch {  // error パラメータを削除
      return null;
    }
  }

  // 四半期データの読み書き
  private async writeQuarterData(filePath: string, data: QuarterData): Promise<void> {
    await this.ensureDirectories();  // ensureDirectory から ensureDirectories に変更
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private async readQuarterData(filePath: string): Promise<QuarterData | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as QuarterData;
    } catch {
      return null;
    }
  }

  // 四半期ファイル名の取得
  private getCurrentQuarterFileName(): string {
    const now = new Date();
    const quarter = Math.floor((now.getMonth() / 3)) + 1;
    return `${now.getFullYear()}Q${quarter}.json`;
  }

  // ハッシュ計算
  private calculateHash(data: QuarterData): string {
    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  // 公開メソッド
  async saveRate(rate: ExchangeRate): Promise<void> {
    try {
      await this.ensureDirectories();

      const currentData: QuarterData = await this.readCurrentQuarter() || {
        startDate: format(new Date(), 'yyyy-MM-01'),
        endDate: format(endOfQuarter(new Date()), 'yyyy-MM-dd'),
        rates: {},
        hash: ''
      };

      currentData.rates[rate.date] = rate;
      
      const quarterFile = this.getCurrentQuarterFileName();
      const quarterPath = join(this.CURRENT_PATH, quarterFile);
      await this.writeQuarterData(quarterPath, currentData);

      const lastUpdatePath = join(this.CURRENT_PATH, 'last_update.json');
      await this.writeJSON<LastUpdateData>(lastUpdatePath, {
        lastUpdate: new Date().toISOString()
      });

      console.log('Data saved:', {
        path: quarterPath,
        date: rate.date,
        rate: rate.rate
      });

    } catch (error) {
      console.error('Failed to save rate:', error);
      throw error;
    }
  }

  async getLastUpdateDate(): Promise<Date> {
    const meta = await this.readJSON<LastUpdateData>(
      join(this.CURRENT_PATH, 'last_update.json')
    ) || { lastUpdate: new Date(0).toISOString() };
    return new Date(meta.lastUpdate);
  }

  async readCurrentQuarter(): Promise<QuarterData | null> {
    const quarterFile = this.getCurrentQuarterFileName();
    return this.readQuarterData(join(this.CURRENT_PATH, quarterFile));
  }

  async finalizeQuarter(quarter: string, year: string): Promise<void> {
    const currentData = await this.readCurrentQuarter();
    if (!currentData) {
      throw new Error('No current quarter data found');
    }

    const hash = this.calculateHash(currentData);
    
    // 履歴データに移動
    const yearDir = join(this.HISTORICAL_PATH, year);
    await this.ensureDirectories();
    await this.writeQuarterData(
      join(yearDir, `Q${quarter}.json`),
      { ...currentData, hash }
    );

    // 新しい四半期のデータを初期化
    const newQuarter: QuarterData = {
      startDate: format(new Date(), 'yyyy-MM-01'),
      endDate: format(endOfQuarter(new Date()), 'yyyy-MM-dd'),
      rates: {},
      hash: ''
    };
    
    const quarterFile = this.getCurrentQuarterFileName();
    await this.writeQuarterData(join(this.CURRENT_PATH, quarterFile), newQuarter);
  }
}