// scripts/updateAll.ts
import { fileURLToPath } from 'url';
import { ensureDirectories } from '../src/utils/exchangeUtils.js';
import * as fetchHistoricalRates from './fetchHistoricalRates.js';
import * as processRates from './processRates.js';
import * as checkStoredRates from './checkStoredRates.js';

async function main() {
  try {
    console.log('為替レートの更新を開始します...');

    // 1. ディレクトリ構造の確認と作成
    console.log('ディレクトリ構造を確認中...');
    await ensureDirectories();

    // 2. 履歴データの取得
    console.log('履歴データを取得中...');
    await fetchHistoricalRates.fetchHistoricalRates(
      new Date(2019, 0, 1),
      new Date(2025, 2, 31),
      { forceUpdate: true }
    );

    // 3. データの処理
    console.log('データを処理中...');
    await processRates.processRates();

    // 4. 保存データの確認
    console.log('保存データを確認中...');
    await checkStoredRates.checkStoredRates();

    console.log('すべての更新が完了しました。');
  } catch (error) {
    console.error('更新中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトの直接実行の場合
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('スクリプト実行エラー:', error);
    process.exit(1);
  });
}

export { main };