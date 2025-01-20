// scripts/generateHistoricalRates.ts
import { generateYearTemplate } from '../src/data/rates/yearData';
import fs from 'fs';
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

async function generateRateFiles() {
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const monthKey = `${year}` as unknown as keyof typeof BASE_RATES;
    const yearData = generateYearTemplate(year, BASE_RATES[monthKey]);
    const filePath = path.join(__dirname, `../src/data/rates/${year}.ts`);
    
    // TypeScript用の型定義を追加
    const fileContent = `// src/data/rates/${year}.ts
import type { YearlyRates } from './yearData';

export const rates${year}: YearlyRates = ${JSON.stringify(yearData, null, 2)};
`;

    fs.writeFileSync(filePath, fileContent);
    console.log(`Generated rates for ${year}`);
  }

  // index.tsも生成
  const indexPath = path.join(__dirname, '../src/data/rates/index.ts');
  const indexContent = `// src/data/rates/index.ts
${Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i)
  .map(year => `import { rates${year} } from './${year}';`)
  .join('\n')}

export { ${Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => `rates${START_YEAR + i}`).join(', ')} };
`;

  fs.writeFileSync(indexPath, indexContent);
  console.log('Generated index.ts');
}

generateRateFiles();