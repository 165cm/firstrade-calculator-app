// scripts/utils/exchangeUtils.ts
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import type { QuarterData } from '../types/exchange';
import crypto from 'crypto';

// ESM環境でのパス解決のためのセットアップ
const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.join(path.dirname(__filename), '..', '..');

// 定数定義
export const PATHS = {
  PUBLIC: path.join(projectRoot, 'public'),
  DATA: path.join(projectRoot, 'public', 'data'),
  HISTORICAL: path.join(projectRoot, 'public', 'data', 'historical'),
  CURRENT: path.join(projectRoot, 'public', 'data', 'current'),
  CHECKSUM: path.join(projectRoot, 'public', 'data', 'checksum.json')
} as const;

export interface QuarterInfo {
  year: number;
  quarter: number;
  path: string;
  isCurrent: boolean;
}

/**
 * ディレクトリの存在確認と作成
 */
export async function ensureDirectory(dir: string): Promise<void> {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * すべての必要なディレクトリを作成
 */
export async function ensureDirectories(): Promise<void> {
  await Promise.all([
    ensureDirectory(PATHS.PUBLIC),
    ensureDirectory(PATHS.DATA),
    ensureDirectory(PATHS.HISTORICAL),
    ensureDirectory(PATHS.CURRENT)
  ]);
}

/**
 * 日付から四半期情報を取得
 */
export function getQuarterInfo(date: Date): QuarterInfo {
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  const currentDate = new Date();
  const isCurrent = year === currentDate.getFullYear() && 
                   quarter === Math.floor(currentDate.getMonth() / 3) + 1;

  const basePath = isCurrent ? PATHS.CURRENT : PATHS.HISTORICAL;
  const filePath = isCurrent
    ? path.join(basePath, `${year}Q${quarter}.json`)
    : path.join(basePath, String(year), `Q${quarter}.json`);

  return {
    year,
    quarter,
    path: filePath,
    isCurrent
  };
}

/**
 * データのハッシュ値を計算
 */
export function calculateHash(data: QuarterData): string {
  const content = JSON.stringify({
    startDate: data.startDate,
    endDate: data.endDate,
    rates: data.rates
  });
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * JSONファイルの読み込み
 */
export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * JSONファイルの書き込み
 */
export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * チェックサムの更新
 */
export async function updateChecksum(key: string, hash: string): Promise<void> {
  let checksums: Record<string, string> = {};
  
  try {
    checksums = (await readJsonFile(PATHS.CHECKSUM)) || {};
  } catch {
    // チェックサムファイルが存在しない場合は新規作成
  }

  checksums[key] = hash;
  await writeJsonFile(PATHS.CHECKSUM, checksums);
}

/**
 * データの検証
 */
export function validateQuarterData(data: QuarterData): boolean {
  if (!data.startDate || !data.endDate || !data.rates) return false;
  
  try {
    new Date(data.startDate);
    new Date(data.endDate);
    return Object.keys(data.rates).length > 0;
  } catch {
    return false;
  }
}

export interface ProcessingOptions {
    validate?: boolean;
    backup?: boolean;
    force?: boolean;
  }
  
  // 追加する関数
  export async function readDirectory(dir: string): Promise<string[]> {
    try {
      return await fs.readdir(dir);
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
      return [];
    }
  }
  
  export function getFilePath(...paths: string[]): string {
    return path.join(...paths);
  }