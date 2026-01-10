// scripts/update-exchange-rates.mjs
// 為替レートを自動更新するスクリプト（毎週土曜実行）

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://api.frankfurter.app';
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const CURRENT_DIR = path.join(DATA_DIR, 'current');
const HISTORICAL_DIR = path.join(DATA_DIR, 'historical');

// 四半期情報を取得
function getQuarterInfo(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const quarter = Math.floor(month / 3) + 1;

    const quarterStartMonth = (quarter - 1) * 3;
    const startDate = new Date(year, quarterStartMonth, 1);
    const endDate = new Date(year, quarterStartMonth + 3, 0); // 四半期最終日

    return {
        year,
        quarter,
        quarterName: `Q${quarter}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    };
}

// レートを取得
async function fetchRates(startDate, endDate) {
    const url = `${BASE_URL}/${startDate}..${endDate}?from=USD&to=JPY`;
    console.log(`取得中: ${startDate} ~ ${endDate}`);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.rates || {};
}

// 土日のレートを直前の営業日から埋める
function fillWeekends(rates, startDate, endDate) {
    const filledRates = { ...rates };
    const start = new Date(startDate);
    const end = new Date(endDate);

    // ソートして最初のレートを取得
    const sortedDates = Object.keys(rates).sort();
    if (sortedDates.length === 0) return filledRates;

    let lastRate = rates[sortedDates[0]]?.JPY || rates[sortedDates[0]];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];

        if (rates[dateStr]) {
            lastRate = rates[dateStr].JPY || rates[dateStr];
        } else if (lastRate) {
            filledRates[dateStr] = { JPY: lastRate };
        }
    }

    return filledRates;
}

// JSONファイルを読み込み
function readQuarterFile(filePath) {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
}

// JSONファイルに保存
function writeQuarterFile(filePath, data) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`保存完了: ${filePath}`);
}

// 四半期データを更新
async function updateQuarter(quarterInfo, fromDate, toDate) {
    const { year, quarterName, startDate, endDate } = quarterInfo;

    const currentPath = path.join(CURRENT_DIR, `${year}${quarterName}.json`);
    const historicalPath = path.join(HISTORICAL_DIR, String(year), `${quarterName}.json`);

    console.log(`\n=== ${year} ${quarterName} (${fromDate} ~ ${toDate}) ===`);

    // APIからレートを取得
    const apiRates = await fetchRates(fromDate, toDate);
    const filledRates = fillWeekends(apiRates, fromDate, toDate);

    // 既存データを読み込み
    let existingData = readQuarterFile(currentPath) || readQuarterFile(historicalPath);

    // 新規または既存データにマージ
    const quarterData = existingData || {
        startDate,
        endDate,
        rates: {},
        hash: ''
    };

    // レートをマージ
    let addedCount = 0;
    for (const [date, rateObj] of Object.entries(filledRates)) {
        const jpyRate = rateObj.JPY || rateObj;
        if (!quarterData.rates[date]) {
            addedCount++;
        }
        quarterData.rates[date] = {
            date,
            rate: { JPY: jpyRate },
            source: 'Frankfurter',
            timestamp: Date.now()
        };
    }

    // 日付順にソート
    const sortedRates = {};
    Object.keys(quarterData.rates).sort().forEach(key => {
        sortedRates[key] = quarterData.rates[key];
    });
    quarterData.rates = sortedRates;

    // historical フォルダに保存
    writeQuarterFile(historicalPath, quarterData);

    // current フォルダにも保存
    writeQuarterFile(currentPath, quarterData);

    console.log(`${addedCount} 日分の新規データを追加`);

    return addedCount;
}

// 最新の保存済み日付を取得
function getLatestStoredDate(quarterInfo) {
    const { year, quarterName } = quarterInfo;
    const currentPath = path.join(CURRENT_DIR, `${year}${quarterName}.json`);
    const historicalPath = path.join(HISTORICAL_DIR, String(year), `${quarterName}.json`);

    const data = readQuarterFile(currentPath) || readQuarterFile(historicalPath);
    if (!data || !data.rates) return null;

    const dates = Object.keys(data.rates).sort();
    return dates.length > 0 ? dates[dates.length - 1] : null;
}

// メイン処理
async function main() {
    console.log('為替レート週次更新スクリプト開始');
    console.log('======================================');
    console.log(`実行日時: ${new Date().toISOString()}\n`);

    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // 現在の四半期情報
        const currentQuarter = getQuarterInfo(today);

        // 最新の保存済み日付を取得
        let latestDate = getLatestStoredDate(currentQuarter);

        if (!latestDate) {
            // データがない場合は四半期開始日から
            latestDate = currentQuarter.startDate;
        }

        // 翌日から昨日までのデータを取得
        const fromDate = new Date(latestDate);
        fromDate.setDate(fromDate.getDate() + 1);
        const fromDateStr = fromDate.toISOString().split('T')[0];
        const toDateStr = yesterday.toISOString().split('T')[0];

        if (fromDateStr > toDateStr) {
            console.log('新しいデータはありません（既に最新です）');
            return;
        }

        // 現在の四半期を更新
        await updateQuarter(currentQuarter, fromDateStr, toDateStr);

        // last_update.json を更新
        const lastUpdatePath = path.join(CURRENT_DIR, 'last_update.json');
        writeQuarterFile(lastUpdatePath, {
            lastUpdate: new Date().toISOString(),
            source: 'frankfurter',
            quarter: `${currentQuarter.year}${currentQuarter.quarterName}`
        });

        console.log('\n======================================');
        console.log('✅ 為替レート更新が完了しました');

    } catch (error) {
        console.error('エラー発生:', error);
        process.exit(1);
    }
}

main();
