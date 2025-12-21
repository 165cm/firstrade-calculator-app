// src/app/api/stock-prices/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
        return NextResponse.json({ success: false, error: 'No symbols provided' }, { status: 400 });
    }

    const symbols = symbolsParam.split(',').map(s => s.trim()).filter(s => s.length > 0);

    if (symbols.length === 0) {
        return NextResponse.json({ success: false, error: 'No valid symbols provided' }, { status: 400 });
    }

    if (symbols.length > 50) {
        return NextResponse.json({ success: false, error: 'Too many symbols (max 50)' }, { status: 400 });
    }

    const results: Record<string, number | null> = {};
    const errors: string[] = [];

    // Use V8 Chart endpoint which is currently more consistent without auth than V7 Quote
    try {
        await Promise.all(symbols.map(async (symbol) => {
            try {
                // Use invalid tickers to speed up failure? No.
                // Fetch basic 1d chart to get meta data including price
                const fetchUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d`;
                // Add minimal headers just in case
                const response = await fetch(fetchUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    next: { revalidate: 60 } // Cache for 60 seconds
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        results[symbol] = null;
                        errors.push(`${symbol}: Not found`);
                        return;
                    }
                    throw new Error(`API Error ${response.status}`);
                }

                const data = await response.json();
                const result = data?.chart?.result?.[0];

                if (!result || !result.meta) {
                    results[symbol] = null;
                    errors.push(`${symbol}: No data`);
                    return;
                }

                const price = result.meta.regularMarketPrice;
                if (typeof price === 'number') {
                    results[symbol] = price;
                } else {
                    results[symbol] = null;
                    errors.push(`${symbol}: No price in meta`);
                }

            } catch (err) {
                console.error(`Failed to fetch ${symbol}:`, err);
                results[symbol] = null;
                errors.push(`${symbol}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }));

    } catch (criticalError) {
        console.error('Critical error in processing:', criticalError);
        return NextResponse.json({
            success: false,
            error: 'Internal processing error',
            fetchedAt: new Date().toISOString()
        }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        prices: results,
        errors: errors.length > 0 ? errors : undefined,
        fetchedAt: new Date().toISOString()
    });
}
