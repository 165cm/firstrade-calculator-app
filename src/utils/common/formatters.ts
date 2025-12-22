// src/utils/common/formatters.ts
// 通貨・数値フォーマットの共通ユーティリティ

/**
 * USD金額をフォーマット
 * @param value 金額
 * @param decimals 小数点以下桁数（デフォルト: 2）
 * @returns フォーマット済み文字列（例: "$1,234.56"）
 */
export function formatUSD(value: number, decimals = 2): string {
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * JPY金額をフォーマット（整数）
 * @param value 金額
 * @returns フォーマット済み文字列（例: "¥1,234"）
 */
export function formatJPY(value: number): string {
    const absValue = Math.abs(Math.round(value));
    const formatted = absValue.toLocaleString('ja-JP');
    return value < 0 ? `-¥${formatted}` : `¥${formatted}`;
}

/**
 * 符号付きUSD金額をフォーマット（損益表示用）
 * @param value 金額
 * @returns フォーマット済み文字列（例: "+$123.45" or "-$67.89"）
 */
export function formatUSDWithSign(value: number, decimals = 2): string {
    const prefix = value >= 0 ? '+' : '';
    return prefix + formatUSD(value, decimals);
}

/**
 * 符号付きJPY金額をフォーマット（損益表示用）
 * @param value 金額
 * @returns フォーマット済み文字列（例: "+¥1,234" or "-¥567"）
 */
export function formatJPYWithSign(value: number): string {
    const prefix = value >= 0 ? '+' : '';
    return prefix + formatJPY(value);
}

/**
 * パーセンテージをフォーマット
 * @param value 値（0.1234 = 12.34%）
 * @param decimals 小数点以下桁数
 * @returns フォーマット済み文字列（例: "12.34%"）
 */
export function formatPercent(value: number, decimals = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 為替レートをフォーマット
 * @param rate レート
 * @returns フォーマット済み文字列（例: "¥150.25"）
 */
export function formatExchangeRate(rate: number): string {
    return `¥${rate.toFixed(2)}`;
}
