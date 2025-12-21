// src/utils/gainlossBeta/parseGainLoss.ts

import type { GainLossEntry, GainLossSummary, TermSummary } from '@/types/gainlossBeta';

/**
 * 金額文字列をパース（$1,234.56 や -$1,234.56 形式）
 */
function parseAmount(str: string): number {
    if (!str) return 0;
    // $, カンマを除去、-$を-に変換
    const cleaned = str.replace(/[$,]/g, '').trim();
    return parseFloat(cleaned) || 0;
}

/**
 * 日付文字列をパース（MM/DD/YYYY -> YYYY-MM-DD）
 */
function parseDate(str: string): string {
    if (!str) return '';
    const parts = str.trim().split('/');
    if (parts.length !== 3) return '';
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * 数値文字列をパース（カンマ付き数値対応）
 */
function parseNumber(str: string): number {
    if (!str) return 0;
    const cleaned = str.replace(/,/g, '').trim();
    return parseFloat(cleaned) || 0;
}

/**
 * Wash Sale フラグの検出
 */
function hasWashSaleFlag(str: string): boolean {
    return str.includes('WS') || str.includes('Wash Sale');
}

/**
 * ダッシュボードからコピーされたテキストをパースして損益エントリを取得
 */
export function parseGainLossText(text: string): { entries: GainLossEntry[], shortTermSummary: TermSummary | null, longTermSummary: TermSummary | null } {
    const entries: GainLossEntry[] = [];
    const lines = text.trim().split('\n');

    let currentTermType: 'short' | 'long' = 'short';
    let shortTermSummary: TermSummary | null = null;
    let longTermSummary: TermSummary | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Short Term ヘッダーを検出
        if (line.includes('Short Term')) {
            currentTermType = 'short';
            // サマリー行をパース
            const summaryMatch = line.match(/Sales Proceeds\s*=\s*\$?([\d,]+\.?\d*)\s*Adjusted Cost\s*=\s*\$?([\d,]+\.?\d*)\s*WS Loss Disallowed\s*=\s*\$?([\d,]+\.?\d*)\s*(?:Gain|Loss)\s*=\s*(-?\$?[\d,]+\.?\d*)\s*\((-?[\d.]+)%\)/i);
            if (summaryMatch) {
                shortTermSummary = {
                    salesProceeds: parseNumber(summaryMatch[1]),
                    adjustedCost: parseNumber(summaryMatch[2]),
                    wsLossDisallowed: parseNumber(summaryMatch[3]),
                    netGainLoss: parseAmount(summaryMatch[4]),
                    gainPercent: parseFloat(summaryMatch[5]) || 0
                };
            }
            continue;
        }

        // Long Term ヘッダーを検出
        if (line.includes('Long Term')) {
            currentTermType = 'long';
            // サマリー行をパース
            const summaryMatch = line.match(/Sales Proceeds\s*=\s*\$?([\d,]+\.?\d*)\s*Adjusted Cost\s*=\s*\$?([\d,]+\.?\d*)\s*WS Loss Disallowed\s*=\s*\$?([\d,]+\.?\d*)\s*(?:Gain|Loss)\s*=\s*(-?\$?[\d,]+\.?\d*)\s*\((-?[\d.]+)%\)/i);
            if (summaryMatch) {
                longTermSummary = {
                    salesProceeds: parseNumber(summaryMatch[1]),
                    adjustedCost: parseNumber(summaryMatch[2]),
                    wsLossDisallowed: parseNumber(summaryMatch[3]),
                    netGainLoss: parseAmount(summaryMatch[4]),
                    gainPercent: parseFloat(summaryMatch[5]) || 0
                };
            }
            continue;
        }

        // ヘッダー行やフッター行をスキップ
        if (line.startsWith('Symbol') ||
            line.includes('Show') ||
            line.includes('entries') ||
            line.includes('Page') ||
            line.includes('Next') ||
            line.includes('Total Realized') ||
            line.includes('Items')) {
            continue;
        }

        // データ行をパース
        // タブまたは複数スペースで分割
        const parts = line.split(/\t+/).map(p => p.trim()).filter(p => p);

        if (parts.length < 10) continue;

        const symbol = parts[0];

        // シンボルが空または数字だけの場合スキップ
        if (!symbol || /^\d+$/.test(symbol)) continue;

        try {
            const entry: GainLossEntry = {
                symbol: symbol,
                description: parts[1] || '',
                qty: parseNumber(parts[2]),
                daysHeld: parseInt(parts[3].replace(/,/g, '')) || 0,
                dateAcquired: parseDate(parts[4]),
                dateSold: parseDate(parts[5]),
                salesProceeds: parseAmount(parts[6]),
                adjustedCost: parseAmount(parts[7]),
                wsLossDisallowed: parseAmount(parts[8]),
                netGainLoss: parseAmount(parts[9]),
                isWashSale: hasWashSaleFlag(parts[9] || ''),
                termType: currentTermType
            };

            // 有効なエントリのみ追加
            if (entry.symbol && entry.dateAcquired && entry.dateSold) {
                entries.push(entry);
            }
        } catch (error) {
            console.debug('行のパースをスキップ:', { line, error });
        }
    }

    return { entries, shortTermSummary, longTermSummary };
}

/**
 * エントリからサマリーを計算
 */
export function calculateSummaryFromEntries(entries: GainLossEntry[]): { shortTerm: TermSummary, longTerm: TermSummary, total: TermSummary } {
    const shortTermEntries = entries.filter(e => e.termType === 'short');
    const longTermEntries = entries.filter(e => e.termType === 'long');

    const calcTermSummary = (items: GainLossEntry[]): TermSummary => {
        const salesProceeds = items.reduce((sum, e) => sum + e.salesProceeds, 0);
        const adjustedCost = items.reduce((sum, e) => sum + e.adjustedCost, 0);
        const wsLossDisallowed = items.reduce((sum, e) => sum + e.wsLossDisallowed, 0);
        const netGainLoss = items.reduce((sum, e) => sum + e.netGainLoss, 0);
        const salesProceedsJpy = items.reduce((sum, e) => sum + (e.salesProceedsJpy || 0), 0);
        const adjustedCostJpy = items.reduce((sum, e) => sum + (e.adjustedCostJpy || 0), 0);
        const netGainLossJpy = items.reduce((sum, e) => sum + (e.netGainLossJpy || 0), 0);

        return {
            salesProceeds,
            adjustedCost,
            wsLossDisallowed,
            netGainLoss,
            gainPercent: adjustedCost > 0 ? (netGainLoss / adjustedCost) * 100 : 0,
            salesProceedsJpy,
            adjustedCostJpy,
            netGainLossJpy
        };
    };

    const shortTerm = calcTermSummary(shortTermEntries);
    const longTerm = calcTermSummary(longTermEntries);
    const total = calcTermSummary(entries);

    return { shortTerm, longTerm, total };
}

/**
 * 完全なサマリーを構築
 */
export function buildGainLossSummary(
    entries: GainLossEntry[],
    shortTermSummary: TermSummary | null,
    longTermSummary: TermSummary | null
): GainLossSummary {
    const calculated = calculateSummaryFromEntries(entries);

    // ヘッダーからのサマリーがあればそれを使用、なければ計算値を使用
    const shortTerm: TermSummary = shortTermSummary ? {
        ...shortTermSummary,
        salesProceedsJpy: calculated.shortTerm.salesProceedsJpy,
        adjustedCostJpy: calculated.shortTerm.adjustedCostJpy,
        netGainLossJpy: calculated.shortTerm.netGainLossJpy
    } : calculated.shortTerm;

    const longTerm: TermSummary = longTermSummary ? {
        ...longTermSummary,
        salesProceedsJpy: calculated.longTerm.salesProceedsJpy,
        adjustedCostJpy: calculated.longTerm.adjustedCostJpy,
        netGainLossJpy: calculated.longTerm.netGainLossJpy
    } : calculated.longTerm;

    const total: TermSummary = {
        salesProceeds: shortTerm.salesProceeds + longTerm.salesProceeds,
        adjustedCost: shortTerm.adjustedCost + longTerm.adjustedCost,
        wsLossDisallowed: shortTerm.wsLossDisallowed + longTerm.wsLossDisallowed,
        netGainLoss: shortTerm.netGainLoss + longTerm.netGainLoss,
        gainPercent: (shortTerm.adjustedCost + longTerm.adjustedCost) > 0
            ? ((shortTerm.netGainLoss + longTerm.netGainLoss) / (shortTerm.adjustedCost + longTerm.adjustedCost)) * 100
            : 0,
        salesProceedsJpy: (shortTerm.salesProceedsJpy || 0) + (longTerm.salesProceedsJpy || 0),
        adjustedCostJpy: (shortTerm.adjustedCostJpy || 0) + (longTerm.adjustedCostJpy || 0),
        netGainLossJpy: (shortTerm.netGainLossJpy || 0) + (longTerm.netGainLossJpy || 0)
    };

    return {
        shortTerm,
        longTerm,
        total,
        entries,
        processedAt: new Date().toISOString()
    };
}
