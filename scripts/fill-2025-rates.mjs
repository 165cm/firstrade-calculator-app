// scripts/fill-2025-rates.mjs
// 2025年の欠落した為替レートデータを Frankfurter API から取得して補完するスクリプト

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://api.frankfurter.app';

// 四半期の日付範囲
const QUARTERS = {
    Q1: { start: '2025-01-23', end: '2025-03-31' }, // 1月22日までは既存データあり
    Q2: { start: '2025-04-01', end: '2025-06-30' },
    Q3: { start: '2025-07-01', end: '2025-09-30' },
};

// レートを取得
async function fetchRates(startDate, endDate) {
    const url = `${BASE_URL}/${startDate}..${endDate}?from=USD&to=JPY`;
    console.log(`取得中: ${startDate} ~ ${endDate}`);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.rates; // { "2025-01-23": { "JPY": 156.xx }, ... }
}

// 土日のレートを直前の営業日から埋める
function fillWeekends(rates) {
    const sortedDates = Object.keys(rates).sort();
    const filledRates = { ...rates };

    if (sortedDates.length === 0) return filledRates;

    const startDate = new Date(sortedDates[0]);
    const endDate = new Date(sortedDates[sortedDates.length - 1]);

    let lastRate = rates[sortedDates[0]].JPY;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];

        if (rates[dateStr] && rates[dateStr].JPY) {
            lastRate = rates[dateStr].JPY;
        } else {
            // 土日や祝日などデータがない場合、直前のレートを使用
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
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`保存完了: ${filePath}`);
}

// 四半期データを更新
async function updateQuarter(quarterName, startDate, endDate) {
    const year = startDate.substring(0, 4);
    const currentPath = path.join(__dirname, '..', 'public', 'data', 'current', `${year}${quarterName}.json`);
    const historicalDir = path.join(__dirname, '..', 'public', 'data', 'historical', year);
    const historicalPath = path.join(historicalDir, `${quarterName}.json`);

    console.log(`\n=== ${year} ${quarterName} ===`);

    // APIからレートを取得
    const apiRates = await fetchRates(startDate, endDate);
    const filledRates = fillWeekends(apiRates);

    // 既存データを読み込み
    let existingData = readQuarterFile(currentPath) || readQuarterFile(historicalPath);

    // 四半期の開始・終了日を計算
    const quarterStartDate = quarterName === 'Q1' ? '2025-01-01' :
        quarterName === 'Q2' ? '2025-04-01' :
            quarterName === 'Q3' ? '2025-07-01' : '2025-10-01';
    const quarterEndDate = quarterName === 'Q1' ? '2025-03-31' :
        quarterName === 'Q2' ? '2025-06-30' :
            quarterName === 'Q3' ? '2025-09-30' : '2025-12-31';

    // 新規または既存データにマージ
    const quarterData = existingData || {
        startDate: quarterStartDate,
        endDate: quarterEndDate,
        rates: {},
        hash: ''
    };

    // レートをマージ
    for (const [date, rateObj] of Object.entries(filledRates)) {
        const jpyRate = rateObj.JPY;
        quarterData.rates[date] = {
            date: date,
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
    if (!fs.existsSync(historicalDir)) {
        fs.mkdirSync(historicalDir, { recursive: true });
    }
    writeQuarterFile(historicalPath, quarterData);

    // current フォルダにも保存（Q1の場合は既存ファイルを更新）
    if (quarterName === 'Q1') {
        writeQuarterFile(currentPath, quarterData);
    }

    console.log(`${Object.keys(filledRates).length} 日分のデータを追加`);
}

// メイン処理
async function main() {
    console.log('2025年 為替レート補完スクリプト開始');
    console.log('======================================\n');

    try {
        for (const [quarterName, dates] of Object.entries(QUARTERS)) {
            await updateQuarter(quarterName, dates.start, dates.end);
            // APIレート制限対策
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('\n======================================');
        console.log('✅ 全ての四半期のデータ補完が完了しました');
    } catch (error) {
        console.error('エラー発生:', error);
        process.exit(1);
    }
}

main();
