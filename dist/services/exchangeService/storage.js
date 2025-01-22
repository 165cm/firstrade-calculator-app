// src/services/exchangeService/storage.ts
import { createHash } from 'crypto';
import { format, endOfQuarter } from 'date-fns';
import fs from 'fs/promises';
import { join } from 'path';
export class ExchangeStorageService {
    BASE_PATH;
    CURRENT_PATH;
    HISTORICAL_PATH;
    constructor() {
        // パスを public/data に変更
        this.BASE_PATH = 'public/data';
        this.CURRENT_PATH = join(this.BASE_PATH, 'current');
        this.HISTORICAL_PATH = join(this.BASE_PATH, 'historical');
    }
    // ディレクトリ作成メソッド
    async ensureDirectories() {
        try {
            for (const dir of [this.BASE_PATH, this.CURRENT_PATH, this.HISTORICAL_PATH]) {
                await fs.mkdir(dir, { recursive: true });
            }
        }
        catch (error) {
            console.error('Failed to create directories:', error);
            throw new Error(`Failed to create directories: ${error}`);
        }
    }
    // JSON読み書きのヘルパーメソッド
    async writeJSON(filePath, data) {
        await this.ensureDirectories(); // ensureDirectory から ensureDirectories に変更
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }
    async readJSON(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch { // error パラメータを削除
            return null;
        }
    }
    // 四半期データの読み書き
    async writeQuarterData(filePath, data) {
        await this.ensureDirectories(); // ensureDirectory から ensureDirectories に変更
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }
    async readQuarterData(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch {
            return null;
        }
    }
    // 四半期ファイル名の取得
    getCurrentQuarterFileName() {
        const now = new Date();
        const quarter = Math.floor((now.getMonth() / 3)) + 1;
        return `${now.getFullYear()}Q${quarter}.json`;
    }
    // ハッシュ計算
    calculateHash(data) {
        return createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }
    // 公開メソッド
    // saveRate メソッドのログ出力を強化
    async saveRate(rate) {
        try {
            await this.ensureDirectories();
            const currentData = await this.readCurrentQuarter() || {
                startDate: format(new Date(), 'yyyy-MM-01'),
                endDate: format(endOfQuarter(new Date()), 'yyyy-MM-dd'),
                rates: {},
                hash: ''
            };
            currentData.rates[rate.date] = rate;
            const quarterFile = this.getCurrentQuarterFileName();
            const quarterPath = join(this.CURRENT_PATH, quarterFile);
            // 保存前のデータ確認ログ
            console.log('Saving data:', {
                path: quarterPath,
                date: rate.date,
                rate: rate.rate,
                existingDates: Object.keys(currentData.rates).length
            });
            await this.writeQuarterData(quarterPath, currentData);
            // 保存後の確認ログ
            const savedData = await this.readQuarterData(quarterPath);
            console.log('Verification after save:', {
                path: quarterPath,
                savedDate: rate.date,
                dataExists: savedData?.rates[rate.date] !== undefined,
                totalDates: savedData ? Object.keys(savedData.rates).length : 0
            });
        }
        catch (error) {
            console.error('Failed to save rate:', error);
            throw error;
        }
    }
    async getLastUpdateDate() {
        const meta = await this.readJSON(join(this.CURRENT_PATH, 'last_update.json')) || { lastUpdate: new Date(0).toISOString() };
        return new Date(meta.lastUpdate);
    }
    async readCurrentQuarter() {
        const quarterFile = this.getCurrentQuarterFileName();
        return this.readQuarterData(join(this.CURRENT_PATH, quarterFile));
    }
    async finalizeQuarter(quarter, year) {
        const currentData = await this.readCurrentQuarter();
        if (!currentData) {
            throw new Error('No current quarter data found');
        }
        const hash = this.calculateHash(currentData);
        // 履歴データに移動
        const yearDir = join(this.HISTORICAL_PATH, year);
        await this.ensureDirectories();
        await this.writeQuarterData(join(yearDir, `Q${quarter}.json`), { ...currentData, hash });
        // 新しい四半期のデータを初期化
        const newQuarter = {
            startDate: format(new Date(), 'yyyy-MM-01'),
            endDate: format(endOfQuarter(new Date()), 'yyyy-MM-dd'),
            rates: {},
            hash: ''
        };
        const quarterFile = this.getCurrentQuarterFileName();
        await this.writeQuarterData(join(this.CURRENT_PATH, quarterFile), newQuarter);
    }
    async deleteDataAfter(date) {
        console.log('データ削除処理開始:', {
            基準日: date,
            処理時刻: new Date().toISOString()
        });
        const currentData = await this.readCurrentQuarter();
        if (!currentData) {
            console.log('現在のクォーターデータが見つかりません');
            return;
        }
        console.log('現在のデータ状態:', {
            データ件数: Object.keys(currentData.rates).length,
            日付一覧: Object.keys(currentData.rates).sort()
        });
        const filteredRates = Object.entries(currentData.rates).reduce((acc, [key, value]) => {
            if (key <= date) {
                acc[key] = value;
            }
            return acc;
        }, {});
        console.log('データ削除結果:', {
            削除前件数: Object.keys(currentData.rates).length,
            削除後件数: Object.keys(filteredRates).length,
            削除件数: Object.keys(currentData.rates).length - Object.keys(filteredRates).length,
            保持された最終日: Object.keys(filteredRates).sort().pop(),
            削除された日付: Object.keys(currentData.rates)
                .filter(key => key > date)
                .sort()
        });
        currentData.rates = filteredRates;
        const quarterFile = this.getCurrentQuarterFileName();
        const quarterPath = join(this.CURRENT_PATH, quarterFile);
        await this.writeQuarterData(quarterPath, currentData);
    }
    async getLatestDate() {
        const currentData = await this.readCurrentQuarter();
        if (!currentData || Object.keys(currentData.rates).length === 0) {
            return null;
        }
        const dates = Object.keys(currentData.rates).sort();
        return dates[dates.length - 1];
    }
}
