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
    const year = date.getUTCFullYear();
    const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
    return getQuarterInfoOf(year, quarter);
}

function getQuarterInfoOf(year, quarter) {
    const quarterStartMonth = (quarter - 1) * 3;
    const startDate = new Date(Date.UTC(year, quarterStartMonth, 1));
    const endDate = new Date(Date.UTC(year, quarterStartMonth + 3, 0)); // 四半期最終日

    return {
        year,
        quarter,
        quarterName: `Q${quarter}`,
        startDate: toDateStr(startDate),
        endDate: toDateStr(endDate)
    };
}

function toDateStr(date) {
    return date.toISOString().split('T')[0];
}

function addDays(dateStr, days) {
    const date = new Date(`${dateStr}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return toDateStr(date);
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

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
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
    // 開始日が休日の場合も直前の営業日のレートで埋められるよう、少し前から取得する
    const fetchFrom = addDays(fromDate, -7);
    const apiRates = await fetchRates(fetchFrom, toDate);
    const filledRates = Object.fromEntries(
        Object.entries(fillWeekends(apiRates, fetchFrom, toDate))
            .filter(([date]) => date >= fromDate && date <= toDate)
    );

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

// 四半期内の保存済み日付の範囲を取得
function getStoredRange(quarterInfo) {
    const { year, quarterName, startDate, endDate } = quarterInfo;
    const currentPath = path.join(CURRENT_DIR, `${year}${quarterName}.json`);
    const historicalPath = path.join(HISTORICAL_DIR, String(year), `${quarterName}.json`);

    const data = readQuarterFile(currentPath) || readQuarterFile(historicalPath);
    if (!data || !data.rates) return null;

    const dates = Object.keys(data.rates).filter(date => date >= startDate && date <= endDate).sort();
    return dates.length > 0 ? { first: dates[0], last: dates[dates.length - 1] } : null;
}

// 確認対象の四半期（バックフィル開始日の四半期から今の四半期まで）
function listQuarters(fromDateStr, today) {
    const quarters = [];
    let { year, quarter } = getQuarterInfo(new Date(`${fromDateStr}T00:00:00Z`));
    const current = getQuarterInfo(today);
    while (year < current.year || (year === current.year && quarter <= current.quarter)) {
        quarters.push(getQuarterInfoOf(year, quarter));
        quarter++;
        if (quarter > 4) {
            quarter = 1;
            year++;
        }
    }
    return quarters;
}

// メイン処理
// 各四半期の欠けている期間（四半期の初め・終わり）を取得して埋める
// 週1回の実行のため、四半期の変わり目の数日分も前の四半期として取りこぼさないようにする
async function main() {
    console.log('為替レート週次更新スクリプト開始');
    console.log('======================================');
    console.log(`実行日時: ${new Date().toISOString()}\n`);

    try {
        const today = new Date();
        const yesterdayStr = addDays(toDateStr(today), -1);

        // 既定では前年の1月1日以降（申告対象の年と今年）を確認する
        const backfillFrom = process.env.RATES_BACKFILL_FROM || `${today.getUTCFullYear() - 1}-01-01`;
        const quarters = listQuarters(backfillFrom, today);

        let updatedQuarter = null;
        for (const quarterInfo of quarters) {
            const targetEnd = quarterInfo.endDate < yesterdayStr ? quarterInfo.endDate : yesterdayStr;
            if (targetEnd < quarterInfo.startDate) continue;

            const stored = getStoredRange(quarterInfo);
            let fromDateStr;
            if (!stored || stored.first > quarterInfo.startDate) {
                // データがない、または四半期の初めが欠けている場合は四半期の初日から
                fromDateStr = quarterInfo.startDate;
            } else {
                fromDateStr = addDays(stored.last, 1);
            }

            if (fromDateStr > targetEnd) continue;

            await updateQuarter(quarterInfo, fromDateStr, targetEnd);
            updatedQuarter = quarterInfo;
        }

        if (!updatedQuarter) {
            console.log('新しいデータはありません（既に最新です）');
            return;
        }

        // last_update.json を更新
        const currentQuarter = getQuarterInfo(today);
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
