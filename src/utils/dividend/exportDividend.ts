// src/utils/dividend/exportDividend.ts
import type { ConvertedDividendRecord } from '@/types/dividend';

export function exportDividendToCSV(data: ConvertedDividendRecord[]): void {
  // ヘッダー行の定義
  const headers = [
    '銘柄コード',
    '支払日',
    'USD金額',
    '為替レート',
    '円換算額',
    '種別',
    '備考'
  ];

  // データ行の作成
  const rows = data.map(record => [
    record.Symbol,
    record.TradeDate,
    record.Amount.toFixed(2),
    record.exchangeRate.toFixed(2),
    record.amountJPY.toFixed(0),
    record.Action,
    record.Description
  ]);

  // CSVデータの作成
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // ダウンロードの実行
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `dividend_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}