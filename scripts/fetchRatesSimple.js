// scripts/fetchRatesSimple.js
// Windows対応：為替レート取得スクリプト

const fs = require('fs');
const path = require('path');

// 設定
const BASE_URL = 'https://api.frankfurter.app';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');

// 四半期の開始日・終了日を計算
function getQuarterDates(year, quarter) {
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;

  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, endMonth + 1, 0); // 月末

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
}

// Frankfurter APIから為替レートを取得
async function fetchRates(startDate, endDate) {
  const url = `${BASE_URL}/${startDate}..${endDate}?from=USD&to=JPY`;
  console.log(`取得中: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// データを保存
function saveQuarterData(year, quarter, data) {
  const dates = getQuarterDates(year, quarter);

  // レートデータを変換
  const rates = {};
  for (const [date, rateData] of Object.entries(data.rates)) {
    rates[date] = {
      date,
      rate: rateData,
      source: 'frankfurter',
      timestamp: Date.now()
    };
  }

  const quarterData = {
    startDate: dates.start,
    endDate: dates.end,
    rates,
    hash: `${year}Q${quarter}-${Date.now()}`
  };

  // 現在の四半期かどうか判定
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const isCurrent = year === currentYear && quarter === currentQuarter;

  // 保存先を決定
  let outputPath;
  if (isCurrent) {
    const currentDir = path.join(OUTPUT_DIR, 'current');
    if (!fs.existsSync(currentDir)) {
      fs.mkdirSync(currentDir, { recursive: true });
    }
    outputPath = path.join(currentDir, `${year}Q${quarter}.json`);
  } else {
    const historicalDir = path.join(OUTPUT_DIR, 'historical', String(year));
    if (!fs.existsSync(historicalDir)) {
      fs.mkdirSync(historicalDir, { recursive: true });
    }
    outputPath = path.join(historicalDir, `Q${quarter}.json`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(quarterData, null, 2));
  console.log(`保存完了: ${outputPath} (${Object.keys(rates).length}件)`);

  // last_update.json を更新
  const currentDir = path.join(OUTPUT_DIR, 'current');
  if (!fs.existsSync(currentDir)) {
    fs.mkdirSync(currentDir, { recursive: true });
  }
  const lastUpdatePath = path.join(currentDir, 'last_update.json');
  const lastUpdate = {
    lastUpdate: new Date().toISOString(),
    source: 'frankfurter',
    quarter: `${year}Q${quarter}`
  };
  fs.writeFileSync(lastUpdatePath, JSON.stringify(lastUpdate, null, 2));
  console.log(`更新日時を記録: ${lastUpdatePath}`);
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);

  // 引数がない場合は現在の四半期を取得
  const now = new Date();
  let year = now.getFullYear();
  let quarter = Math.floor(now.getMonth() / 3) + 1;

  if (args.length >= 2) {
    year = parseInt(args[0]);
    quarter = parseInt(args[1]);
  }

  console.log(`\n📊 為替レート取得: ${year}年Q${quarter}\n`);

  try {
    const dates = getQuarterDates(year, quarter);

    // 未来の日付は今日までに制限
    const today = new Date().toISOString().split('T')[0];
    const endDate = dates.end > today ? today : dates.end;

    const data = await fetchRates(dates.start, endDate);
    saveQuarterData(year, quarter, data);

    console.log('\n✅ 完了！\n');
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    process.exit(1);
  }
}

main();
