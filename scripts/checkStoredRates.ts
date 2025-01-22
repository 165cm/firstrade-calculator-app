// scripts/checkStoredRates.ts
import { fileURLToPath } from 'url';
import * as utils from '../src/utils/exchangeUtils.js';
import type { QuarterData } from '../src/services/exchangeService/types.js';

export async function checkStoredRates() {
  try {
    // チェックサムの確認
    const checksums = await utils.readJsonFile<Record<string, string>>(utils.PATHS.CHECKSUM);
    console.log('チェックサム:', checksums);

    // 現在の四半期データの確認
    const currentFiles = await utils.readDirectory(utils.PATHS.CURRENT);
    console.log('\n現在の四半期データ:');
    for (const file of currentFiles) {
      if (file.endsWith('.json')) {
        const data = await utils.readJsonFile<QuarterData>(utils.getFilePath(utils.PATHS.CURRENT, file));
        if (!data) continue;

        const rateCount = Object.keys(data.rates || {}).length;
        console.log(`${file}:`, {
          期間: `${data.startDate} から ${data.endDate}`,
          レート数: rateCount,
          ハッシュ: data.hash ?? 'N/A'
        });
      }
    }

    // 過去データの確認
    console.log('\n過去データ:');
    const years = await utils.readDirectory(utils.PATHS.HISTORICAL);
    for (const year of years.filter((y: string) => !y.endsWith('.json'))) {
      const yearDir = utils.getFilePath(utils.PATHS.HISTORICAL, year);
      const quarters = await utils.readDirectory(yearDir);
      
      console.log(`\n${year}年:`);
      for (const quarter of quarters.filter((q: string) => q.endsWith('.json'))) {
        const data = await utils.readJsonFile<QuarterData>(utils.getFilePath(yearDir, quarter));
        if (!data) continue;

        const rateCount = Object.keys(data.rates || {}).length;
        console.log(`  ${quarter}:`, {
          期間: `${data.startDate} から ${data.endDate}`,
          レート数: rateCount,
          ハッシュ: data.hash ?? 'N/A'
        });
      }
    }

    return {
      success: true,
      message: 'データチェック完了'
    };
  } catch (error) {
    console.error('データチェック中にエラーが発生:', error);
    throw error;
  }
}

// スクリプトの直接実行の場合
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  checkStoredRates().catch(error => {
    console.error('スクリプト実行エラー:', error);
    process.exit(1);
  });
}