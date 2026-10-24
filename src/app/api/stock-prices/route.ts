// src/app/api/stock-prices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { createRateLimiter, getClientIP } from '@/lib/rateLimit';

// yahoo-finance2 v3 ではインスタンス生成が必須（静的呼び出しは常に例外になる）
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// 1分あたり20リクエストまで（1リクエストで最大50銘柄）
const checkRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 20 });

// ティッカーシンボルとして許可する形式（例: AAPL, BRK.B, ^GSPC, USDJPY=X）
const SYMBOL_PATTERN = /^[A-Za-z0-9.\-^=]{1,15}$/;

// 同一銘柄への外部リクエストを抑えるための短期キャッシュ
const PRICE_CACHE_TTL_MS = 60 * 1000;
const PRICE_CACHE_MAX_SIZE = 2000;
const priceCache = new Map<string, { price: number; expiresAt: number }>();

function getCachedPrice(symbol: string): number | undefined {
    const cached = priceCache.get(symbol);
    if (!cached) return undefined;
    if (Date.now() > cached.expiresAt) {
        priceCache.delete(symbol);
        return undefined;
    }
    return cached.price;
}

function setCachedPrice(symbol: string, price: number): void {
    if (priceCache.size >= PRICE_CACHE_MAX_SIZE) {
        priceCache.clear();
    }
    priceCache.set(symbol, { price, expiresAt: Date.now() + PRICE_CACHE_TTL_MS });
}

export async function GET(request: NextRequest) {
    const rateLimit = checkRateLimit(getClientIP(request));
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { success: false, error: 'Too many requests' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)) } }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
        return NextResponse.json({ success: false, error: 'No symbols provided' }, { status: 400 });
    }

    if (symbolsParam.length > 1000) {
        return NextResponse.json({ success: false, error: 'Too many symbols (max 50)' }, { status: 400 });
    }

    const symbols = Array.from(new Set(
        symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0)
    ));

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
            // 不正な形式の銘柄は外部APIに問い合わせない（他の銘柄の取得は継続）
            if (!SYMBOL_PATTERN.test(symbol)) {
                results[symbol] = null;
                errors.push(`${symbol.slice(0, 15)}: Invalid symbol`);
                return;
            }

            const cachedPrice = getCachedPrice(symbol);
            if (cachedPrice !== undefined) {
                results[symbol] = cachedPrice;
                return;
            }

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
                setCachedPrice(symbol, price);

            } catch (err) {
                console.error(`Failed to fetch ${symbol}:`, err instanceof Error ? err.message : err);
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
