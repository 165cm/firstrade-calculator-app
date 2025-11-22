// scripts/fetchRates.js
// 為替レート取得スクリプト

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

// 既存データを読み込み
function loadExistingData(outputPath) {
  if (fs.existsSync(outputPath)) {
    const content = fs.readFileSync(outputPath, 'utf-8');
    return JSON.parse(content);
  }
  return null;
}

// データを保存
function saveQuarterData(year, quarter, data, forceOverwrite = false) {
  const dates = getQuarterDates(year, quarter);

  // 保存先を決定
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const isCurrent = year === currentYear && quarter === currentQuarter;

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

  // 既存データを読み込み
  const existingData = loadExistingData(outputPath);

  // 新しいレートデータを変換
  const newRates = {};
  for (const [date, rateData] of Object.entries(data.rates)) {
    newRates[date] = {
      date,
      rate: rateData,
      source: 'frankfurter',
      timestamp: Date.now()
    };
  }

  // マージまたは上書き
  let finalRates;
  if (forceOverwrite || !existingData) {
    // 上書きモード or 既存データなし
    finalRates = newRates;
    console.log(`モード: ${forceOverwrite ? '上書き' : '新規作成'}`);
  } else {
    // 追記モード: 既存データに新しいデータをマージ（新しいデータ優先）
    finalRates = { ...existingData.rates, ...newRates };
    const existingCount = Object.keys(existingData.rates).length;
    const newCount = Object.keys(newRates).length;
    const finalCount = Object.keys(finalRates).length;
    console.log(`モード: 追記（既存${existingCount}件 + 新規${newCount}件 = ${finalCount}件）`);
  }

  const quarterData = {
    startDate: dates.start,
    endDate: dates.end,
    rates: finalRates,
    hash: `${year}Q${quarter}-${Date.now()}`
  };

  fs.writeFileSync(outputPath, JSON.stringify(quarterData, null, 2));
  console.log(`保存完了: ${outputPath} (${Object.keys(finalRates).length}件)`);

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
  let forceOverwrite = false;

  // 引数の解析
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--force' || args[i] === '-f') {
      forceOverwrite = true;
    } else if (i === 0 && !args[i].startsWith('-')) {
      year = parseInt(args[i]);
    } else if (i === 1 && !args[i].startsWith('-')) {
      quarter = parseInt(args[i]);
    }
  }

  console.log(`\n📊 為替レート取得: ${year}年Q${quarter}`);
  console.log(`   上書きモード: ${forceOverwrite ? 'ON' : 'OFF'}\n`);

  try {
    const dates = getQuarterDates(year, quarter);

    // 未来の日付は今日までに制限
    const today = new Date().toISOString().split('T')[0];
    const endDate = dates.end > today ? today : dates.end;

    const data = await fetchRates(dates.start, endDate);
    saveQuarterData(year, quarter, data, forceOverwrite);

    console.log('\n✅ 完了！\n');
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    process.exit(1);
  }
}

main();
