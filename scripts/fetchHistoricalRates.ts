// scripts/fetchHistoricalRates.ts
import { format } from 'date-fns';
import { fileURLToPath } from 'url';
import { FrankfurterAPI } from '../src/services/exchangeService/api/frankfurter.js';
import * as utils from '../src/utils/exchangeUtils.js';
import type { QuarterData, ExchangeRate } from '../src/services/exchangeService/types.js';

interface FetchOptions {
  forceUpdate?: boolean;
  delayMs?: number;
}

async function createOrUpdateQuarterData(quarterInfo: utils.QuarterInfo, rateData: ExchangeRate): Promise<void> {
  const filePath = quarterInfo.path;
  
  // 既存のデータを読み込むか、新しいデータを作成
  const existingData = await utils.readJsonFile<QuarterData>(filePath);
  const quarterData: QuarterData = existingData || {
    startDate: format(new Date(quarterInfo.year, (quarterInfo.quarter - 1) * 3, 1), 'yyyy-MM-dd'),
    endDate: format(new Date(quarterInfo.year, quarterInfo.quarter * 3 - 1, 31), 'yyyy-MM-dd'),
    rates: {} as Record<string, ExchangeRate>,
    hash: ''
  };

  // レートデータを更新（型安全な方法で）
  const updatedRates = {
    ...quarterData.rates,
    [rateData.date]: rateData
  };
  quarterData.rates = updatedRates;

  // ハッシュ値を更新
  quarterData.hash = utils.calculateHash(quarterData);

  // データを保存
  await utils.writeJsonFile(filePath, quarterData);
  console.log(`Updated ${quarterInfo.year}Q${quarterInfo.quarter} with rate for ${rateData.date}`);
}

export async function fetchHistoricalRates(
  startDate: Date,
  endDate: Date,
  options: FetchOptions = {}
): Promise<void> {
  const {
    forceUpdate = false,
    delayMs = 1000
  } = options;

  const api = new FrankfurterAPI();

  console.log('為替データ取得開始:', {
    '開始日': format(startDate, 'yyyy-MM-dd'),
    '終了日': format(endDate, 'yyyy-MM-dd'),
    '待機時間': `${delayMs}ms`,
    '強制更新': forceUpdate
  });

  try {
    // 必要なディレクトリを作成
    await utils.ensureDirectories();

    // 四半期ごとにデータを取得
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const quarterInfo = utils.getQuarterInfo(currentDate);
      const formattedDate = format(currentDate, 'yyyy-MM-dd');

      // レート取得
      const rate = await api.fetchRate(formattedDate);
      const rateData: ExchangeRate = {
        date: formattedDate,
        rate: { JPY: rate },
        source: api.getSource(),
        timestamp: Date.now()
      };

      // データを保存
      await createOrUpdateQuarterData(quarterInfo, rateData);
      console.log(`Fetched rate for ${formattedDate}: ¥${rate}`);

      // 次の日に進む
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      
      // API制限対策の待機
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  } catch (error) {
    console.error('Error fetching rates:', error);
    throw error;
  }
}

// スクリプトの直接実行の場合
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // 2024年Q4の更新のため、11月と12月のデータを取得
  const startDate = new Date(2024, 10, 1); // 2024-11-01
  const endDate = new Date(2024, 11, 31);  // 2024-12-31
  
  fetchHistoricalRates(startDate, endDate, {
    forceUpdate: true,
    delayMs: 1000
  }).catch(error => {
    console.error('スクリプト実行エラー:', error);
    process.exit(1);
  });
}