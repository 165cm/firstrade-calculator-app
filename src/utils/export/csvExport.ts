// src/utils/export/csvExport.ts
import { ConvertedDividendRecord } from '@/types/dividend';
import { TradeDetail } from '@/types/gainloss';
import Papa from 'papaparse';

// 配当金データのエクスポート関数を修正
export function exportDividendToCsv(records: ConvertedDividendRecord[]): string {
  const csvData = records.map(record => ({
    // 各フィールドを確実にマッピング
    '支払日': record.TradeDate,
    '銘柄': record.Symbol,
    '配当金（USD）': record.Amount.toFixed(2),
    '為替レート': record.exchangeRate.toFixed(2),
    '配当金（円）': Math.round(record.amountJPY).toLocaleString(),
    '種別': record.Action.toUpperCase()
  }));

  // データの存在確認とデバッグログ
  console.log('Export Data:', {
    recordCount: records.length,
    firstRecord: records[0],
    csvData: csvData[0]
  });

  // CSVファイルの生成（列名を日本語で直接指定）
  return Papa.unparse(csvData, {
    header: true,
    columns: ['支払日', '銘柄', '配当金（USD）', '為替レート', '配当金（円）', '種別']
  });
}

// 損益計算データのエクスポート関数
export function exportGainLossToCsv(trades: TradeDetail[]): string {
  const csvData = trades.map(trade => ({
    '購入日': formatDate(trade.purchaseDate),
    '購入時為替': trade.purchaseRate.toFixed(2),
    '売却日': formatDate(trade.saleDate),
    '売却時為替': trade.saleRate.toFixed(2),
    '銘柄': trade.symbol,
    '数量': trade.quantity.toFixed(4),
    '取得価格($)': trade.cost.toFixed(2),
    '売却価格($)': trade.proceeds.toFixed(2),
    '損益($)': trade.gainLoss.toFixed(2),
    '取得価格(¥)': Math.round(trade.costJPY).toLocaleString(),
    '売却価格(¥)': Math.round(trade.proceedsJPY).toLocaleString(),
    '損益(¥)': Math.round(trade.gainLossJPY).toLocaleString(),
    '損益率(¥)': `${Math.round((trade.proceedsJPY / trade.costJPY - 1) * 100)}%`
  }));

  // データの存在確認とデバッグログ
  console.log('Export GainLoss Data:', {
    recordCount: trades.length,
    firstRecord: trades[0],
    csvData: csvData[0]
  });

  return Papa.unparse(csvData, {
    header: true,
    columns: [
      '購入日', '購入時為替', '売却日', '売却時為替', '銘柄', '数量',
      '取得価格($)', '売却価格($)', '損益($)',
      '取得価格(¥)', '売却価格(¥)', '損益(¥)', '損益率(¥)'
    ]
  });
}

// CSVダウンロード用のユーティリティ関数
export function downloadCsv(csvContent: string, filename: string): void {
  // BOMを追加してExcelでの文字化けを防ぐ
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvContent], { 
    type: 'text/csv;charset=utf-8' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}