// scripts/processRates.ts
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { RateSplitter } from '../src/utils/rateSplitter.js';
import type { QuarterData } from '../src/services/exchangeService/types.js';

// ESM環境でのパス解決のためのセットアップ
const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.join(path.dirname(__filename), '..');

// 定数定義
const DATA_DIR = path.join(projectRoot, 'src', 'data');
const HISTORICAL_DIR = path.join(DATA_DIR, 'historical');
const CURRENT_FILE = path.join(DATA_DIR, 'current', '2025Q1.json');

interface ChecksumData {
  [key: string]: string;
}

async function ensureDirectory(dir: string): Promise<void> {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function saveQuarterData(
  year: string,
  quarter: string,
  data: QuarterData
): Promise<void> {
  const yearDir = path.join(HISTORICAL_DIR, year);
  await ensureDirectory(yearDir);
  
  const filePath = path.join(yearDir, `${quarter}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function updateChecksums(
  year: string,
  quarter: string,
  hash: string
): Promise<void> {
  const checksumPath = path.join(HISTORICAL_DIR, 'checksum.json');
  let checksums: ChecksumData = {};
  
  try {
    const content = await fs.readFile(checksumPath, 'utf-8');
    checksums = JSON.parse(content);
  } catch {
    // チェックサムファイルが存在しない場合は新規作成
  }
  
  checksums[`${year}${quarter}`] = hash;
  await fs.writeFile(checksumPath, JSON.stringify(checksums, null, 2));
}

async function main() {
  try {
    // 元データの読み込み
    console.log('Reading source data...');
    const sourceData = JSON.parse(
      await fs.readFile(CURRENT_FILE, 'utf-8')
    ) as QuarterData;

    // データの分割
    console.log('Splitting data by quarter...');
    const splitResults = RateSplitter.splitByQuarter(sourceData);

    // historical ディレクトリの作成
    await ensureDirectory(HISTORICAL_DIR);

    // 分割データの保存
    console.log('Saving split data...');
    for (const result of splitResults) {
      // データの検証
      if (!RateSplitter.validateQuarterData(result.data)) {
        console.warn(`Invalid data for ${result.year}${result.quarter}`);
        continue;
      }

      // データの保存
      await saveQuarterData(result.year, result.quarter, result.data);
      await updateChecksums(result.year, result.quarter, result.data.hash);
      
      console.log(`Processed ${result.year}${result.quarter}`);
    }

    console.log('Data processing completed successfully!');
  } catch (error) {
    console.error('Error processing data:', error);
    process.exit(1);
  }
}

// スクリプトの実行
main().catch(error => {
  console.error('Script execution error:', error);
  process.exit(1);
});