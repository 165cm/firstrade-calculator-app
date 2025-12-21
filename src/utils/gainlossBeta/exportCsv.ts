// src/utils/gainlossBeta/exportCsv.ts

import type { GainLossSummary, GainLossEntry } from '@/types/gainlossBeta';

/**
 * 損益データをCSV形式でエクスポート
 */
export function generateGainLossCsv(summary: GainLossSummary): string {
    const headers = [
        'Term Type',
        'Symbol',
        'Description',
        'Qty',
        'Days Held',
        'Date Acquired',
        'Date Sold',
        'Sales Proceeds (USD)',
        'Adjusted Cost (USD)',
        'WS Loss Disallowed (USD)',
        'Net Gain/Loss (USD)',
        'Exchange Rate (Acquired)',
        'Exchange Rate (Sold)',
        'Sales Proceeds (JPY)',
        'Adjusted Cost (JPY)',
        'Net Gain/Loss (JPY)',
        'Wash Sale'
    ];

    const rows: string[][] = [];

    // ヘッダー行
    rows.push(headers);

    // 取引データ
    summary.entries.forEach((entry: GainLossEntry) => {
        rows.push([
            entry.termType === 'short' ? 'Short Term' : 'Long Term',
            entry.symbol,
            `"${entry.description}"`,
            entry.qty.toString(),
            entry.daysHeld.toString(),
            entry.dateAcquired,
            entry.dateSold,
            entry.salesProceeds.toFixed(2),
            entry.adjustedCost.toFixed(2),
            entry.wsLossDisallowed.toFixed(2),
            entry.netGainLoss.toFixed(2),
            (entry.exchangeRateAcquired || 0).toFixed(2),
            (entry.exchangeRateSold || 0).toFixed(2),
            Math.round(entry.salesProceedsJpy || 0).toString(),
            Math.round(entry.adjustedCostJpy || 0).toString(),
            Math.round(entry.netGainLossJpy || 0).toString(),
            entry.isWashSale ? 'Yes' : 'No'
        ]);
    });

    // 空行
    rows.push([]);

    // サマリー
    rows.push(['--- Summary ---']);
    rows.push([]);

    rows.push(['', 'Sales Proceeds (USD)', 'Adjusted Cost (USD)', 'Net Gain/Loss (USD)', 'Gain %', 'Sales Proceeds (JPY)', 'Adjusted Cost (JPY)', 'Net Gain/Loss (JPY)']);

    rows.push([
        'Short Term',
        summary.shortTerm.salesProceeds.toFixed(2),
        summary.shortTerm.adjustedCost.toFixed(2),
        summary.shortTerm.netGainLoss.toFixed(2),
        summary.shortTerm.gainPercent.toFixed(2) + '%',
        Math.round(summary.shortTerm.salesProceedsJpy || 0).toString(),
        Math.round(summary.shortTerm.adjustedCostJpy || 0).toString(),
        Math.round(summary.shortTerm.netGainLossJpy || 0).toString()
    ]);

    rows.push([
        'Long Term',
        summary.longTerm.salesProceeds.toFixed(2),
        summary.longTerm.adjustedCost.toFixed(2),
        summary.longTerm.netGainLoss.toFixed(2),
        summary.longTerm.gainPercent.toFixed(2) + '%',
        Math.round(summary.longTerm.salesProceedsJpy || 0).toString(),
        Math.round(summary.longTerm.adjustedCostJpy || 0).toString(),
        Math.round(summary.longTerm.netGainLossJpy || 0).toString()
    ]);

    rows.push([
        'Total',
        summary.total.salesProceeds.toFixed(2),
        summary.total.adjustedCost.toFixed(2),
        summary.total.netGainLoss.toFixed(2),
        summary.total.gainPercent.toFixed(2) + '%',
        Math.round(summary.total.salesProceedsJpy || 0).toString(),
        Math.round(summary.total.adjustedCostJpy || 0).toString(),
        Math.round(summary.total.netGainLossJpy || 0).toString()
    ]);

    return rows.map(row => row.join(',')).join('\n');
}

/**
 * CSVをダウンロード
 */
export function downloadCsv(csv: string, filename: string): void {
    // BOM付きUTF-8でExcel対応
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}
