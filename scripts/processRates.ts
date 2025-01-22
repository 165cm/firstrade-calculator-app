// scripts/processRates.ts
import { fileURLToPath } from 'url';
import { RateSplitter } from '../src/utils/rateSplitter.js';
import type { QuarterData } from '../src/services/exchangeService/types.js';
import * as utils from '../src/utils/exchangeUtils.js';

export type ProcessOptions = Pick<utils.ProcessingOptions, 'validate'>;

export async function processRates(options: ProcessOptions = {}) {
  try {
    const { validate = true } = options;

    // 必要なディレクトリの作成
    await utils.ensureDirectories();

    // 元データの読み込み
    console.log('Reading source data...');
    const sourceData = await utils.readJsonFile<QuarterData>(utils.PATHS.CURRENT);

    if (!sourceData) {
      throw new Error('Source data not found');
    }

    // データの分割
    console.log('Splitting data by quarter...');
    const splitResults = RateSplitter.splitByQuarter(sourceData);

    // 分割データの保存
    console.log('Saving split data...');
    const processedQuarters: string[] = [];

    for (const result of splitResults) {
      // データの検証
      if (validate && !utils.validateQuarterData(result.data)) {
        console.warn(`Invalid data for ${result.year}Q${result.quarter}`);
        continue;
      }

      // データの保存
      // 日付の計算を明示的に数値型で行う
      const year = Number(result.year);
      const quarter = Number(result.quarter);
      const quarterDate = new Date(year, (quarter - 1) * 3, 1);
      const quarterInfo = utils.getQuarterInfo(quarterDate);
      
      await utils.writeJsonFile(quarterInfo.path, result.data);
      await utils.updateChecksum(`${year}Q${quarter}`, result.data.hash);
      
      processedQuarters.push(`${year}Q${quarter}`);
      console.log(`Processed ${year}Q${quarter}`);
    }

    console.log('Data processing completed successfully!');
    return {
      success: true,
      processedQuarters,
      totalRates: splitResults.reduce((sum, result) => 
        sum + (result.data.rates ? Object.keys(result.data.rates).length : 0), 
        0
      )
    };
  } catch (error) {
    console.error('Error processing data:', error);
    throw error;
  }
}

// スクリプトの直接実行の場合
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  processRates().catch(error => {
    console.error('Script execution error:', error);
    process.exit(1);
  });
}