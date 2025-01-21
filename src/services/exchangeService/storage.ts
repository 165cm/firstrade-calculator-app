// src/services/exchangeService/storage.ts
import { createHash } from 'crypto';
import { format, endOfQuarter } from 'date-fns';
import path from 'path';
import fs from 'fs/promises';
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

interface ChecksumRecord {
  [key: string]: string;  // 形式: "2024Q1": "hash..."
}

export class ExchangeStorageService {
  private readonly CURRENT_PATH = 'src/data/current';
  private readonly HISTORICAL_PATH = 'src/data/historical';

  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private getCurrentQuarterFileName(): string {
    const now = new Date();
    const quarter = Math.floor((now.getMonth() / 3)) + 1;
    return `${now.getFullYear()}Q${quarter}.json`;
  }

  private async writeJSON<T extends JsonObject>(filePath: string, data: T): Promise<void> {
    await this.ensureDirectory(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private async readJSON<T extends JsonObject>(filePath: string): Promise<T | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  private async writeQuarterData(filePath: string, data: QuarterData): Promise<void> {
    await this.ensureDirectory(path.dirname(filePath));
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

  private calculateHash(data: QuarterData): string {
    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private async updateChecksum(
    quarter: string,
    year: string,
    hash: string
  ): Promise<void> {
    const checksumPath = path.join(this.HISTORICAL_PATH, 'checksum.json');
    const current = await this.readJSON<ChecksumRecord>(checksumPath) || {};
    current[`${year}Q${quarter}`] = hash;
    await this.writeJSON(checksumPath, current);
  }

  private async moveToHistorical(
    data: QuarterData,
    quarter: string,
    year: string,
    hash: string
  ): Promise<void> {
    const yearDir = path.join(this.HISTORICAL_PATH, year);
    await this.ensureDirectory(yearDir);
    await this.writeQuarterData(
      path.join(yearDir, `Q${quarter}.json`),
      { ...data, hash }
    );
  }

  async saveRate(rate: ExchangeRate): Promise<void> {
    const currentData: QuarterData = await this.readCurrentQuarter() || {
      startDate: format(new Date(), 'yyyy-MM-01'),
      endDate: format(endOfQuarter(new Date()), 'yyyy-MM-dd'),
      rates: {},
      hash: ''
    };
    
    currentData.rates[rate.date] = rate;
    await this.saveCurrentQuarter(currentData);
    
    await this.writeJSON<LastUpdateData>(
      path.join(this.CURRENT_PATH, 'last_update.json'),
      { lastUpdate: new Date().toISOString() }
    );
  }

  async saveCurrentQuarter(data: QuarterData): Promise<void> {
    const quarterFile = this.getCurrentQuarterFileName();
    await this.writeQuarterData(path.join(this.CURRENT_PATH, quarterFile), data);
  }

  async readCurrentQuarter(): Promise<QuarterData | null> {
    const quarterFile = this.getCurrentQuarterFileName();
    return this.readQuarterData(path.join(this.CURRENT_PATH, quarterFile));
  }

  async getLastUpdateDate(): Promise<Date> {
    const meta = await this.readJSON<LastUpdateData>(
      path.join(this.CURRENT_PATH, 'last_update.json')
    ) || { lastUpdate: new Date(0).toISOString() };
    return new Date(meta.lastUpdate);
  }

  async finalizeQuarter(
    quarter: string,
    year: string
  ): Promise<void> {
    const currentData = await this.readCurrentQuarter();
    if (!currentData) {
      throw new Error('No current quarter data found');
    }
    
    const hash = this.calculateHash(currentData);
    await this.moveToHistorical(currentData, quarter, year, hash);
    await this.updateChecksum(quarter, year, hash);
    
    // 新しい四半期のデータを初期化
    const newQuarter: QuarterData = {
      startDate: format(new Date(), 'yyyy-MM-01'),
      endDate: format(endOfQuarter(new Date()), 'yyyy-MM-dd'),
      rates: {},
      hash: ''
    };
    await this.saveCurrentQuarter(newQuarter);
  }

  // 整合性チェック用のメソッド
  async verifyHistoricalData(year: string, quarter: string): Promise<boolean> {
    const filePath = path.join(this.HISTORICAL_PATH, year, `Q${quarter}.json`);
    const data = await this.readQuarterData(filePath);
    if (!data) return false;

    const calculatedHash = this.calculateHash(data);
    const checksumPath = path.join(this.HISTORICAL_PATH, 'checksum.json');
    const checksums = await this.readJSON<ChecksumRecord>(checksumPath);
    if (!checksums) return false;

    const storedHash = checksums[`${year}Q${quarter}`];
    return calculatedHash === storedHash;
  }
}