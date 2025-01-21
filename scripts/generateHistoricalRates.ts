// scripts/generateHistoricalRates.ts
import { generateYearTemplate } from '../src/data/rates/yearData.js';  // .js 拡張子を追加
import fs from 'fs/promises';  // Promise ベースの fs を使用
import path from 'path';

const START_YEAR = 2020;
const END_YEAR = 2024;
const BASE_RATES = {
  2020: 108.0,
  2021: 115.0,
  2022: 125.0,
  2023: 135.0,
  2024: 145.0,
} as const;

async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function generateRateFiles() {
  const ratesDir = path.join(__dirname, '../src/data/rates');
  
  // ディレクトリの存在確認と作成
  await ensureDirectory(ratesDir);

  try {
    // 年ごとのファイル生成
    for (let year = START_YEAR; year <= END_YEAR; year++) {
      const monthKey = `${year}` as unknown as keyof typeof BASE_RATES;
      const yearData = generateYearTemplate(year, BASE_RATES[monthKey]);
      const filePath = path.join(ratesDir, `${year}.ts`);
      
      const fileContent = `// src/data/rates/${year}.ts
import type { YearlyRates } from './yearData';

export const rates${year}: YearlyRates = ${JSON.stringify(yearData, null, 2)};
`;
      await fs.writeFile(filePath, fileContent);
      console.log(`Generated rates for ${year}`);
    }

    // index.ts の生成
    const indexPath = path.join(ratesDir, 'index.ts');
    const imports = Array.from(
      { length: END_YEAR - START_YEAR + 1 },
      (_, i) => START_YEAR + i
    ).map(year => `import { rates${year} } from './${year}';`);

    const exports = Array.from(
      { length: END_YEAR - START_YEAR + 1 },
      (_, i) => `rates${START_YEAR + i}`
    );

    const indexContent = `// src/data/rates/index.ts
${imports.join('\n')}

export {
  ${exports.join(',\n  ')}
};
`;
    await fs.writeFile(indexPath, indexContent);
    console.log('Generated index.ts');

  } catch (error) {
    console.error('Error generating rate files:', error);
    process.exit(1);
  }
}

// スクリプトの実行
generateRateFiles().catch(error => {
  console.error('Failed to generate rate files:', error);
  process.exit(1);
});