// src/utils/portfolio/exportCsv.ts
import type { PortfolioSummary } from '@/types/portfolio';

/**
 * ポートフォリオデータをCSV形式で生成
 */
export function generatePortfolioCsv(summary: PortfolioSummary): string {
    const { portfolio, allocationStatus, riskIndicators, sectorBreakdown } = summary;
    const lines: string[] = [];

    // BOM (Excelで開く際の文字化け対策)
    const BOM = '\uFEFF';

    // サマリーセクション
    lines.push('=== ポートフォリオ概要 ===');
    lines.push(`銘柄数,${portfolio.holdings.length}`);
    lines.push(`取得価額合計,"$${portfolio.totalCost.toFixed(2)}"`);
    lines.push(`時価総額合計,"$${portfolio.totalValue.toFixed(2)}"`);
    lines.push(`含み損益,"$${portfolio.totalGainLoss.toFixed(2)}"`);
    const gainPercent = portfolio.totalCost > 0 ? (portfolio.totalGainLoss / portfolio.totalCost) * 100 : 0;
    lines.push(`含み損益率,${gainPercent.toFixed(2)}%`);
    lines.push('');

    // リスク指標
    lines.push('=== リスク指標 ===');
    lines.push(`分散スコア,${riskIndicators.diversificationScore}`);
    lines.push(`集中度,${riskIndicators.concentrationRisk.toFixed(2)}%`);
    lines.push(`セクター集中度,${riskIndicators.sectorConcentration.toFixed(2)}%`);
    lines.push('');

    // 資産配分
    lines.push('=== 資産配分 ===');
    lines.push('カテゴリ,現在の金額,現在の割合,目標割合,差分');
    allocationStatus.forEach(status => {
        lines.push(`${status.name},"$${status.currentValue.toFixed(2)}",${status.currentPercent.toFixed(2)}%,${status.targetPercent.toFixed(2)}%,${status.deviationPercent.toFixed(2)}%`);
    });
    lines.push('');

    // セクター内訳
    if (sectorBreakdown && sectorBreakdown.length > 0) {
        lines.push('=== セクター内訳 ===');
        lines.push('セクター,金額,割合');
        sectorBreakdown.forEach(sector => {
            lines.push(`${sector.sector},"$${sector.value.toFixed(2)}",${sector.percent.toFixed(2)}%`);
        });
        lines.push('');
    }

    // 保有銘柄詳細
    lines.push('=== 保有銘柄詳細 ===');
    lines.push('シンボル,数量,取得単価,取得価額,現在価格,時価,含み損益,損益率,セクター,資産クラス');
    portfolio.holdings.forEach(holding => {
        const gainLossPercent = holding.gainLossPercent || 0;
        lines.push([
            holding.symbol,
            holding.quantity.toFixed(4),
            `"$${holding.averageCost.toFixed(2)}"`,
            `"$${holding.totalCost.toFixed(2)}"`,
            `"$${(holding.currentPrice || 0).toFixed(2)}"`,
            `"$${(holding.currentValue || 0).toFixed(2)}"`,
            `"$${(holding.gainLoss || 0).toFixed(2)}"`,
            `${gainLossPercent.toFixed(2)}%`,
            holding.sector || '',
            holding.assetClass || ''
        ].join(','));
    });

    // 処理日時
    lines.push('');
    lines.push(`=== 出力日時: ${new Date().toLocaleString('ja-JP')} ===`);

    return BOM + lines.join('\n');
}

/**
 * CSVをダウンロード
 */
export function downloadPortfolioCsv(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
