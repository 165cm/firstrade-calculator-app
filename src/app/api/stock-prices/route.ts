// src/app/api/stock-prices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

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

    try {
        await Promise.all(symbols.map(async (symbol) => {
            try {
                // yahoo-finance2 quote returns a Quote object which has regularMarketPrice
                const quote = await yahooFinance.quote(symbol);

                // Use a type guard or optional chaining with specific access
                const price = quote?.regularMarketPrice;

                if (typeof price !== 'number') {
                    results[symbol] = null;
                    errors.push(`${symbol}: No price data found`);
                    return;
                }

                results[symbol] = price;

            } catch (err) {
                console.error(`Failed to fetch ${symbol}:`, err);
                // Suppress error details to client to avoid exposing internal logic
                results[symbol] = null;
                // Only log generic error to client or "Not found"
                if (err instanceof Error && err.message.includes('404')) {
                    errors.push(`${symbol}: Not found`);
                } else {
                    errors.push(`${symbol}: Fetch failed`);
                }
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
