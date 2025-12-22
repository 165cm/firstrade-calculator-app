// src/utils/export/csvExport.ts
import { ConvertedDividendRecord } from '@/types/dividend';
import { TradeDetail } from '@/types/gainloss';
import Papa from 'papaparse';
import { extractWithholdingAmount } from '../withholding';

// 配当金データのエクスポート関数を修正
// src/utils/export/csvExport.ts

export function exportDividendToCsv(records: ConvertedDividendRecord[]): string {
  // 配当データのみをフィルタリング
  const dividendRecords = records.filter(r =>
    r.Action.toUpperCase() === 'DIVIDEND' ||
    r.Action.toUpperCase() === 'INTEREST'
  );

  // 明細データの変換
  const detailRows = dividendRecords.map(record => {
    const withholding = extractWithholdingAmount(record);
    return {
      '支払日': record.TradeDate,
      '銘柄': record.Symbol,
      '配当金額(USD)': record.Amount.toFixed(2),
      '源泉徴収(USD)': withholding ? (-withholding).toFixed(2) : '',
      '為替レート': record.exchangeRate.toFixed(2),
      '配当金額(円)': Math.round(record.amountJPY).toLocaleString(),
      '源泉徴収(円)': withholding ? Math.round(-withholding * record.exchangeRate).toLocaleString() : '',
      '種別': record.Action.toUpperCase()
    };
  });

  // 合計の計算
  const totals = dividendRecords.reduce((sum, record) => {
    const withholding = extractWithholdingAmount(record) || 0;
    return {
      usdDividend: sum.usdDividend + record.Amount,
      usdWithholding: sum.usdWithholding + withholding,
      jpyDividend: sum.jpyDividend + record.amountJPY,
      jpyWithholding: sum.jpyWithholding + (withholding * record.exchangeRate)
    };
  }, {
    usdDividend: 0,
    usdWithholding: 0,
    jpyDividend: 0,
    jpyWithholding: 0
  });

  // 月次合計の計算を追加
  const monthlyTotals = dividendRecords.reduce((acc, record) => {
    const month = record.TradeDate.substring(5, 7);
    const withholding = extractWithholdingAmount(record) || 0;

    if (!acc[month]) {
      acc[month] = {
        usdDividend: 0,
        usdWithholding: 0,
        jpyDividend: 0,
        jpyWithholding: 0
      };
    }

    acc[month].usdDividend += record.Amount;
    acc[month].usdWithholding += withholding;
    acc[month].jpyDividend += record.amountJPY;
    acc[month].jpyWithholding += withholding * record.exchangeRate;

    return acc;
  }, {} as Record<string, typeof totals>);

  // フッター行の作成（年間合計と月次合計を含む）
  const footerRows = [
    // 空行
    {
      '支払日': '',
      '銘柄': '',
      '配当金額(USD)': '',
      '源泉徴収(USD)': '',
      '為替レート': '',
      '配当金額(円)': '',
      '源泉徴収(円)': '',
      '種別': ''
    },
    // 年間合計
    {
      '支払日': '年間合計',
      '銘柄': '',
      '配当金額(USD)': totals.usdDividend.toFixed(2),
      '源泉徴収(USD)': (-totals.usdWithholding).toFixed(2),
      '為替レート': '',
      '配当金額(円)': Math.round(totals.jpyDividend).toLocaleString(),
      '源泉徴収(円)': Math.round(-totals.jpyWithholding).toLocaleString(),
      '種別': ''
    },
    // 空行
    {
      '支払日': '',
      '銘柄': '',
      '配当金額(USD)': '',
      '源泉徴収(USD)': '',
      '為替レート': '',
      '配当金額(円)': '',
      '源泉徴収(円)': '',
      '種別': ''
    },
    // 月次合計
    ...Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      const monthData = monthlyTotals[month] || {
        usdDividend: 0,
        usdWithholding: 0,
        jpyDividend: 0,
        jpyWithholding: 0
      };

      return {
        '支払日': `${month}月計`,
        '銘柄': '',
        '配当金額(USD)': monthData.usdDividend.toFixed(2),
        '源泉徴収(USD)': (-monthData.usdWithholding).toFixed(2),
        '為替レート': '',
        '配当金額(円)': Math.round(monthData.jpyDividend).toLocaleString(),
        '源泉徴収(円)': Math.round(-monthData.jpyWithholding).toLocaleString(),
        '種別': ''
      };
    })
  ];

  // すべての行を結合
  const allRows = [...detailRows, ...footerRows];

  return Papa.unparse(allRows, {
    header: true,
    columns: [
      '支払日',
      '銘柄',
      '配当金額(USD)',
      '源泉徴収(USD)',
      '為替レート',
      '配当金額(円)',
      '源泉徴収(円)',
      '種別'
    ]
  });
}

export function downloadCsv(csvContent: string, filename: string): void {
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


import { SimulatorEntry } from '@/types/simulator';
import { Holding } from '@/types/portfolio';

// ... (existing helper functions if any need to be exposed or duplicated)

// シミュレーターデータのエクスポート関数
export function exportSimulatorToCsv(entries: SimulatorEntry[]): string {
  const csvData = entries.map(entry => ({
    '銘柄': entry.symbol,
    '数量': entry.qty.toFixed(4),
    '取得日': entry.dateAcquired,
    '取得時レート': entry.exchangeRateAcquired ? entry.exchangeRateAcquired.toFixed(2) : '-',
    '売却日': entry.dateSold,
    '売却時レート': entry.exchangeRateSold ? entry.exchangeRateSold.toFixed(2) : '-',
    '売却額($)': entry.salesProceeds.toFixed(2),
    '取得額($)': entry.adjustedCost.toFixed(2),
    '損益($)': entry.netGainLoss.toFixed(2),
    '売却額(円)': entry.salesProceedsJpy ? Math.round(entry.salesProceedsJpy).toLocaleString() : '-',
    '取得額(円)': entry.adjustedCostJpy ? Math.round(entry.adjustedCostJpy).toLocaleString() : '-',
    '損益(円)': entry.netGainLossJpy ? Math.round(entry.netGainLossJpy).toLocaleString() : '-',
    '区分': entry.termType === 'short' ? '短期' : '長期',
    'ウォッシュセール': entry.isWashSale ? '対象' : '-'
  }));

  return Papa.unparse(csvData, {
    header: true,
    columns: [
      '銘柄', '数量', '取得日', '取得時レート', '売却日', '売却時レート',
      '売却額($)', '取得額($)', '損益($)',
      '売却額(円)', '取得額(円)', '損益(円)',
      '区分', 'ウォッシュセール'
    ]
  });
}

// ポートフォリオデータのエクスポート関数
export function exportPortfolioToCsv(holdings: Holding[]): string {
  const csvData = holdings.map(holding => ({
    '銘柄': holding.symbol,
    '数量': holding.quantity.toFixed(4),
    '平均取得単価($)': holding.averageCost.toFixed(2),
    '現在価格($)': holding.currentPrice ? holding.currentPrice.toFixed(2) : '-',
    '取得総額($)': holding.totalCost.toFixed(2),
    '評価額($)': holding.currentValue ? holding.currentValue.toFixed(2) : '-',
    '損益($)': holding.gainLoss ? holding.gainLoss.toFixed(2) : '-',
    '損益率(%)': holding.gainLossPercent ? `${holding.gainLossPercent.toFixed(2)}%` : '-',
    'セクター': holding.sector || '-',
    '資産クラス': holding.assetClass || '-'
  }));

  return Papa.unparse(csvData, {
    header: true,
    columns: [
      '銘柄', '数量', '平均取得単価($)', '現在価格($)',
      '取得総額($)', '評価額($)', '損益($)', '損益率(%)',
      'セクター', '資産クラス'
    ]
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}
