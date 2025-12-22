// src/utils/stockPrice/yahooFinance.ts

export interface StockPriceResult {
    prices: Record<string, number | null>;
    errors?: string[];
    fetchedAt: string;
}

export interface FetchStockPricesResponse {
    success: boolean;
    data?: StockPriceResult;
    error?: string;
}

/**
 * Fetch stock prices from Yahoo Finance via API route
 * @param symbols Array of stock symbols to fetch
 * @returns Promise with prices and any errors
 */
export async function fetchStockPrices(symbols: string[]): Promise<FetchStockPricesResponse> {
    if (symbols.length === 0) {
        return {
            success: false,
            error: 'No symbols provided'
        };
    }

    try {
        const response = await fetch(
            `/api/stock-prices?symbols=${encodeURIComponent(symbols.join(','))}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error || `HTTP Error: ${response.status}`
            };
        }

        const data = await response.json();

        return {
            success: true,
            data: {
                prices: data.prices,
                errors: data.errors,
                fetchedAt: data.fetchedAt
            }
        };
    } catch (error) {
        console.error('Failed to fetch stock prices:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

/**
 * Extract successful prices from the result
 */
export function getSuccessfulPrices(result: StockPriceResult): Record<string, number> {
    const successfulPrices: Record<string, number> = {};

    for (const [symbol, price] of Object.entries(result.prices)) {
        if (price !== null) {
            successfulPrices[symbol] = price;
        }
    }

    return successfulPrices;
}
